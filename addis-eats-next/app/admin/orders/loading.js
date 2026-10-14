export default function AdminOrdersLoading() {
  return (
    <main className="admin-loading-orders" aria-busy="true" aria-label="Loading orders">
      <div className="admin-skeleton admin-skeleton-title" />
      <div className="admin-skeleton admin-skeleton-note" />
      <div className="admin-panel admin-skeleton-table">
        {Array.from({ length: 5 }, (_, index) => <div className="admin-skeleton-row" key={index}><span /><span /><span /><span /></div>)}
      </div>
    </main>
  );
}
