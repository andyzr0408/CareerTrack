<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Crea la cuenta (profesional o empresa) con su perfil y devuelve el token. */
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'role_id' => Role::firstOrCreate(['name' => $data['role']])->id,
                'email' => $data['email'],
                'password' => $data['password'], // el cast "hashed" del modelo la encripta
                'status' => User::STATUS_ACTIVE,
            ]);

            if ($data['role'] === Role::PROFESSIONAL) {
                $user->professionalProfile()->create([
                    'full_name' => $data['full_name'],
                    'headline' => $data['headline'] ?? null,
                ]);
            } else {
                $user->company()->create([
                    'trade_name' => $data['trade_name'],
                    'tax_id' => $data['tax_id'],
                ]);
            }

            return $user;
        });

        return $this->respondWithToken($user, 201);
    }

    /** Valida las credenciales y entrega un token Bearer de Sanctum. */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::with('role')->where('email', $request->validated('email'))->first();

        // Mismo mensaje si el correo no existe o la clave falla: no se revela cuál de los dos
        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages(['email' => [__('auth.failed')]]);
        }

        if (! $user->isActive()) {
            abort(403, __('auth.inactive'));
        }

        $expectedRole = $request->validated('role');
        if ($expectedRole && $user->role->name !== $expectedRole) {
            throw ValidationException::withMessages([
                'email' => [__('auth.wrong_role', ['role' => __('auth.roles.'.$expectedRole)])],
            ]);
        }

        return $this->respondWithToken($user);
    }

    /** Revoca solo el token con el que se hizo la petición. */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => __('auth.logged_out')]);
    }

    /** Usuario autenticado con su perfil o empresa. */
    public function me(Request $request): UserResource
    {
        return new UserResource($this->withProfile($request->user()));
    }

    /** Baja lógica: se conserva el historial pero se cierra el acceso. */
    public function deactivate(Request $request): JsonResponse
    {
        $user = $request->user();

        // Evita dejar el sistema sin administradores por accidente
        abort_if($user->isAdmin(), 403, __('auth.self_deactivate'));

        $user->update(['status' => User::STATUS_INACTIVE]);
        $user->tokens()->delete();

        return response()->json(['message' => __('auth.deactivated')]);
    }

    private function respondWithToken(User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'token' => $user->createToken('careertrack')->plainTextToken,
            'user' => (new UserResource($this->withProfile($user)))->resolve(),
        ], $status);
    }

    private function withProfile(User $user): User
    {
        return $user->load(['role', 'professionalProfile.skills', 'company']);
    }
}
