import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Button, Field, Icon, Input, Segmented } from '../components/ui';
import { useApp } from '../store/AppContext';
import { DEMO_ACCOUNTS, ROLE_LABEL } from '../data/constants';
import { isEmail } from '../lib/format';
import { HOME_BY_ROLE, ROUTES } from '../routes';

const ROLES = [
  { value: 'professional', label: 'Profesional' },
  { value: 'company', label: 'Empresa' },
  { value: 'admin', label: 'Administrador' },
];

export default function Login() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState('professional');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Escribe tu correo electrónico.';
    else if (!isEmail(email.trim())) next.email = 'El correo debe tener el formato nombre@dominio.com.';
    if (!password) next.password = 'Escribe tu contraseña.';
    return next;
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const user = await actions.login({ email: email.trim().toLowerCase(), password, role });
      navigate(HOME_BY_ROLE[user.role]);
    } catch (error) {
      // 422: credenciales o tipo de cuenta incorrectos; 403: cuenta desactivada
      if (error.status === 422) setErrors({ email: error.first('email'), password: error.first('password') });
      else if (error.status === 403) setErrors({ email: error.message });
      else actions.toast(error.message, 'bad');
      setBusy(false);
    }
  };

  const useDemo = () => {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCOUNTS[role].password);
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

        <Button type="submit" className="w-full py-3" disabled={busy}>
          {busy ? 'Entrando…' : 'Iniciar sesión'}
        </Button>
      </form>

      <button type="button" onClick={useDemo} className="mt-4 text-sm font-semibold text-brand hover:underline">
        Usar la cuenta de prueba ({ROLE_LABEL[role].toLowerCase()})
      </button>

      <p className="mt-8 text-sm text-muted">
        ¿Aún no tienes cuenta?{' '}
        <Link to={ROUTES.register} className="font-semibold text-brand hover:underline">
          Crea una gratis
        </Link>
      </p>
    </AuthLayout>
  );
}
