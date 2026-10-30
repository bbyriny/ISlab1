export const COLORS = ['RED', 'BLACK', 'BLUE', 'YELLOW', 'BROWN'];
export const COLOR_LABELS = {
    RED: 'Красный',
    BLACK: 'Чёрный',
    BLUE: 'Синий',
    YELLOW: 'Жёлтый',
    BROWN: 'Коричневый',
};
export const COLOR_HEX = {
    RED: '#ef4444',
    BLACK: '#2b2340',
    BLUE: '#3b82f6',
    YELLOW: '#facc15',
    BROWN: '#a16207',
};

export const CHARACTERS = ['CUNNING', 'EVIL', 'GOOD', 'CHAOTIC'];
export const CHARACTER_LABELS = {
    CUNNING: 'Хитрый',
    EVIL: 'Злой',
    GOOD: 'Добрый',
    CHAOTIC: 'Хаотичный',
};

export const colorOptions = COLORS.map((c) => ({ value: c, label: `${COLOR_LABELS[c]} (${c})` }));
export const characterOptions = CHARACTERS.map((c) => ({ value: c, label: `${CHARACTER_LABELS[c]} (${c})` }));

export const colorLabel = (c) => (c ? COLOR_LABELS[c] || c : '-');
export const characterLabel = (c) => (c ? CHARACTER_LABELS[c] || c : '-');

const coordinatesFields = [
    { name: 'x', label: 'X', type: 'int', required: true, max: 32, hint: 'Целое число, максимум 32' },
    { name: 'y', label: 'Y', type: 'int', required: true, int32: true, hint: 'Целое число' },
];
const cavesFields = [
    { name: 'depth', label: 'Глубина', type: 'decimal', required: true, hint: 'Число, например 120.5' },
];
const headsFields = [
    { name: 'size', label: 'Размер головы', type: 'int', required: true, hint: 'Целое число' },
];
const locationsFields = [
    { name: 'name', label: 'Название', type: 'text', required: true, maxLength: 100 },
    { name: 'x', label: 'X', type: 'decimal', required: true },
    { name: 'y', label: 'Y', type: 'decimal', required: true },
    { name: 'z', label: 'Z', type: 'decimal', required: true },
];
const peopleFields = [
    { name: 'name', label: 'Имя', type: 'text', required: true, maxLength: 100 },
    { name: 'eyeColor', label: 'Цвет глаз', type: 'enum', required: true, options: colorOptions },
    { name: 'hairColor', label: 'Цвет волос', type: 'enum', required: true, options: colorOptions },
    { name: 'location', label: 'Локация', type: 'ref', ref: 'locations', asObject: true, hint: 'Необязательно' },
    { name: 'birthday', label: 'Дата рождения', type: 'date', hint: 'Необязательно' },
    { name: 'weight', label: 'Вес', type: 'int', required: true, positive: true, hint: 'Целое число больше 0' },
    { name: 'passportID', label: 'Паспорт (ID)', type: 'text', minLength: 4, maxLength: 50, hint: 'Необязательно, от 4 до 50 символов' },
];

const fmt = (v) => (v === null || v === undefined ? '-' : v);

export const fmtNum = (v) => (v === null || v === undefined ? '-' : Number(v).toLocaleString('ru-RU', { maximumFractionDigits: 10, useGrouping: false }));

export const HELPERS = {
    coordinates: {
        key: 'coordinates',
        title: 'Координаты',
        single: 'Координаты',
        fields: coordinatesFields,
        columns: [
            { label: 'X', get: (o) => o.x },
            { label: 'Y', get: (o) => o.y },
        ],
        describe: (o) => `#${o.id} - (${o.x}; ${o.y})`,
    },
    caves: {
        key: 'caves',
        title: 'Пещеры',
        single: 'Пещера',
        fields: cavesFields,
        columns: [{ label: 'Глубина', get: (o) => fmtNum(o.depth) }],
        describe: (o) => `#${o.id} - глубина ${o.depth}`,
    },
    heads: {
        key: 'heads',
        title: 'Головы',
        single: 'Голова',
        fields: headsFields,
        columns: [{ label: 'Размер', get: (o) => fmtNum(o.size) }],
        describe: (o) => `#${o.id} - размер ${o.size}`,
    },
    people: {
        key: 'people',
        title: 'Люди (убийцы)',
        single: 'Человек',
        fields: peopleFields,
        columns: [
            { label: 'Имя', get: (o) => o.name, truncate: true },
            { label: 'Глаза', get: (o) => colorLabel(o.eyeColor) },
            { label: 'Волосы', get: (o) => colorLabel(o.hairColor) },
            { label: 'Локация', get: (o) => (o.location ? o.location.name : '-'), truncate: true },
            { label: 'Дата рождения', get: (o) => fmt(o.birthday) },
            { label: 'Вес', get: (o) => fmtNum(o.weight) },
            { label: 'Паспорт', get: (o) => fmt(o.passportID), truncate: true },
        ],
        describe: (o) => `#${o.id} - ${o.name}`,
    },
    locations: {
        key: 'locations',
        title: 'Локации',
        single: 'Локация',
        fields: locationsFields,
        columns: [
            { label: 'Название', get: (o) => o.name, truncate: true },
            { label: 'X', get: (o) => fmtNum(o.x) },
            { label: 'Y', get: (o) => fmtNum(o.y) },
            { label: 'Z', get: (o) => fmtNum(o.z) },
        ],
        describe: (o) => `#${o.id} - ${o.name} (${o.x}; ${o.y}; ${o.z})`,
    },
};

export const DRAGON_FIELDS = [
    { name: 'name', label: 'Имя', type: 'text', required: true, maxLength: 100 },
    { name: 'coordinatesId', label: 'Координаты', type: 'ref', ref: 'coordinates', required: true },
    { name: 'caveId', label: 'Пещера', type: 'ref', ref: 'caves', required: true },
    { name: 'killerId', label: 'Убийца', type: 'ref', ref: 'people', hint: 'Необязательно' },
    { name: 'age', label: 'Возраст', type: 'int', positive: true, hint: 'Необязательно, целое число больше 0' },
    { name: 'description', label: 'Описание', type: 'textarea', required: true, maxLength: 255, hint: 'Обязательно, до 255 символов' },
    { name: 'color', label: 'Цвет', type: 'enum', options: colorOptions, hint: 'Необязательно' },
    { name: 'character', label: 'Характер', type: 'enum', options: characterOptions, hint: 'Необязательно' },
    { name: 'headId', label: 'Голова', type: 'ref', ref: 'heads', hint: 'Необязательно' },
];

export function dragonToForm(d) {
    return {
        name: d.name ?? '',
        coordinatesId: d.coordinates ? String(d.coordinates.id) : '',
        caveId: d.cave ? String(d.cave.id) : '',
        killerId: d.killer ? String(d.killer.id) : '',
        age: d.age ?? '',
        description: d.description ?? '',
        color: d.color ?? '',
        character: d.character ?? '',
        headId: d.head ? String(d.head.id) : '',
    };
}

export function helperToForm(fields, obj) {
    const v = {};
    fields.forEach((f) => {
        const raw = obj ? obj[f.name] : undefined;
        if (f.type === 'ref') v[f.name] = raw && raw.id != null ? String(raw.id) : '';
        else v[f.name] = raw ?? '';
    });
    return v;
}
