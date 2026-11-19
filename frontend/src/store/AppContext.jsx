import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { api, setUnauthorizedHandler } from '../lib/api';

const THEME_KEY = 'ct-theme';

// session = usuario autenticado tal como lo entrega la API (/me): { id, email, role, name, professional?, company? }
const initialState = {
  session: null,
  booting: true, // al abrir la página se pregunta a /me si hay una sesión (cookie) vigente
  skills: [], // catálogo [{ id, name }]
  toast: null,
};

let nextToast = 1;

function reducer(state, action) {
  switch (action.type) {
    case 'session/set':
      return { ...state, session: action.session, booting: false };
    case 'session/patch':
      return state.session ? { ...state, session: { ...state.session, ...action.patch } } : state;
    case 'session/clear':
      return { ...state, session: null, booting: false };
    case 'session/expired':
      // Solo avisa si había una sesión abierta; sin sesión no hay nada que expirar
      return state.session
        ? { ...state, session: null, toast: { id: nextToast++, message: 'Tu sesión expiró. Inicia sesión de nuevo.', tone: 'bad' } }
        : state;
    case 'skills/set':
      return { ...state, skills: action.skills };
    case 'toast':
      return { ...state, toast: { id: nextToast++, ...action.toast } };
    case 'toast/clear':
      return { ...state, toast: null };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(() => {
    const toast = (message, tone = 'ok') => dispatch({ type: 'toast', toast: { message, tone } });

    // El token llega en una cookie httpOnly; del JSON solo se usa el usuario.
    const startSession = ({ user }) => {
      dispatch({ type: 'session/set', session: user });
      return user;
    };

    return {
      toast,
      /** Lanza ApiError si las credenciales no sirven (422) o la cuenta está desactivada (403). */
      async login({ email, password, role }) {
        return startSession(await api.post('/login', { email, password, role }));
      },
      /** `data` = { role, email, password, full_name | trade_name, headline | tax_id }. */
      async register(data) {
        return startSession(await api.post('/register', data));
      },
      async logout() {
        try {
          await api.post('/logout', undefined, { silent401: true }); // el servidor borra la cookie
        } catch {
          // Si la sesión ya no servía, igual se cierra en pantalla.
        }
        dispatch({ type: 'session/clear' });
      },
      /** Actualiza el perfil profesional guardado en la sesión (skills, CV, nombre). */
      setProfessional(professional) {
        dispatch({ type: 'session/patch', patch: { professional } });
      },
      async reloadSkills() {
        const { data } = await api.get('/skills');
        dispatch({ type: 'skills/set', skills: data });
      },
    };
  }, []);

  // Al abrir la página: recupera la sesión si la cookie sigue vigente y carga el catálogo de skills.
  useEffect(() => {
    setUnauthorizedHandler(() => dispatch({ type: 'session/expired' }));

    api
      .get('/me', undefined, { silent401: true })
      .then(({ data }) => dispatch({ type: 'session/set', session: data }))
      .catch(() => dispatch({ type: 'session/clear' }));

    actions.reloadSkills().catch(() => {});
  }, [actions]);

  const value = useMemo(() => ({ state, actions, dispatch }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}

/** Tema claro/oscuro. El valor guardado se aplica desde index.html antes de pintar. */
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggle = useCallback(() => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch {
      // Sin almacenamiento: el tema solo dura esta visita.
    }
    setDark(next);
  }, [dark]);

  return { dark, toggle };
}
