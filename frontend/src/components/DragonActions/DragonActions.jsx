import { useCallback, useEffect, useState } from 'react';
import Modal from '../Modal/Modal.jsx';
import ConfirmDelete from '../ConfirmDelete/ConfirmDelete.jsx';
import DragonDetails from '../DragonDetails/DragonDetails.jsx';
import EntityForm from '../EntityForm/EntityForm.jsx';
import { dragonApi } from '../../api.js';
import { useLiveReload } from '../../live.jsx';
import { DRAGON_FIELDS, dragonToForm } from '../../config.js';

const EMPTY_DRAGON = DRAGON_FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});

function DragonCreateModal({ onClose, onDone }) {
    return (
        <Modal title="Новый дракон" onClose={onClose} wide>
            <EntityForm
                fields={DRAGON_FIELDS}
                initial={EMPTY_DRAGON}
                submitLabel="Создать дракона"
                onCancel={onClose}
                onSubmit={async (payload) => {
                    const created = await dragonApi.create(payload);
                    onDone?.(created);
                    onClose();
                }}
            />
        </Modal>
    );
}

function DragonEditModal({ dragon, onClose, onDone }) {
    return (
        <Modal title={`Изменение дракона #${dragon.id}`} onClose={onClose} wide>
            <EntityForm
                fields={DRAGON_FIELDS}
                initial={dragonToForm(dragon)}
                submitLabel="Сохранить"
                onCancel={onClose}
                onSubmit={async (payload) => {
                    const updated = await dragonApi.update(dragon.id, payload);
                    onDone?.(updated);
                    onClose();
                }}
            />
        </Modal>
    );
}

function DragonViewModal({ id, onClose, onEdit, onDelete }) {
    const [dragon, setDragon] = useState(null);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setDragon(await dragonApi.get(id));
            setError(null);
        } catch (e) {
            setDragon(null);
            setError(e.status === 404 ? 'Этот дракон был удалён.' : e.message);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);
    useLiveReload(load);

    return (
        <Modal
            title={`Дракон #${id}`}
            onClose={onClose}
            wide
            footer={
                <>
                    <button className="btn" onClick={onClose}>
                        Закрыть
                    </button>
                    {dragon && (
                        <>
                            <button className="btn btn-danger" onClick={() => onDelete(dragon)}>
                                Удалить
                            </button>
                            <button className="btn btn-primary" onClick={() => onEdit(dragon)}>
                                Изменить
                            </button>
                        </>
                    )}
                </>
            }
        >
            {error && <div className="alert alert-error">{error}</div>}
            {!error && !dragon && <p className="muted">Загрузка...</p>}
            {dragon && <DragonDetails dragon={dragon} />}
        </Modal>
    );
}

function ErrorModal({ title, text, onClose }) {
    return (
        <Modal
            title={title}
            onClose={onClose}
            footer={
                <button className="btn btn-primary" onClick={onClose}>
                    Понятно
                </button>
            }
        >
            <div className="alert alert-error">{text}</div>
        </Modal>
    );
}

export function useDragonActions(reload) {
    const [viewId, setViewId] = useState(null);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [creating, setCreating] = useState(false);
    const [notice, setNotice] = useState(null);

    const openEdit = useCallback(
        async (d) => {
            try {
                setEditing(await dragonApi.get(d.id));
            } catch (e) {
                setNotice({
                    title: 'Не удалось открыть дракона',
                    text: e.status === 404 ? `Дракон #${d.id} уже удалён.` : e.message,
                });
                reload?.();
            }
        },
        [reload]
    );

    const modals = (
        <>
            {creating && <DragonCreateModal onClose={() => setCreating(false)} onDone={() => reload?.()} />}
            {viewId !== null && (
                <DragonViewModal
                    id={viewId}
                    onClose={() => setViewId(null)}
                    onEdit={(d) => openEdit(d)}
                    onDelete={(d) => setDeleting(d)}
                />
            )}
            {editing && <DragonEditModal dragon={editing} onClose={() => setEditing(null)} onDone={() => reload?.()} />}
            {deleting && (
                <ConfirmDelete
                    title="Удаление дракона"
                    text={`Удалить дракона "${deleting.name}" (id = ${deleting.id})? Это действие нельзя отменить.`}
                    onConfirm={() => dragonApi.remove(deleting.id)}
                    onClose={(done) => {
                        setDeleting(null);
                        if (done) {
                            setViewId(null);
                            reload?.();
                        }
                    }}
                />
            )}
            {notice && <ErrorModal title={notice.title} text={notice.text} onClose={() => setNotice(null)} />}
        </>
    );

    return {
        openCreate: () => setCreating(true),
        openView: (d) => setViewId(d.id),
        openEdit,
        openDelete: (d) => setDeleting(d),
        modals,
    };
}
