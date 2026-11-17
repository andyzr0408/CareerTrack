<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListUsersRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

/** Gestión de cuentas. */
class UserController extends Controller
{
    private const RELATIONS = ['role', 'professionalProfile', 'company'];

    public function index(ListUsersRequest $request)
    {
        $query = User::with(self::RELATIONS);

        if ($role = $request->validated('role')) {
            $query->whereHas('role', fn (Builder $q) => $q->where('name', $role));
        }

        if ($search = $request->validated('search')) {
            $query->where('email', 'like', $this->like($search));
        }

        $users = $query
            ->orderByDesc('id')
            ->paginate($request->perPage())
            ->withQueryString();

        return UserResource::collection($users);
    }

    /** Activar o desactivar una cuenta (baja lógica). */
    public function updateStatus(UpdateUserStatusRequest $request, int $id): UserResource
    {
        $user = User::findOrFail($id);
        $status = $request->validated('status');

        abort_if(
            $user->is($request->user()) && $status === User::STATUS_INACTIVE,
            403,
            __('auth.self_deactivate'),
        );

        $user->update(['status' => $status]);

        if ($status === User::STATUS_INACTIVE) {
            $user->tokens()->delete(); // cierra sus sesiones abiertas
        }

        return new UserResource($user->load(self::RELATIONS));
    }
}
