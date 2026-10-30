import './Pagination.css';

export default function Pagination({ page, totalPages, totalElements, size, onPage, onSize }) {
    const pages = [];
    const from = Math.max(0, page - 2);
    const to = Math.min(totalPages - 1, page + 2);
    for (let i = from; i <= to; i++) pages.push(i);

    return (
        <div className="pagination">
            <div className="pagination-info">
                Всего: <strong>{totalElements}</strong>
                {totalPages > 0 && (
                    <>
                        {' '}
                        (страница {page + 1} из {totalPages})
                    </>
                )}
            </div>
            <div className="pagination-pages">
                <button className="btn btn-small" onClick={() => onPage(0)} disabled={page <= 0} aria-label="Первая страница">
                    «
                </button>
                <button className="btn btn-small" onClick={() => onPage(page - 1)} disabled={page <= 0} aria-label="Предыдущая">
                    ‹
                </button>
                {from > 0 && <span className="dots">…</span>}
                {pages.map((p) => (
                    <button key={p} className={`btn btn-small ${p === page ? 'btn-active' : ''}`} onClick={() => onPage(p)}>
                        {p + 1}
                    </button>
                ))}
                {to < totalPages - 1 && <span className="dots">…</span>}
                <button
                    className="btn btn-small"
                    onClick={() => onPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    aria-label="Следующая"
                >
                    ›
                </button>
                <button
                    className="btn btn-small"
                    onClick={() => onPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    aria-label="Последняя страница"
                >
                    »
                </button>
            </div>
            <label className="pagination-size">
                На странице
                <select value={size} onChange={(e) => onSize(Number(e.target.value))}>
                    {[5, 10, 20, 50, 100].map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}
