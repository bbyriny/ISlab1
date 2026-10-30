import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import './styles/variables.css';
import './styles/base.css';
import './styles/buttons.css';
import './styles/forms.css';
import './styles/alerts.css';
import './styles/panels.css';
import './styles/toolbar.css';
import './styles/table.css';
import './styles/kv.css';

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
