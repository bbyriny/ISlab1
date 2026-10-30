const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

const hasLetters = (s) => /[A-Za-zА-Яа-яЁё]/.test(s);

function validateText(f, s) {
    if (f.minLength && s.length < f.minLength) {
        return `Слишком короткое значение`;
    }
    if (f.maxLength && s.length > f.maxLength) {
        return `Слишком длинное значение`;
    }
    return null;
}

function validateInt(f, s) {
    if (/^[+-]?\d+[.,]\d*$/.test(s) || /^[+-]?\d*[.,]\d+$/.test(s)) {
        return 'Нужно целое число, десятичные дроби вводить нельзя';
    }
    if (hasLetters(s)) return 'Здесь нужно число, буквы вводить нельзя';
    if (!/^[+-]?\d+$/.test(s)) return 'Введите целое число';

    const n = Number(s);
    if (!Number.isSafeInteger(n)) return `Слишком большое число`;
    if (f.positive && n <= 0) return 'Число должно быть больше 0';
    if (f.max !== undefined && n > f.max) return `Число не может быть больше ${f.max}`;
    if (f.min !== undefined && n < f.min) return `Число не может быть меньше ${f.min}`;
    if (f.int32 && (n < INT32_MIN || n > INT32_MAX)) {
        return `Число должно быть в пределах от ${INT32_MIN.toLocaleString('ru-RU')} до ${INT32_MAX.toLocaleString('ru-RU')}`;
    }
    return null;
}

function validateDecimal(f, s) {
    if (hasLetters(s)) return 'Здесь нужно число, буквы вводить нельзя';
    if (!/^[+-]?\d+([.,]\d+)?$/.test(s)) return 'Введите число (дробная часть через точку или запятую)';
    if (!Number.isFinite(Number(s.replace(',', '.')))) return 'Слишком большое число';
    return null;
}

function validateDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return 'Введите дату полностью';
    const d = new Date(`${s}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return 'Такой даты не существует';
    return null;
}

export function validateField(f, raw) {
    const value = raw === undefined || raw === null ? '' : String(raw);
    const s = value.trim();

    if (f.type === 'ref' || f.type === 'enum') {
        if (f.required && value === '') {
            return f.type === 'ref'
                ? 'Выберите значение из списка (или создайте новое кнопкой "+ Новый")'
                : 'Выберите значение из списка';
        }
        return null;
    }

    if (s === '') {
        if (!f.required) return null;
        if (f.type === 'text' || f.type === 'textarea') return `Поле "${f.label}" не может быть пустым`;
        if (f.type === 'int') return `Поле "${f.label}" обязательно: введите целое число`;
        if (f.type === 'decimal') return `Поле "${f.label}" обязательно: введите число`;
        return `Поле "${f.label}" обязательно для заполнения`;
    }

    switch (f.type) {
        case 'text':
        case 'textarea':
            return validateText(f, s);
        case 'int':
            return validateInt(f, s);
        case 'decimal':
            return validateDecimal(f, s);
        case 'date':
            return validateDate(s);
        default:
            return null;
    }
}

export function validateAll(fields, values) {
    const errors = {};
    fields.forEach((f) => {
        const e = validateField(f, values[f.name]);
        if (e) errors[f.name] = e;
    });
    return errors;
}

export function toPayload(fields, values) {
    const out = {};
    fields.forEach((f) => {
        const raw = values[f.name];
        const s = raw === undefined || raw === null ? '' : String(raw);
        switch (f.type) {
            case 'text':
            case 'textarea':
                out[f.name] = s.trim() === '' ? null : s.trim();
                break;
            case 'int':
                out[f.name] = s.trim() === '' ? null : Number(s.trim());
                break;
            case 'decimal':
                out[f.name] = s.trim() === '' ? null : Number(s.trim().replace(',', '.'));
                break;
            case 'date':
            case 'enum':
                out[f.name] = s === '' ? null : s;
                break;
            case 'ref':
                if (s === '') out[f.name] = null;
                else out[f.name] = f.asObject ? { id: Number(s) } : Number(s);
                break;
            default:
                out[f.name] = s;
        }
    });
    return out;
}
