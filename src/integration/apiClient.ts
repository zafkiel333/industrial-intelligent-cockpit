// 2026-08-17 新增：统一 standalone 与 qiankun 微应用的浏览器端 API 前缀。
declare const __SCENE_LIBRARY_API_BASE__: string;

const FALLBACK_API_BASE = '/api/';

function normalizeApiBase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    throw new Error('apiBase must be a same-origin absolute path.');
  }
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

let activeApiBase = normalizeApiBase(
  typeof __SCENE_LIBRARY_API_BASE__ === 'string'
    ? __SCENE_LIBRARY_API_BASE__
    : FALLBACK_API_BASE,
);

export function setApiBase(value: string): void {
  activeApiBase = normalizeApiBase(value);
}

export function getApiBase(): string {
  return activeApiBase;
}

export function apiUrl(pathname: string): string {
  const value = pathname.trim();
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//') || value.includes('\\')) {
    throw new Error('API URLs must remain on the current origin.');
  }
  if (value.startsWith(activeApiBase)) return value;
  const withoutLegacyPrefix = value.replace(/^\/?api\//, '');
  return `${activeApiBase}${withoutLegacyPrefix.replace(/^\/+/, '')}`;
}
