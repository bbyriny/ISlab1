import { useState } from 'react';
import Modal from '../Modal/Modal.jsx';

export default function ConfirmDelete({ title = 'Удаление', text, onConfirm, onClose }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const run = async () => {
        setBusy(true);
        setError(null);
        try {
            await onConfirm();
            onClose(true);
        } catch (e) {
            setError({ status: e.status, message: e.message });
            setBusy(false);
        }
    };

    return (
        <Modal
            title={title}
            onClose={() => onClose(false)}
            footer={
                <>
                    <button className="btn" onClick={() => onClose(false)}>
                        {error ? 'Закрыть' : 'Отмена'}
                    </button>
                    {!error && (
                        <button className="btn btn-danger" onClick={run} disabled={busy}>
                            {busy ? 'Удаляем...' : 'Удалить'}
                        </button>
                    )}
                </>
            }
        >
            <p>{text}</p>
            {error && (
                <div className="alert alert-error">
                    <strong>{error.status === 409 ? 'Удаление невозможно. ' : 'Ошибка. '}</strong>
                    {error.message}
                </div>
            )}
        </Modal>
    );
}
