import { Construction } from 'lucide-react';
import './WorkInProgress.css';

export function WorkInProgress({ title, description }) {
  return (
    <div className="work-in-progress">
      <div className="wip-content">
        <div className="wip-icon">
          <Construction size={64} />
        </div>
        <h2 className="wip-title">{title}</h2>
        <p className="wip-description">{description}</p>
        <div className="wip-badge">Coming Soon</div>
      </div>
    </div>
  );
}
