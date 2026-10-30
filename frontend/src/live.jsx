import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

const listeners = new Set();
const emit = (channel, event) => listeners.forEach((fn) => fn(channel, event));

function wsUrl() {
    let base = import.meta.env.VITE_WS_URL;
    if (!base) {
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        base = `${proto}//${window.location.host}/ws`;
    }
    return base;
}

const LiveContext = createContext({ connected: false });

export function LiveProvider({ children }) {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        let first = true;
        const client = new Client({
            brokerURL: wsUrl(),
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                setConnected(true);
                client.subscribe('/topic/dragons', (m) => emit('dragons', JSON.parse(m.body)));
                client.subscribe('/topic/helpers', (m) => emit('helpers', JSON.parse(m.body)));
                // после переподключения просим экраны обновить данные
                if (!first) emit('resync', {});
                first = false;
            },
            onWebSocketClose: () => setConnected(false),
            onStompError: () => setConnected(false),
        });
        client.activate();
        return () => {
            client.deactivate();
        };
    }, []);

    return <LiveContext.Provider value={{ connected }}>{children}</LiveContext.Provider>;
}

export const useLiveStatus = () => useContext(LiveContext).connected;

export function useLive(handler) {
    const ref = useRef(handler);
    ref.current = handler;
    useEffect(() => {
        const fn = (channel, event) => ref.current(channel, event);
        listeners.add(fn);
        return () => listeners.delete(fn);
    }, []);
}

export function useLiveReload(reload, channels = ['dragons', 'helpers', 'resync']) {
    const timer = useRef(null);
    const reloadRef = useRef(reload);
    reloadRef.current = reload;
    useLive((channel) => {
        if (!channels.includes(channel)) return;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => reloadRef.current(), 250);
    });
    useEffect(() => () => clearTimeout(timer.current), []);
}
