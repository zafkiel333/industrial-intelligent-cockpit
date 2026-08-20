import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { installChineseUiLocalization } from './src/localization/chineseUi';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

installChineseUiLocalization(rootElement, { localizeCanvas: true });

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
