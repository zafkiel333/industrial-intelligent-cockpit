// 2026-08-17 新增：qiankun 微应用入口与 React 19 生命周期适配。
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { setApiBase } from './src/integration/apiClient';
import { DEFAULT_VIEW_ID, isKnownViewId } from './src/integration/menu';
import { installChineseUiLocalization } from './src/localization/chineseUi';

const APP_NAME = 'industrial-intelligent-cockpit';

export interface SceneLibraryHostProps {
  protocolVersion: '1.0';
  container: Element;
  viewId?: string;
  apiBase?: string;
  locale?: 'zh-CN';
  theme?: Record<string, string>;
  visible?: boolean;
  navigate?: (viewId: string, title?: string) => void;
  reportStatus?: (status: { state: string; message?: string }) => void;
}

let reactRoot: Root | null = null;
let rootElement: HTMLElement | null = null;
let currentProps: SceneLibraryHostProps | null = null;
let stopChineseUiLocalization: (() => void) | null = null;

function safeReport(props: SceneLibraryHostProps, state: string, message?: string): void {
  try {
    props.reportStatus?.({ state, message });
  } catch (error) {
    console.warn('[scene-library] reportStatus callback failed:', error);
  }
}

function validateProps(props: SceneLibraryHostProps): void {
  if (props.protocolVersion !== '1.0') {
    throw new Error('场景库集成版本不兼容：需要 props 协议 1.0。');
  }
  if (!(props.container instanceof Element)) {
    throw new Error('场景库缺少有效的宿主容器。');
  }
  if (props.apiBase) setApiBase(props.apiBase);
}

function resolveRootElement(container: Element): HTMLElement {
  const existing = container.querySelector<HTMLElement>('[data-scene-library-root]');
  if (existing) return existing;
  const created = document.createElement('div');
  created.dataset.sceneLibraryRoot = '';
  container.appendChild(created);
  return created;
}

function applyTheme(element: HTMLElement, theme?: Record<string, string>): void {
  if (!theme) return;
  for (const [key, value] of Object.entries(theme)) {
    if (/^--[a-z\d-]+$/i.test(key) && typeof value === 'string') {
      element.style.setProperty(key, value);
    }
  }
}

function render(props: SceneLibraryHostProps): void {
  if (!reactRoot || !rootElement) throw new Error('场景库尚未创建 React 根节点。');
  applyTheme(rootElement, props.theme);
  rootElement.style.display = props.visible === false ? 'none' : '';
  const requestedView = props.viewId && isKnownViewId(props.viewId) ? props.viewId : DEFAULT_VIEW_ID;
  reactRoot.render(
    <React.StrictMode>
      <App
        embedded
        viewId={requestedView}
        onNavigate={(viewId, title) => {
          try {
            props.navigate?.(viewId, title);
          } catch (error) {
            console.warn('[scene-library] navigate callback failed:', error);
          }
        }}
      />
    </React.StrictMode>,
  );
}

export async function bootstrap(): Promise<void> {
  // One-time registrations are intentionally kept empty.
}

export async function mount(props: SceneLibraryHostProps): Promise<void> {
  try {
    validateProps(props);
    if (reactRoot) throw new Error('场景库已经挂载，不能重复 mount。');
    currentProps = props;
    rootElement = resolveRootElement(props.container);
    rootElement.classList.add('scene-library-microapp-root');
    rootElement.style.width = '100%';
    rootElement.style.height = '100%';
    rootElement.style.overflow = 'hidden';
    reactRoot = createRoot(rootElement);
    stopChineseUiLocalization = installChineseUiLocalization(rootElement, { localizeCanvas: true });
    render(props);
    safeReport(props, 'ready');
  } catch (error) {
    const message = error instanceof Error ? error.message : '场景库挂载失败。';
    safeReport(props, 'error', message);
    throw error;
  }
}

export async function update(nextProps: Partial<SceneLibraryHostProps>): Promise<void> {
  if (!currentProps) throw new Error('场景库尚未挂载，不能 update。');
  const merged = { ...currentProps, ...nextProps } as SceneLibraryHostProps;
  validateProps(merged);
  currentProps = merged;
  render(merged);
}

export async function unmount(): Promise<void> {
  reactRoot?.unmount();
  stopChineseUiLocalization?.();
  stopChineseUiLocalization = null;
  reactRoot = null;
  if (rootElement) {
    rootElement.replaceChildren();
    rootElement.removeAttribute('style');
  }
  rootElement = null;
  currentProps = null;
}

const lifecycles = { bootstrap, mount, update, unmount };

Object.assign(window, {
  [APP_NAME]: lifecycles,
  IndustrialIntelligentCockpit: lifecycles,
});
