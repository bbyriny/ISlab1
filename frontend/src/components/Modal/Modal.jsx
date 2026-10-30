import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const stack = [];

export default function Modal({ title, onClose, children, footer, wide }) {

    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        const token = {};
        stack.push(token);
        const onKey = (e) => {
            if (e.key === 'Escape' && stack[stack.length - 1] === token) closeRef.current();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            stack.splice(stack.indexOf(token), 1);
        };
    }, []);

    return createPortal(
        <div className="modal-backdrop">
            <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
                <div className="modal-head">
                    <h2>{title}</h2>
                    <button className="icon-btn" onClick={onClose} aria-label="Закрыть">
                        ×
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-foot">{footer}</div>}
            </div>
        </div>,
        document.body
    );
}
