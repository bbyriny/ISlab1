import { useCallback, useEffect, useMemo, useState } from 'react';
import ColorChip from '../../components/ColorChip/ColorChip.jsx';
import { useDragonActions } from '../../components/DragonActions/DragonActions.jsx';
import { dragonApi } from '../../api.js';
import { useLiveReload } from '../../live.jsx';
import { characterLabel, colorLabel, COLORS, COLOR_HEX } from '../../config.js';
import './VisualPage.css';

const W = 900;
const H = 520;
const PAD = 56;
const INNER = 28;

function niceTicks(min, max, count = 5) {
    if (min === max) return [min];
    const step = (max - min) / count;
    return [...new Set(Array.from({ length: count + 1 }, (_, i) => Math.round(min + step * i)))];
}

export default function VisualPage() {
    const [dragons, setDragons] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    const load = useCallback(async () => {
        try {
            setDragons(await dragonApi.all());
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);
    useLiveReload(load);

    const actions = useDragonActions(load);

    const { points, xTicks, yTicks, sx, sy } = useMemo(() => {
        if (!dragons.length) return { points: [], xTicks: [], yTicks: [] };
        const xs = dragons.map((d) => d.coordinates.x);
        const ys = dragons.map((d) => d.coordinates.y);
        let minX = Math.min(...xs), maxX = Math.max(...xs);
        let minY = Math.min(...ys), maxY = Math.max(...ys);
        if (minX === maxX) { minX -= 1; maxX += 1; }
        if (minY === maxY) { minY -= 1; maxY += 1; }
        const sx = (x) => PAD + INNER + ((x - minX) / (maxX - minX)) * (W - (PAD + INNER) * 2);
        const sy = (y) => H - PAD - INNER - ((y - minY) / (maxY - minY)) * (H - (PAD + INNER) * 2);

        const groups = new Map();
        dragons.forEach((d) => {
            const key = `${d.coordinates.x};${d.coordinates.y}`;
            groups.set(key, [...(groups.get(key) || []), d]);
        });
        const points = [];
        groups.forEach((list) => {
            list.forEach((d, i) => {
                const angle = (2 * Math.PI * i) / list.length;
                const r = list.length > 1 ? 16 : 0;
                points.push({ d, cx: sx(d.coordinates.x) + Math.cos(angle) * r, cy: sy(d.coordinates.y) + Math.sin(angle) * r });
            });
        });
        return { points, xTicks: niceTicks(minX, maxX), yTicks: niceTicks(minY, maxY), sx, sy };
    }, [dragons]);

    const selected = dragons.find((d) => d.id === selectedId) || null;
    const DOT_RADIUS = 8;

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1>Визуализация</h1>
                </div>
                <button className="btn btn-primary" onClick={actions.openCreate}>
                    + Новый дракон
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="visual-layout">
                <div className="visual-canvas">
                    {loading ? (
                        <p className="empty">Загрузка...</p>
                    ) : dragons.length === 0 ? (
                        <p className="empty">Драконов пока нет - карта пуста.</p>
                    ) : (
                        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Карта драконов по координатам">
                            <rect x="0" y="0" width={W} height={H} className="svg-bg" />
                            {xTicks.map((t) => (
                                <g key={`x${t}`}>
                                    <line x1={sx(t)} x2={sx(t)} y1={PAD - 20} y2={H - PAD + 10} className="svg-grid" />
                                    <text x={sx(t)} y={H - PAD + 28} textAnchor="middle" className="svg-tick">{t}</text>
                                </g>
                            ))}
                            {yTicks.map((t) => (
                                <g key={`y${t}`}>
                                    <line x1={PAD - 10} x2={W - PAD + 20} y1={sy(t)} y2={sy(t)} className="svg-grid" />
                                    <text x={PAD - 16} y={sy(t) + 4} textAnchor="end" className="svg-tick">{t}</text>
                                </g>
                            ))}
                            <text x={W - PAD + 18} y={H - PAD + 46} textAnchor="end" className="svg-axis">X</text>
                            <text x={PAD - 40} y={PAD - 24} className="svg-axis">Y</text>

                            {points.map(({ d, cx, cy }) => {
                                const r = DOT_RADIUS;
                                const isSel = d.id === selectedId;
                                return (
                                    <g
                                        key={d.id}
                                        className={`dot ${isSel ? 'sel' : ''}`}
                                        transform={`translate(${cx} ${cy})`}
                                        onClick={() => setSelectedId(d.id)}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Дракон ${d.name}, id ${d.id}`}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedId(d.id)}
                                    >
                                        <circle r={r} fill={d.color ? COLOR_HEX[d.color] : '#8b8aa3'} className="body" />
                                        <text y={r + 14} textAnchor="middle" className="svg-label">{d.name.length > 12 ? d.name.slice(0, 11) + '...' : d.name}</text>
                                    </g>
                                );
                            })}
                        </svg>
                    )}
                    <div className="legend">
                        {COLORS.map((c) => (
                            <ColorChip key={c} color={c} />
                        ))}
                        <ColorChip hex="#8b8aa3" label="Без цвета" />
                    </div>
                </div>

                <aside className="visual-side">
                    {selected ? (
                        <>
                            <h3>#{selected.id} {selected.name}</h3>
                            <dl className="kv">
                                <dt>Координаты</dt><dd>({selected.coordinates.x}; {selected.coordinates.y})</dd>
                                <dt>Пещера</dt><dd>глубина {selected.cave.depth}</dd>
                                <dt>Возраст</dt><dd>{selected.age ?? '-'}</dd>
                                <dt>Цвет</dt><dd>{colorLabel(selected.color)}</dd>
                                <dt>Характер</dt><dd>{characterLabel(selected.character)}</dd>
                                <dt>Убийца</dt><dd>{selected.killer ? selected.killer.name : 'нет - жив'}</dd>
                            </dl>
                            <div className="side-actions">
                                <button className="btn btn-primary" onClick={() => actions.openEdit(selected)}>Изменить</button>
                                <button className="btn" onClick={() => actions.openView(selected)}>Подробнее</button>
                                <button className="btn btn-danger" onClick={() => actions.openDelete(selected)}>Удалить</button>
                            </div>
                        </>
                    ) : (
                        <p className="muted">Выберите дракона на карте.</p>
                    )}
                </aside>
            </div>

            {actions.modals}
        </div>
    );
}
