import { LiveProvider } from './live.jsx';
import AppLayout from './layout/AppLayout.jsx';

export default function App() {
    return (
        <LiveProvider>
            <AppLayout />
        </LiveProvider>
    );
}
