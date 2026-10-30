import { useCallback, useEffect, useState } from 'react';
import { useDragonActions } from '../../components/DragonActions/DragonActions.jsx';
import EntityForm from '../../components/EntityForm/EntityForm.jsx';
import { dragonApi, specialApi } from '../../api.js';
import { useLive, useLiveReload } from '../../live.jsx';
import { validateField } from '../../validation.js';
import './SpecialPage.css';

const AGE_FIELD = { name: 'age', label: 'Возраст', type: 'int', required: true, positive: true };

const KILL_KILLER_FIELD = { name: 'killerId', label: 'Убийца', type: 'ref', ref: 'people', required: true };

function Card({ title, text, children }) {
    return (
        <section className="panel">
            <h2>{title}</h2>
            <p className="muted">{text}</p>
            {children}
        </section>
    );
}

function Result({ result }) {
    if (!result) return null;
    return <div className={`alert ${result.ok ? 'alert-ok' : 'alert-error'}`}>{result.text}</div>;
}

export default function SpecialPage() {
    const [load, setLoad] = useState(0);
    const bump = useCallback(() => setLoad((n) => n + 1), []);
    const actions = useDragonActions(bump);

    // 1. удалить по возрасту
    const [age, setAge] = useState('');
    const [ageTouched, setAgeTouched] = useState(false);
    const [ageResult, setAgeResult] = useState(null);
    const ageError = ageTouched ? validateField(AGE_FIELD, age) : null;
    const deleteByAge = async (e) => {
        e.preventDefault();
        setAgeTouched(true);
        if (validateField(AGE_FIELD, age)) return;
        try {
            const id = await specialApi.deleteByAge(Number(age.trim()));
            setAgeResult({ ok: true, text: `Удалён дракон с id=${id}.` });
        } catch (ex) {
            setAgeResult({ ok: false, text: ex.message });
        }
    };

    // 2. сумма возрастов
    const [sum, setSum] = useState(null);
    const [sumError, setSumError] = useState(null);
    const calcSum = async () => {
        try {
            setSum(await specialApi.sumAge());
            setSumError(null);
        } catch (ex) {
            setSumError(ex.message);
        }
    };

    // 3. поиск по подстроке
    const [substring, setSubstring] = useState('');
    const [substringTouched, setSubstringTouched] = useState(false);
    const [found, setFound] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const substringError = substringTouched && substring === '' ? 'Введите подстроку для поиска - поле не может быть пустым' : null;
    const search = async (e) => {
        e.preventDefault();
        setSubstringTouched(true);
        if (substring === '') return;
        try {
            setFound(await specialApi.searchByName(substring));
            setSearchError(null);
        } catch (ex) {
            setFound(null);
            setSearchError(ex.message);
        }
    };

    // 4. самая глубокая пещера
    const [deepest, setDeepest] = useState(null);
    const [deepestError, setDeepestError] = useState(null);
    const findDeepest = async () => {
        try {
            setDeepest(await specialApi.deepestCave());
            setDeepestError(null);
        } catch (ex) {
            setDeepest(null);
            setDeepestError(ex.message);
        }
    };

    // 5. убить дракона
    const [dragons, setDragons] = useState([]);
    const loadDragons = useCallback(async () => {
        try {
            setDragons(await dragonApi.all());
        } catch {
        }
    }, []);
    useEffect(() => {
        loadDragons();
    }, [loadDragons, load]);
    useLiveReload(loadDragons);

    useLive((channel) => {
        if (channel === 'dragons') {
            setFound(null);
            setDeepest(null);
        }
    });

    const [killResult, setKillResult] = useState(null);
    const [killKey, setKillKey] = useState(0); // меняется после успешного убийства - форма очищается
    const killFields = [
        {
            name: 'dragonId',
            label: 'Дракон',
            type: 'enum',
            required: true,
            options: dragons.map((d) => ({
                value: String(d.id),
                label: `#${d.id} - ${d.name}${d.killer ? ` (уже убит: ${d.killer.name})` : ''}`,
                disabled: Boolean(d.killer), // убитого дракона выбрать нельзя
            })),
        },
        KILL_KILLER_FIELD,
    ];

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1>Специальные операции</h1>
                </div>
            </div>

            <div className="grid-2">
                <Card title="Удалить дракона по возрасту">
                    <form onSubmit={deleteByAge} className="inline-form" noValidate>
                        <div className="grow">
                            <label htmlFor="special-age">Возраст</label>
                            <input
                                id="special-age"
                                className={ageError ? 'invalid' : ''}
                                aria-invalid={ageError ? 'true' : undefined}
                                aria-describedby={ageError ? 'special-age-error' : undefined}
                                value={age}
                                inputMode="numeric"
                                autoComplete="off"
                                onChange={(e) => {
                                    setAge(e.target.value);
                                    setAgeTouched(true);
                                }}
                            />
                            {ageError && (
                                <span className="field-error" id="special-age-error" role="alert">
                                    {ageError}
                                </span>
                            )}
                        </div>
                        <button className="btn btn-danger" type="submit" disabled={Boolean(ageError)}>
                            Удалить
                        </button>
                    </form>
                    <Result result={ageResult} />
                </Card>

                <Card title="Сумма возрастов всех драконов">
                    <button className="btn btn-primary" onClick={calcSum}>
                        Рассчитать
                    </button>
                    {sum !== null && (
                        <div className="big-number">
                            {sum}
                        </div>
                    )}
                    {sumError && <div className="alert alert-error">{sumError}</div>}
                </Card>

                <Card title="Поиск по части имени" text="Возвращает драконов, чьё имя содержит введённую подстроку (с учётом регистра).">
                    <form onSubmit={search} className="inline-form" noValidate>
                        <div className="grow">
                            <label htmlFor="special-substring">Подстрока</label>
                            <input
                                id="special-substring"
                                className={substringError ? 'invalid' : ''}
                                aria-invalid={substringError ? 'true' : undefined}
                                aria-describedby={substringError ? 'special-substring-error' : undefined}
                                value={substring}
                                autoComplete="off"
                                onChange={(e) => {
                                    setSubstring(e.target.value);
                                    setSubstringTouched(true);
                                }}
                            />
                            {substringError && (
                                <span className="field-error" id="special-substring-error" role="alert">
                                    {substringError}
                                </span>
                            )}
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={Boolean(substringError)}>
                            Найти
                        </button>
                    </form>
                    {searchError && <div className="alert alert-error">{searchError}</div>}
                    {found && (
                        <div className="mini-list">
                            {found.length === 0 && <p className="muted">Ничего не найдено.</p>}
                            {found.map((d) => (
                                <div key={d.id} className="mini-row">
                                    <span>
                                        #{d.id} · {d.name}
                                    </span>
                                    <span className="row-gap">
                                        <button className="btn btn-small" onClick={() => actions.openView(d)}>
                                            Открыть
                                        </button>
                                        <button className="btn btn-small" onClick={() => actions.openEdit(d)}>
                                            Изменить
                                        </button>
                                    </span>
                                </div>
                            ))}
                            {found.length > 0 && <p className="muted">Найдено: {found.length}</p>}
                        </div>
                    )}
                </Card>

                <Card title="Найти дракона из самой глубокой пещеры">
                    <button className="btn btn-primary" onClick={findDeepest}>
                        Найти
                    </button>
                    {deepestError && <div className="alert alert-error">{deepestError}</div>}
                    {deepest && (
                        <div className="mini-list">
                            <div className="mini-row">
                                <span>
                                    #{deepest.id} · {deepest.name} - глубина {deepest.cave.depth}
                                </span>
                                <span className="row-gap">
                                    <button className="btn btn-small" onClick={() => actions.openView(deepest)}>
                                        Открыть
                                    </button>
                                    <button className="btn btn-small" onClick={() => actions.openEdit(deepest)}>
                                        Изменить
                                    </button>
                                </span>
                            </div>
                        </div>
                    )}
                </Card>

                <Card title="Убить дракона" text="Назначает выбранному дракону убийцу из существующих людей. Убить можно только живого дракона.">
                    <EntityForm
                        key={`kill-${killKey}`}
                        fields={killFields}
                        initial={{ dragonId: '', killerId: '' }}
                        submitLabel="Убить"
                        cancelLabel="Сбросить"
                        onCancel={() => {
                            setKillResult(null);
                            setKillKey((k) => k + 1);
                        }}
                        onSubmit={async (p) => {
                            try {
                                const d = await specialApi.kill(Number(p.dragonId), Number(p.killerId));
                                setKillResult({ ok: true, text: `Дракон "${d.name}" (#${d.id}) убит: ${d.killer.name}.` });
                                setKillKey((k) => k + 1);
                                bump();
                            } catch (ex) {
                                setKillResult({ ok: false, text: ex.message });
                            }
                        }}
                    />
                    <Result result={killResult} />
                </Card>
            </div>
            {actions.modals}
        </div>
    );
}
