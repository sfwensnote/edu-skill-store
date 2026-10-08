import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/base.css';
import './styles/tokens.css';
import './styles/shell-new.css';
import './styles/library-new.css';
import './styles/designer-new.css';
import './styles/testing-new.css';
import './styles/usage-new.css';
import './styles/responsive-new.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
