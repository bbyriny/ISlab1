const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
    constructor(status, message, fieldErrors) {
        super(message);
        this.status = status;
        this.fieldErrors = fieldErrors || {};
    }
}

async function request(path, { method = 'GET', body, params } = {}) {
    const url = new URL(`${BASE}/api${path}`, window.location.origin);
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
        });
    }
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let res;
    try {
        res = await fetch(url, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, 'Сервер недоступен. Проверьте, что бэкенд запущен.');
    }
    if (res.status === 204) return null;
    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }
    if (!res.ok) {
        throw new ApiError(res.status, (data && data.message) || `Ошибка сервера (${res.status})`, data && data.errors);
    }
    return data;
}

export const dragonApi = {
    list: (params) => request('/dragons', { params }),
    get: (id) => request(`/dragons/${id}`),
    create: (body) => request('/dragons', { method: 'POST', body }),
    update: (id, body) => request(`/dragons/${id}`, { method: 'PUT', body }),
    remove: (id) => request(`/dragons/${id}`, { method: 'DELETE' }),

    async all() {
        const result = [];
        for (let page = 0; page < 100; page++) {
            const data = await request('/dragons', { params: { page, size: 100, sortBy: 'id', direction: 'asc' } });
            result.push(...data.content);
            if (page + 1 >= data.totalPages) break;
        }
        return result;
    },
};

export const specialApi = {
    deleteByAge: (age) => request(`/dragons/special/delete-by-age/${age}`, { method: 'DELETE' }),
    sumAge: () => request('/dragons/special/sum-age'),
    searchByName: (substring) => request('/dragons/special/search-by-name', { params: { substring } }),
    deepestCave: () => request('/dragons/special/deepest-cave'),
    kill: (dragonId, killerId) => request('/dragons/special/kill', { method: 'POST', body: { dragonId, killerId } }),
};

function helperApi(path) {
    return {
        list: () => request(path),
        get: (id) => request(`${path}/${id}`),
        create: (body) => request(path, { method: 'POST', body }),
        update: (id, body) => request(`${path}/${id}`, { method: 'PUT', body }),
        remove: (id) => request(`${path}/${id}`, { method: 'DELETE' }),
    };
}

export const helperApis = {
    coordinates: helperApi('/coordinates'),
    caves: helperApi('/caves'),
    heads: helperApi('/heads'),
    people: helperApi('/people'),
    locations: helperApi('/locations'),
};
