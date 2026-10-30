import { useCallback, useState } from 'react';
import DragonDetails from '../../components/DragonDetails/DragonDetails.jsx';
import { useDragonActions } from '../../components/DragonActions/DragonActions.jsx';
import { dragonApi } from '../../api.js';
import { useLiveReload } from '../../live.jsx';
import { validateField } from '../../validation.js';
import './FindPage.css';

const ID_FIELD = { name: 'id', label: 'ID дракона', type: 'int', required: true, positive: true };

export default function FindPage() {
    const [idText, setIdText] = useState('');
    const [touched, setTouched] = useState(false);
    const [searchedId, setSearchedId] = useState(null);
    const [dragon, setDragon] = useState(null);
    const [message, setMessage] = useState(null);
    const [busy, setBusy] = useState(false);

    const fieldError = touched ? validateField(ID_FIELD, idText) : null;

    const fetchDragon = useCallback(async (id) => {
        try {
            setDragon(await dragonApi.get(id));
            setMessage(null);
        } catch (e) {
            setDragon(null);
            setMessage(e.message);
        }
    }, []);

    const reload = useCallback(() => {
        if (searchedId !== null) fetchDragon(searchedId);
    }, [searchedId, fetchDragon]);
    useLiveReload(reload);

    const actions = useDragonActions(reload);

    const submit = async (e) => {
        e.preventDefault();
        setTouched(true);
        if (validateField(ID_FIELD, idText)) return;
        const id = Number(idText.trim());
        setBusy(true);
        setSearchedId(id);
        await fetchDragon(id);
        setBusy(false);
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1>Поиск дракона по ID</h1>
                </div>
            </div>

            <form className="toolbar find-form" onSubmit={submit} noValidate>
                <div className="find-field">
                    <label htmlFor="find-id">ID дракона</label>
                    <input
                        id="find-id"
                        className={fieldError ? 'invalid' : ''}
                        aria-invalid={fieldError ? 'true' : undefined}
                        aria-describedby={fieldError ? 'find-id-error' : undefined}
                        value={idText}
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Например, 1"
                        onChange={(e) => {
                            setIdText(e.target.value);
                            setTouched(true);
                        }}
                    />
                    {fieldError && (
                        <span className="field-error" id="find-id-error" role="alert">
                            {fieldError}
                        </span>
                    )}
                </div>
                <button className="btn btn-primary" type="submit" disabled={busy || Boolean(fieldError)}>
                    Найти
                </button>
            </form>

            {message && <div className="alert alert-error">{message}</div>}

            {dragon && (
                <div className="panel find-result">
                    <div className="panel-head">
                        <h2>
                            #{dragon.id}
                        </h2>
                        <div className="row-gap">
                            <button className="btn btn-primary" onClick={() => actions.openEdit(dragon)}>
                                Изменить
                            </button>
                            <button className="btn btn-danger" onClick={() => actions.openDelete(dragon)}>
                                Удалить
                            </button>
                        </div>
                    </div>
                    <DragonDetails dragon={dragon} />
                </div>
            )}
            {actions.modals}
        </div>
    );
}
