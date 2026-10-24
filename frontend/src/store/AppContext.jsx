import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import {
  COMPANIES,
  DEMO_ACCOUNTS,
  SKILLS,
  initialApplications,
  initialFavorites,
  initialOffers,
  initialProfessionals,
  initialUsers,
} from '../data/mock';

const SESSION_KEY = 'ct-session';
const THEME_KEY = 'ct-theme';

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Sin almacenamiento disponible: la sesión vive solo en memoria.
  }
}

const initialState = {
  session: readSession(),
  offers: initialOffers,
  companies: COMPANIES,
  professionals: initialProfessionals,
  applications: initialApplications,
  favorites: initialFavorites,
  users: initialUsers,
  skills: SKILLS,
  toast: null,
};

let nextId = 100;
const newId = (prefix) => `${prefix}${nextId++}`;

function reducer(state, action) {
  switch (action.type) {
    case 'login':
      return { ...state, session: action.session };
    case 'logout':
      return { ...state, session: null };

    case 'register': {
      const { role, id, name, headline, email } = action;
      const user = { id: newId('u'), email, role, status: 'active' };
      if (role === 'professional') {
        return {
          ...state,
          users: [...state.users, user],
          professionals: [...state.professionals, { id, name, headline, skills: [], cv: null }],
          session: action.session,
        };
      }
      return { ...state, users: [...state.users, user], companies: { ...state.companies, [id]: name }, session: action.session };
    }

    case 'toast':
      return { ...state, toast: { id: newId('t'), ...action.toast } };
    case 'toast/clear':
      return { ...state, toast: null };

    case 'favorite/toggle':
      return {
        ...state,
        favorites: state.favorites.includes(action.offerId)
          ? state.favorites.filter((id) => id !== action.offerId)
          : [...state.favorites, action.offerId],
      };

    case 'application/create':
      return {
        ...state,
        applications: [
          { id: newId('a'), professionalId: action.professionalId, offerId: action.offerId, status: 'pending', daysAgo: 0 },
          ...state.applications,
        ],
      };
    case 'application/status':
      return {
        ...state,
        applications: state.applications.map((a) => (a.id === action.id ? { ...a, status: action.status } : a)),
      };

    case 'profile/update':
      return {
        ...state,
        professionals: state.professionals.map((p) => (p.id === action.id ? { ...p, ...action.changes } : p)),
      };

    case 'offer/create':
      return { ...state, offers: [{ ...action.offer, id: newId('o'), daysAgo: 0, moderation: 'pending' }, ...state.offers] };
    case 'offer/status':
      return { ...state, offers: state.offers.map((o) => (o.id === action.id ? { ...o, status: action.status } : o)) };
    case 'offer/remove':
      return {
        ...state,
        offers: state.offers.filter((o) => o.id !== action.id),
        applications: state.applications.filter((a) => a.offerId !== action.id),
        favorites: state.favorites.filter((id) => id !== action.id),
      };
    case 'offer/moderate':
      return { ...state, offers: state.offers.map((o) => (o.id === action.id ? { ...o, moderation: action.moderation } : o)) };

    case 'user/status':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.id ? { ...u, status: action.status } : u)),
      };

    case 'skill/add':
      return state.skills.includes(action.name) ? state : { ...state, skills: [...state.skills, action.name] };
    case 'skill/remove':
      return { ...state, skills: state.skills.filter((s) => s !== action.name) };

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(() => {
    const toast = (message, tone = 'ok') => dispatch({ type: 'toast', toast: { message, tone } });
    return {
      toast,
      login(role, email) {
        const account = DEMO_ACCOUNTS[role];
        const session = { role, email: email || account.email, name: account.name, profileId: account.profileId, companyId: account.companyId };
        writeSession(session);
        dispatch({ type: 'login', session });
      },
      register(role, { name, extra, email }) {
        const id = newId(role === 'company' ? 'c' : 'p');
        const session =
          role === 'company'
            ? { role, email, name, companyId: id }
            : { role, email, name, profileId: id };
        writeSession(session);
        dispatch({ type: 'register', role, id, name, headline: extra, email, session });
      },
      logout() {
        writeSession(null);
        dispatch({ type: 'logout' });
      },
      toggleFavorite(offerId, saved) {
        dispatch({ type: 'favorite/toggle', offerId });
        toast(saved ? 'Quitada de favoritos' : 'Guardada en favoritos');
      },
      apply(professionalId, offer) {
        dispatch({ type: 'application/create', professionalId, offerId: offer.id });
        toast(`Te postulaste a ${offer.title}`);
      },
      setApplicationStatus(id, status) {
        dispatch({ type: 'application/status', id, status });
      },
      updateProfile(id, changes, message) {
        dispatch({ type: 'profile/update', id, changes });
        if (message) toast(message);
      },
      createOffer(offer) {
        dispatch({ type: 'offer/create', offer });
        toast('Vacante enviada a revisión. Se publicará cuando la apruebe un administrador.');
      },
      setOfferStatus(id, status) {
        dispatch({ type: 'offer/status', id, status });
        toast(status === 'paused' ? 'Vacante pausada' : 'Vacante reactivada');
      },
      removeOffer(id) {
        dispatch({ type: 'offer/remove', id });
        toast('Vacante eliminada');
      },
      moderateOffer(id, moderation) {
        dispatch({ type: 'offer/moderate', id, moderation });
        toast(moderation === 'approved' ? 'Oferta aprobada' : 'Oferta bloqueada', moderation === 'approved' ? 'ok' : 'bad');
      },
      setUserStatus(id, status) {
        dispatch({ type: 'user/status', id, status });
        toast(status === 'active' ? 'Cuenta activada' : 'Cuenta desactivada');
      },
      addSkill(name) {
        dispatch({ type: 'skill/add', name });
        toast('Skill agregada al catálogo');
      },
      removeSkill(name) {
        dispatch({ type: 'skill/remove', name });
        toast('Skill eliminada del catálogo');
      },
    };
  }, []);

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
