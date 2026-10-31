import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import './lib/splitType';
import { initUtmTracker } from './lib/utmTracker';
import App from './App';

// Initialize Enterprise Marketing Attribution (One Green Way analytics architecture)
initUtmTracker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
