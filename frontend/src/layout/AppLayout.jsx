import { useEffect, useState } from 'react';
import DragonsPage from '../pages/Dragons/DragonsPage.jsx';
import VisualPage from '../pages/Visual/VisualPage.jsx';
import FindPage from '../pages/Find/FindPage.jsx';
import SpecialPage from '../pages/Special/SpecialPage.jsx';
import HelperPage from '../pages/Helper/HelperPage.jsx';
import './AppLayout.css';

const MENU = [
    {
        group: 'Драконы',
        items: [
            { path: '/', label: 'Таблица' },
            { path: '/visual', label: 'Визуализация' },
            { path: '/find', label: 'Поиск по ID' },
            { path: '/special', label: 'Специальные операции' },
        ],
    },
    {
        group: 'Связанные объекты',
        items: [
            { path: '/coordinates', label: 'Координаты' },
            { path: '/caves', label: 'Пещеры' },
            { path: '/heads', label: 'Головы' },
            { path: '/people', label: 'Люди (убийцы)' },
            { path: '/locations', label: 'Локации' },
        ],
    },
];

function useHashPath() {
    const read = () => window.location.hash.replace(/^#/, '') || '/';
    const [path, setPath] = useState(read);
    useEffect(() => {
        const on = () => setPath(read());
        window.addEventListener('hashchange', on);
        return () => window.removeEventListener('hashchange', on);
    }, []);
    return path;
}

export default function AppLayout() {
    const path = useHashPath();

    let page;
    switch (path) {
        case '/':
            page = <DragonsPage />;
            break;
        case '/visual':
            page = <VisualPage />;
            break;
        case '/find':
            page = <FindPage />;
            break;
        case '/special':
            page = <SpecialPage />;
            break;
        case '/coordinates':
        case '/caves':
        case '/heads':
        case '/people':
        case '/locations':
            page = <HelperPage key={path} helperKey={path.slice(1)} />;
            break;
        default:
            page = (
                <div className="panel">
                    <h2>Страница не найдена</h2>
                    <p>
                        <a href="#/">Перейти к таблице драконов</a>
                    </p>
                </div>
            );
    }

    return (
        <div className="shell">
            <header className="topbar">
                <div className="brand">Дракончики</div>
            </header>

            <nav className="sidebar">
                {MENU.map((g) => (
                    <div key={g.group} className="menu-group">
                        <div className="menu-title">{g.group}</div>
                        {g.items.map((i) => (
                            <a key={i.path} href={`#${i.path}`} className={`menu-item ${path === i.path ? 'active' : ''}`}>
                                {i.label}
                            </a>
                        ))}
                    </div>
                ))}
            </nav>

            <main className="content">{page}</main>
        </div>
    );
}
