import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Button, Field, Icon, Input, Segmented, cx } from '../components/ui';
import { useApp } from '../store/AppContext';
import { isEmail } from '../lib/format';

const ROLES = [
  { value: 'professional', label: 'Soy profesional' },
  { value: 'company', label: 'Soy empresa' },
];
const HOME = { professional: '/dashboard', company: '/empresa' };

/** 0 a 4 según largo y variedad de caracteres. */
function strength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}
const STRENGTH_LABEL = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];

export default function Register() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState('professional');
  const [form, setForm] = useState({ name: '', extra: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((cur) => ({ ...cur, [key]: undefined }));
  };

  const isCompany = role === 'company';
  const score = strength(form.password);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = isCompany ? 'Escribe el nombre comercial.' : 'Escribe tu nombre completo.';
    if (isCompany && !form.extra.trim()) next.extra = 'Escribe la identificación fiscal (RIF o NIT).';
    if (!isEmail(form.email.trim())) next.email = 'El correo debe tener el formato nombre@dominio.com.';
    else if (state.users.some((u) => u.email === form.email.trim().toLowerCase())) next.email = 'Ya existe una cuenta con ese correo. Inicia sesión.';
    if (form.password.length < 8) next.password = 'La contraseña tiene al menos 8 caracteres.';
    return next;
  };

  const submit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    actions.register(role, { name: form.name.trim(), extra: form.extra.trim(), email: form.email.trim().toLowerCase() });
    navigate(HOME[role]);
  };

  const changeRole = (value) => {
    setRole(value);
    setErrors({});
    setForm((f) => ({ ...f, name: '', extra: '' }));
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold">Crea tu cuenta</h1>
      <p className="mt-2 text-muted">Elige cómo vas a usar CareerTrack. El formulario se adapta.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <Segmented label="Tipo de cuenta" options={ROLES} value={role} onChange={changeRole} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={isCompany ? 'Nombre comercial' : 'Nombre completo'} error={errors.name}>
            {(props) => <Input {...props} value={form.name} onChange={set('name')} autoComplete={isCompany ? 'organization' : 'name'} placeholder={isCompany ? 'TechVentures Inc.' : 'Andrés Zerpa'} />}
          </Field>
          <Field label={isCompany ? 'Identificación fiscal' : 'Titular o cargo'} error={errors.extra} hint={isCompany ? 'RIF o NIT' : 'Opcional'}>
            {(props) => <Input {...props} value={form.extra} onChange={set('extra')} placeholder={isCompany ? 'J-12345678-9' : 'Desarrollador web'} />}
          </Field>
        </div>

        <Field label="Correo electrónico" error={errors.email}>
          {(props) => <Input {...props} type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="nombre@correo.com" />}
        </Field>

        <div>
          <Field label="Contraseña" error={errors.password}>
            {(props) => (
              <div className="relative">
                <Input {...props} type={show ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={set('password')} className="pr-11" />
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
          {form.password && (
            <div className="mt-2 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={cx('h-1.5 flex-1 rounded-full transition-colors', n <= score ? (score <= 1 ? 'bg-bad' : score === 2 ? 'bg-warn' : 'bg-ok') : 'bg-sunken')} />
                ))}
              </div>
              <span className="text-xs text-muted">{STRENGTH_LABEL[score]}</span>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full py-3">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/" className="font-semibold text-brand hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
