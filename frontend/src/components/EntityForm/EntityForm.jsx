import { useCallback, useEffect, useRef, useState } from 'react';
import Modal from '../Modal/Modal.jsx';
import { HELPERS } from '../../config.js';
import { helperApis } from '../../api.js';
import { useLiveReload } from '../../live.jsx';
import { toPayload, validateAll } from '../../validation.js';
import './EntityForm.css';

let formsCreated = 0;

function RefSelect({ id, field, value, onChange, invalid, describedBy, onBlur }) {
    const helper = HELPERS[field.ref];
    const [items, setItems] = useState([]);
    const [loadError, setLoadError] = useState(null);
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        try {
            setItems(await helperApis[field.ref].list());
            setLoadError(null);
        } catch (e) {
            setLoadError(e.message);
        }
    }, [field.ref]);

    useEffect(() => {
        load();
    }, [load]);
    useLiveReload(load, ['helpers', 'resync']);

    return (
        <>
            <div className="ref-row">
                <select
                    id={id}
                    className={invalid ? 'invalid' : ''}
                    aria-invalid={invalid ? 'true' : undefined}
                    aria-describedby={describedBy}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                >
                    <option value="">{field.required ? '- выберите -' : '- нет -'}</option>
                    {items.map((o) => (
                        <option key={o.id} value={String(o.id)}>
                            {helper.describe(o)}
                        </option>
                    ))}
                </select>
                <button type="button" className="btn btn-small" onClick={() => setCreating(true)} title="Создать новый объект">
                    + Новый
                </button>
            </div>
            {loadError && <div className="field-error">{loadError}</div>}
            {creating && (
                <HelperCreateModal
                    helperKey={field.ref}
                    onClose={() => setCreating(false)}
                    onCreated={async (obj) => {
                        await load();
                        onChange(String(obj.id));
                        setCreating(false);
                    }}
                />
            )}
        </>
    );
}

function HelperCreateModal({ helperKey, onClose, onCreated }) {
    const helper = HELPERS[helperKey];
    return (
        <Modal title={`Новый объект: ${helper.single}`} onClose={onClose}>
            <EntityForm
                fields={helper.fields}
                initial={helper.fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})}
                submitLabel="Создать"
                onCancel={onClose}
                onSubmit={async (payload) => onCreated(await helperApis[helperKey].create(payload))}
            />
        </Modal>
    );
}

export default function EntityForm({ fields, initial, submitLabel, cancelLabel = 'Отмена', onSubmit, onCancel }) {
    const [uid] = useState(() => ++formsCreated);
    const formRef = useRef(null);
    const [values, setValues] = useState(initial);
    const [touched, setTouched] = useState({});
    const [serverErrors, setServerErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState(null);
    const [busy, setBusy] = useState(false);
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const clientErrors = validateAll(fields, values);

    const errorOf = (f) => {
        if (serverErrors[f.name]) return serverErrors[f.name];
        return touched[f.name] || submitted ? clientErrors[f.name] || null : null;
    };
    const hasVisibleError = fields.some((f) => errorOf(f));

    const touch = (f) => setTouched((t) => (t[f.name] ? t : { ...t, [f.name]: true }));

    const setValue = (f, raw) => {
        setValues((v) => ({ ...v, [f.name]: raw }));
        touch(f);
        setServerErrors((e) => {
            if (!e[f.name]) return e;
            const next = { ...e };
            delete next[f.name];
            return next;
        });
        setFormError(null);
    };

    const submit = async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (busy) return;

        setSubmitted(true);
        const count = Object.keys(clientErrors).length;
        if (count > 0) {
            setFormError(`Форма не отправлена: исправьте ошибки в полях (${count}).`);
            requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
            return;
        }

        setFormError(null);
        setBusy(true);
        try {
            await onSubmit(toPayload(fields, values));
            if (mounted.current) setBusy(false);
        } catch (e) {
            if (!mounted.current) return;
            const mapped = {};
            Object.entries(e.fieldErrors || {}).forEach(([k, msg]) => {
                const name = fields.some((f) => f.name === k) ? k : k.split('.')[0];
                mapped[name] = msg;
            });
            setServerErrors(mapped);
            setFormError(e.message);
            setBusy(false);
        }
    };

    return (
        <form ref={formRef} onSubmit={submit} noValidate className="form">
            {fields.map((f) => {
                const err = errorOf(f);
                const value = values[f.name] ?? '';
                const id = `${uid}-${f.name}`;
                const errId = `${id}-error`;
                const common = {
                    id,
                    className: err ? 'invalid' : '',
                    'aria-invalid': err ? 'true' : undefined,
                    'aria-describedby': err ? errId : undefined,
                    onBlur: () => touch(f),
                };
                return (
                    <div className="field" key={f.name}>
                        <label htmlFor={id}>
                            {f.label}
                            {f.required && <span className="req"> *</span>}
                        </label>
                        {f.type === 'ref' ? (
                            <RefSelect
                                id={id}
                                field={f}
                                value={value}
                                invalid={Boolean(err)}
                                describedBy={err ? errId : undefined}
                                onChange={(v) => setValue(f, v)}
                                onBlur={() => touch(f)}
                            />
                        ) : f.type === 'enum' ? (
                            <select {...common} value={value} onChange={(e) => setValue(f, e.target.value)}>
                                <option value="">{f.required ? '- выберите -' : '- нет -'}</option>
                                {f.options.map((o) => (
                                    <option key={o.value} value={o.value} disabled={o.disabled}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        ) : f.type === 'textarea' ? (
                            <textarea {...common} rows={3} value={value} onChange={(e) => setValue(f, e.target.value)} />
                        ) : (
                            <input
                                {...common}
                                type={f.type === 'date' ? 'date' : 'text'}
                                inputMode={f.type === 'int' ? 'numeric' : f.type === 'decimal' ? 'decimal' : undefined}
                                autoComplete="off"
                                value={value}
                                onChange={(e) => setValue(f, e.target.value)}
                            />
                        )}
                        {err ? (
                            <div className="field-error" id={errId} role="alert">
                                {err}
                            </div>
                        ) : f.hint ? (
                            <div className="field-hint">{f.hint}</div>
                        ) : null}
                    </div>
                );
            })}

            {formError && <div className="alert alert-error">{formError}</div>}

            <div className="form-actions">
                <button type="button" className="btn" onClick={onCancel} disabled={busy}>
                    {cancelLabel}
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={busy || hasVisibleError}
                    title={hasVisibleError ? 'Сначала исправьте ошибки в полях формы' : undefined}
                >
                    {busy ? 'Сохраняем...' : submitLabel}
                </button>
            </div>
        </form>
    );
}
