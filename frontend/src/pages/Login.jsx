import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Button, Field, Icon, Input, Segmented } from '../components/ui';
import { useApp } from '../store/AppContext';
import { DEMO_ACCOUNTS, ROLE_LABEL } from '../data/mock';
import { isEmail } from '../lib/format';

const HOME = { professional: '/dashboard', company: '/empresa', admin: '/admin' };
const ROLES = [
  { value: 'professional', label: 'Profesional' },
  { value: 'company', label: 'Empresa' },
  { value: 'admin', label: 'Administrador' },
];

export default function Login() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState('professional');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    const known = state.users.find((u) => u.email === email.trim().toLowerCase());
    if (!email.trim()) next.email = 'Escribe tu correo electrónico.';
    else if (!isEmail(email.trim())) next.email = 'El correo debe tener el formato nombre@dominio.com.';
    else if (known && known.status === 'inactive') next.email = 'Esta cuenta está desactivada. Pide a un administrador que la active.';
    else if (known && known.role !== role) next.email = `Ese correo es de una cuenta ${ROLE_LABEL[known.role].toLowerCase()}. Cambia el tipo de cuenta arriba.`;
    if (!password) next.password = 'Escribe tu contraseña.';
    else if (password.length < 6) next.password = 'La contraseña tiene al menos 6 caracteres.';
    return next;
  };

  const submit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    actions.login(role, email.trim().toLowerCase());
    navigate(HOME[role]);
  };

  const useDemo = () => {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword('password');
    setErrors({});
  };

  const changeRole = (value) => {
    setRole(value);
    setErrors({});
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold">Inicia sesión</h1>
      <p className="mt-2 text-muted">Entra para ver tus ofertas, tus vacantes o el panel de administración.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <Segmented label="Tipo de cuenta" options={ROLES} value={role} onChange={changeRole} />

        <Field label="Correo electrónico" error={errors.email}>
          {(props) => (
            <Input {...props} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@correo.com" />
          )}
        </Field>

        <Field label="Contraseña" error={errors.password}>
          {(props) => (
            <div className="relative">
              <Input
                {...props}
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted hover:text-ink"
              >
                <Icon name={show ? 'eyeoff' : 'eye'} className="h-5 w-5" />
              </button>
            </div>
          )}
        </Field>

        <Button type="submit" className="w-full py-3">
          Iniciar sesión
        </Button>
      </form>

      <button type="button" onClick={useDemo} className="mt-4 text-sm font-semibold text-brand hover:underline">
        Usar la cuenta de prueba ({ROLE_LABEL[role].toLowerCase()})
      </button>

      <p className="mt-8 text-sm text-muted">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-brand hover:underline">
          Crea una gratis
        </Link>
      </p>
    </AuthLayout>
  );
}
