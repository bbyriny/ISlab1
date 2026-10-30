import { useCallback, useEffect, useState } from 'react';
import Modal from '../../components/Modal/Modal.jsx';
import EntityForm from '../../components/EntityForm/EntityForm.jsx';
import ConfirmDelete from '../../components/ConfirmDelete/ConfirmDelete.jsx';
import { HELPERS, helperToForm } from '../../config.js';
import { helperApis } from '../../api.js';
import { useLiveReload } from '../../live.jsx';
import './HelperPage.css';

export default function HelperPage({ helperKey }) {
    const helper = HELPERS[helperKey];
    const api = helperApis[helperKey];
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const load = useCallback(async () => {
        try {
            setItems(await api.list());
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        setLoading(true);
        setItems([]);
        load();
    }, [load]);
    useLiveReload(load, ['helpers', 'resync']);

    const openEdit = async (item) => {
        try {
            setForm({ mode: 'edit', item: await api.get(item.id) });
        } catch (e) {
            setError(e.message);
            load();
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1>{helper.title}</h1>
                </div>
                <button className="btn btn-primary" onClick={() => setForm({ mode: 'create' })}>
                    + Создать
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="table-wrap">
                <table className="table helper-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        {helper.columns.map((c) => (
                            <th key={c.label}>{c.label}</th>
                        ))}
                        <th className="actions-col">Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((o) => (
                        <tr key={o.id}>
                            <td>{o.id}</td>
                            {helper.columns.map((c) => (
                                <td
                                    key={c.label}
                                    className={c.truncate ? 'truncate' : ''}
                                    title={c.truncate ? String(c.get(o) ?? '') : undefined}
                                >
                                    {c.get(o)}
                                </td>
                            ))}
                            <td className="actions-col">
                                <button className="btn btn-small" onClick={() => openEdit(o)}>
                                    Изменить
                                </button>
                                <button className="btn btn-small btn-danger" onClick={() => setDeleting(o)}>
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!loading && items.length === 0 && (
                        <tr>
                            <td colSpan={helper.columns.length + 2} className="empty">
                                Пока пусто. Создайте первый объект кнопкой "Создать".
                            </td>
                        </tr>
                    )}
                    {loading && (
                        <tr>
                            <td colSpan={helper.columns.length + 2} className="empty">
                                Загрузка...
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {form && (
                <Modal
                    title={form.mode === 'create' ? `Новый объект: ${helper.single}` : `Изменение: ${helper.single} #${form.item.id}`}
                    onClose={() => setForm(null)}
                >
                    <EntityForm
                        fields={helper.fields}
                        initial={helperToForm(helper.fields, form.item)}
                        submitLabel={form.mode === 'create' ? 'Создать' : 'Сохранить'}
                        onCancel={() => setForm(null)}
                        onSubmit={async (payload) => {
                            if (form.mode === 'create') await api.create(payload);
                            else await api.update(form.item.id, payload);
                            setForm(null);
                            load();
                        }}
                    />
                </Modal>
            )}

            {deleting && (
                <ConfirmDelete
                    title={`Удаление: ${helper.single}`}
                    text={`Удалить объект "${helper.describe(deleting)}"?`}
                    onConfirm={() => api.remove(deleting.id)}
                    onClose={(done) => {
                        setDeleting(null);
                        if (done) load();
                    }}
                />
            )}
        </div>
    );
}
