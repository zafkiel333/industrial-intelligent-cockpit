import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { resolveSceneLibraryLaunchOptions } from './src/integration/launchOptions';
import { installChineseUiLocalization } from './src/localization/chineseUi';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

installChineseUiLocalization(rootElement, { localizeCanvas: true });

const launchOptions = resolveSceneLibraryLaunchOptions(window.location.search);
rootElement.dataset.sceneLibraryMode = launchOptions.embedded ? 'embedded' : 'standalone';
rootElement.dataset.sceneLibraryViewId = launchOptions.viewId;

if (launchOptions.invalidViewId) {
  console.warn(
    `[scene-library] 未识别页面标识“${launchOptions.requestedViewId ?? ''}”，已回到默认页面“${launchOptions.viewId}”。`,
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App embedded={launchOptions.embedded} viewId={launchOptions.viewId} />
  </React.StrictMode>
);
