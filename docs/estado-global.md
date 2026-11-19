# Estado global: Context, Zustand o Redux

## Diferencias

| | Context API | Zustand | Redux Toolkit |
|---|---|---|---|
| Viene con React | Sí | No (~3 KB) | No (~45-60 KB con react-redux) |
| Código extra | Poco (provider + hook) | Muy poco (un `create`) | Mucho (store, slices, provider) |
| Re-renders | Todos los consumidores cuando cambia el valor | Solo los que usan lo que cambió (selectores) | Igual, con selectores |
| Herramientas de depuración | React DevTools | Opcionales (middleware devtools) | Redux DevTools completas (time-travel) |
| Curva de aprendizaje | Baja | Baja (~30 min) | Media (horas) |
| Mejor para | Valores que cambian poco (sesión, tema) | Estado compartido que crece o cambia mucho | Equipos grandes, flujos complejos, RTK Query |

Context no es un gestor de estado como tal: solo pasa valores por el árbol. Un estado que cambia seguido provoca renders innecesarios porque no tiene selectores.

## ¿Cuál conviene a CareerTrack?

Hoy el estado global es pequeño: sesión del usuario, skills del catálogo, avisos (toasts) y tema. Cambia poco y vive en `AppContext` con un reducer. Lo demás (ofertas, postulaciones, estadísticas) es **estado del servidor**: se pide a la API con `usePaginated` y `useApi` y se guarda en el componente que lo usa.

- **Mantener Context + reducer** es lo más rentable ahora: cero dependencias, menos código que explicar en la defensa y cubre lo que hay.
- **Zustand** sería la mejor mejora si el estado global creciera (filtros compartidos entre pantallas, carrito de favoritos, etc.): migrar `AppContext` serían pocas líneas.
- **Redux Toolkit** es excesivo: añade peso y código a cambio de herramientas que un proyecto de este tamaño no necesita.

Regla práctica: empezar simple y pasar a Zustand cuando se note el problema (re-renders o contexto con demasiadas cosas). Si el servidor se vuelve más complejo (caché, reintentos), lo siguiente sería TanStack Query, no Redux.

## Fuentes

- pkgpulse, "Zustand vs Redux Toolkit".
- dev.to (digitalunicon), "State Management in 2026".
- Strapi, "Built-in vs external state management in React".
