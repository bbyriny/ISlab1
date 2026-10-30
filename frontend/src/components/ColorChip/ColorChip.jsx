import { COLOR_HEX, colorLabel } from '../../config.js';
import './ColorChip.css';

export default function ColorChip({ color, hex, label }) {
    return (
        <span className="color-chip">
            <i style={{ background: hex ?? COLOR_HEX[color] }} />
            {label ?? colorLabel(color)}
        </span>
    );
}
