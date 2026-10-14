export default function AdminLoading() {
  return (
    <main className="admin-dashboard" aria-busy="true" aria-label="Loading admin dashboard">
      <aside className="admin-loading-sidebar">
        <div className="admin-skeleton admin-skeleton-brand" />
        <div className="admin-skeleton admin-skeleton-nav" />
        <div className="admin-skeleton admin-skeleton-nav" />
        <div className="admin-skeleton admin-skeleton-nav" />
      </aside>
      <section className="admin-content">
        <div className="admin-skeleton admin-skeleton-title" />
        <div className="admin-skeleton admin-skeleton-note" />
        <div className="admin-skeleton-stats">
          {Array.from({ length: 4 }, (_, index) => <div className="admin-skeleton admin-skeleton-stat" key={index} />)}
        </div>
        <div className="admin-skeleton-charts">
          {Array.from({ length: 2 }, (_, index) => <div className="admin-skeleton admin-skeleton-chart" key={index} />)}
        </div>
        <div className="admin-skeleton admin-skeleton-table" />
      </section>
    </main>
  );
}
