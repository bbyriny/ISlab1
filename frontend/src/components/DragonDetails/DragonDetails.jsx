import ColorChip from '../ColorChip/ColorChip.jsx';
import { characterLabel, colorLabel } from '../../config.js';
import './DragonDetails.css';

const dash = (v) => (v === null || v === undefined || v === '' ? '-' : v);

export const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('ru-RU');
};

function Section({ title, children }) {
    return (
        <section className="details-section">
            <h3>{title}</h3>
            <dl className="kv">{children}</dl>
        </section>
    );
}

function Row({ k, v }) {
    return (
        <>
            <dt>{k}</dt>
            <dd>{v}</dd>
        </>
    );
}

export default function DragonDetails({ dragon }) {
    const d = dragon;
    const k = d.killer;
    return (
        <div className="details">
            <Section title="Дракон">
                <Row k="ID" v={d.id} />
                <Row k="Имя" v={d.name} />
                <Row k="Дата создания" v={formatDate(d.creationDate)} />
                <Row k="Возраст" v={dash(d.age)} />
                <Row k="Описание" v={dash(d.description)} />
                <Row k="Цвет" v={d.color ? <ColorChip color={d.color} /> : '-'} />
                <Row k="Характер" v={characterLabel(d.character)} />
            </Section>

            <Section title="Координаты">
                <Row k="ID" v={d.coordinates?.id} />
                <Row k="X" v={d.coordinates?.x} />
                <Row k="Y" v={d.coordinates?.y} />
            </Section>

            <Section title="Пещера">
                <Row k="ID" v={d.cave?.id} />
                <Row k="Глубина" v={d.cave?.depth} />
            </Section>

            <Section title="Голова">
                {d.head ? (
                    <>
                        <Row k="ID" v={d.head.id} />
                        <Row k="Размер" v={d.head.size} />
                    </>
                ) : (
                    <Row k="Голова" v="не задана" />
                )}
            </Section>

            <Section title="Убийца">
                {k ? (
                    <>
                        <Row k="ID" v={k.id} />
                        <Row k="Имя" v={k.name} />
                        <Row k="Цвет глаз" v={colorLabel(k.eyeColor)} />
                        <Row k="Цвет волос" v={colorLabel(k.hairColor)} />
                        <Row k="Дата рождения" v={dash(k.birthday)} />
                        <Row k="Вес" v={dash(k.weight)} />
                        <Row k="Паспорт" v={dash(k.passportID)} />
                        <Row
                            k="Локация"
                            v={k.location ? `#${k.location.id} ${k.location.name} (${k.location.x}; ${k.location.y}; ${k.location.z})` : '-'}
                        />
                    </>
                ) : (
                    <Row k="Убийца" v="нет - дракон жив" />
                )}
            </Section>
        </div>
    );
}
