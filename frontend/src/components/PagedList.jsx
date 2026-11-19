import { Button, CardSkeleton, EmptyState, cx } from './ui';
import Pagination from './Pagination';

/**
 * Lista alimentada por usePaginated: estados de carga, error y vacío, y la paginación.
 * `children` es una función que recibe cada elemento y devuelve su fila o tarjeta.
 */
export default function PagedList({ query, empty, as: Tag = 'div', className = 'space-y-4', children }) {
  const { items, meta, loading, error, setPage, reload } = query;

  if (error && !items.length) {
    return (
      <EmptyState title="No se pudo cargar" action={<Button variant="secondary" onClick={reload}>Reintentar</Button>}>
        {error}
      </EmptyState>
    );
  }
  if (loading && !items.length) {
    return (
      <div className="space-y-4" role="status" aria-label="Cargando">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }
  if (!items.length) return empty;

  return (
    <>
      <Tag className={cx(className, 'stagger transition-opacity', loading && 'opacity-60')} aria-busy={loading}>
        {items.map(children)}
      </Tag>
      <Pagination meta={meta} onPage={setPage} loading={loading} />
    </>
  );
}
