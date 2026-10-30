import { useCallback, useEffect, useState } from 'react';
import Pagination from '../../components/Pagination/Pagination.jsx';
import ColorChip from '../../components/ColorChip/ColorChip.jsx';
import { useDragonActions } from '../../components/DragonActions/DragonActions.jsx';
import { formatDate } from '../../components/DragonDetails/DragonDetails.jsx';
import { dragonApi } from '../../api.js';
import { useLiveReload } from '../../live.jsx';
import { characterLabel, characterOptions, colorOptions, fmtNum } from '../../config.js';
import './DragonsPage.css';

const dash = (v) => (v === null || v === undefined || v === '' ? '-' : v);

const COLUMNS = [
    { key: 'id', label: 'ID', sort: 'id', get: (d) => d.id },
    { key: 'name', label: 'Имя', sort: 'name', filter: 'name', get: (d) => d.name, truncate: true },
    { key: 'x', label: 'X', sort: 'coordinates.x', get: (d) => d.coordinates?.x },
    { key: 'y', label: 'Y', sort: 'coordinates.y', get: (d) => d.coordinates?.y },
    { key: 'creationDate', label: 'Создан', sort: 'creationDate', get: (d) => formatDate(d.creationDate) },
    { key: 'depth', label: 'Глубина пещеры', sort: 'cave.depth', get: (d) => fmtNum(d.cave?.depth) },
    { key: 'killer', label: 'Убийца', sort: 'killer.name', filter: 'killerName', get: (d) => dash(d.killer?.name), truncate: true },
    { key: 'age', label: 'Возраст', sort: 'age', get: (d) => fmtNum(d.age) },
    { key: 'description', label: 'Описание', sort: 'description', filter: 'description', get: (d) => d.description, wrap: true },
    {
        key: 'color',
        label: 'Цвет',
        sort: 'color',
        filter: 'color',
        get: (d) => (d.color ? <ColorChip color={d.color} /> : '-'),
    },
    { key: 'character', label: 'Характер', sort: 'character', filter: 'character', get: (d) => characterLabel(d.character) },
    { key: 'headSize', label: 'Размер головы', sort: 'head.size', get: (d) => fmtNum(d.head?.size) },
];

const FILTERS = COLUMNS.filter((c) => c.filter);

export default function DragonsPage() {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState('id');
    const [direction, setDirection] = useState('asc');
    const [filter, setFilter] = useState(null); // { field, value }
    const [draftField, setDraftField] = useState('name');
    const [draftValue, setDraftValue] = useState('');
    const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            const res = await dragonApi.list({
                page,
                size,
                sortBy,
                direction,
                filterField: filter?.field,
                filterValue: filter?.value,
            });
            if (res.totalPages > 0 && page >= res.totalPages) {
                setPage(res.totalPages - 1);
                return;
            }
            setData(res);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [page, size, sortBy, direction, filter]);

    useEffect(() => {
        load();
    }, [load]);
    useLiveReload(load);

    const actions = useDragonActions(load);

    const toggleSort = (col) => {
        if (sortBy === col.sort) setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortBy(col.sort);
            setDirection('asc');
        }
        setPage(0);
    };

    const applyFilter = (e) => {
        e.preventDefault();
        if (draftValue === '') return;
        setFilter({ field: draftField, value: draftValue });
        setPage(0);
    };
    const resetFilter = () => {
        setFilter(null);
        setDraftValue('');
        setPage(0);
    };

    const enumOptions = draftField === 'color' ? colorOptions : draftField === 'character' ? characterOptions : null;
    const activeLabel = filter && COLUMNS.find((c) => c.filter === filter.field)?.label;

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1>Драконы</h1>
                </div>
                <button className="btn btn-primary" onClick={actions.openCreate}>
                    + Новый дракон
                </button>
            </div>

            <form className="toolbar" onSubmit={applyFilter}>
                <label>
                    Фильтр по колонке
                    <select
                        value={draftField}
                        onChange={(e) => {
                            setDraftField(e.target.value);
                            setDraftValue('');
                        }}
                    >
                        {FILTERS.map((c) => (
                            <option key={c.filter} value={c.filter}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="grow">
                    Значение (полное совпадение)
                    {enumOptions ? (
                        <select value={draftValue} onChange={(e) => setDraftValue(e.target.value)}>
                            <option value="">- выберите -</option>
                            {enumOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input value={draftValue} onChange={(e) => setDraftValue(e.target.value)} placeholder="Введите точное значение" />
                    )}
                </label>
                <button className="btn btn-primary" type="submit" disabled={draftValue === ''}>
                    Применить
                </button>
                <button className="btn" type="button" onClick={resetFilter} disabled={!filter && draftValue === ''}>
                    Сбросить
                </button>
            </form>

            {filter && (
                <div className="chips">
          <span className="chip">
            {activeLabel} = "{filter.value}"
          </span>
                </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            <div className="table-wrap">
                <table className="table">
                    <thead>
                    <tr>
                        {COLUMNS.map((c) => (
                            <th key={c.key} onClick={() => toggleSort(c)} className="sortable" aria-sort={sortBy === c.sort ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                {c.label}
                                <span className={`sort-mark ${sortBy === c.sort ? 'on' : ''}`}>
                    {sortBy === c.sort ? (direction === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                            </th>
                        ))}
                        <th className="actions-col">Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.content.map((d) => (
                        <tr key={d.id}>
                            {COLUMNS.map((c) => (
                                <td
                                    key={c.key}
                                    className={c.wrap ? 'wrap' : c.truncate ? 'truncate' : ''}
                                    title={c.wrap || c.truncate ? String(c.get(d) ?? '') : undefined}
                                >
                                    {c.get(d)}
                                </td>
                            ))}
                            <td className="actions-col">
                                <button className="btn btn-small" onClick={() => actions.openView(d)}>
                                    Открыть
                                </button>
                                <button className="btn btn-small" onClick={() => actions.openEdit(d)}>
                                    Изменить
                                </button>
                                <button className="btn btn-small btn-danger" onClick={() => actions.openDelete(d)}>
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!loading && data.content.length === 0 && (
                        <tr>
                            <td colSpan={COLUMNS.length + 1} className="empty">
                                {filter ? 'Ничего не найдено. Измените или сбросьте фильтр.' : 'Драконов пока нет. Создайте первого кнопкой "Новый дракон".'}
                            </td>
                        </tr>
                    )}
                    {loading && (
                        <tr>
                            <td colSpan={COLUMNS.length + 1} className="empty">
                                Загрузка...
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={data.page ?? page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                size={size}
                onPage={setPage}
                onSize={(n) => {
                    setSize(n);
                    setPage(0);
                }}
            />

            {actions.modals}
        </div>
    );
}
