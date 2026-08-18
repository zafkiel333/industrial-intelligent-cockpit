// 2026-08-18 新增：四个外部模型仿真页与 iframe 宿主之间的受控模型详情导航协议。

const NAVIGATE_REQUEST_TYPE = 'scene-library:navigate' as const;
const NAVIGATE_RESULT_TYPE = 'scene-library:navigate-result' as const;
const PROTOCOL_VERSION = '1.0' as const;
const MODEL_DETAIL_PATH = '/three-model/detail' as const;
const NAVIGATION_TIMEOUT_MS = 5000;

const ALLOWED_MODELS = new Map<number, string>([
  [2326, '水轮机总成'],
  [2328, '污水泵KCM100HD'],
  [2316, '桥式起重机'],
  [2310, '拖车牵引车'],
]);

type HostNavigationMode = 'multi-tab' | 'same-page';

interface SceneLibraryNavigateRequest {
  type: typeof NAVIGATE_REQUEST_TYPE;
  protocolVersion: typeof PROTOCOL_VERSION;
  requestId: string;
  source: 'scene-library';
  target: {
    path: typeof MODEL_DETAIL_PATH;
    query: { id: string };
  };
  openMode: 'host-default';
  modelName: string;
}

interface SceneLibraryNavigateResult {
  type: typeof NAVIGATE_RESULT_TYPE;
  protocolVersion: typeof PROTOCOL_VERSION;
  requestId: string;
  status: 'accepted' | 'rejected' | 'failed';
  mode?: HostNavigationMode;
  message?: string;
}

export interface HostModelNavigationTarget {
  detailUrl: string;
  modelId: number;
  modelName: string;
}

export interface HostModelNavigationResult {
  mode: HostNavigationMode | 'standalone';
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `scene-library-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getParentOrigin(fallbackOrigin: string): string {
  try {
    const ancestorOrigins = (window.location as Location & { ancestorOrigins?: DOMStringList }).ancestorOrigins;
    if (ancestorOrigins?.length) return ancestorOrigins[0];
  } catch {
    // Continue with the standards-based referrer fallback.
  }

  if (document.referrer) {
    try {
      return new URL(document.referrer).origin;
    } catch {
      // Continue with the configured detail address fallback.
    }
  }

  return fallbackOrigin;
}

function validateTarget({ detailUrl, modelId, modelName }: HostModelNavigationTarget): URL {
  const expectedName = ALLOWED_MODELS.get(modelId);
  const target = new URL(detailUrl, window.location.href);
  const targetModelId = target.searchParams.get('id');

  if (!expectedName || expectedName !== modelName) {
    throw new Error('当前模型不在允许跳转的资源白名单中。');
  }
  if (target.pathname !== MODEL_DETAIL_PATH || targetModelId !== String(modelId)) {
    throw new Error('模型详情地址与当前模型不匹配。');
  }

  return target;
}

function isNavigationResult(value: unknown): value is SceneLibraryNavigateResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<SceneLibraryNavigateResult>;
  return result.type === NAVIGATE_RESULT_TYPE && result.protocolVersion === PROTOCOL_VERSION;
}

/**
 * iframe 中请求主平台执行 router.push；独立访问时在当前浏览器标签直接进入模型详情页。
 * 该函数只接受仿真分析前四页的固定模型 ID、名称和 /three-model/detail 地址。
 */
export function openHostModelDetail(target: HostModelNavigationTarget): Promise<HostModelNavigationResult> {
  const detailTarget = validateTarget(target);

  if (window.parent === window) {
    window.location.assign(detailTarget.href);
    return Promise.resolve({ mode: 'standalone' });
  }

  const parentOrigin = getParentOrigin(detailTarget.origin);
  const requestId = createRequestId();
  const request: SceneLibraryNavigateRequest = {
    type: NAVIGATE_REQUEST_TYPE,
    protocolVersion: PROTOCOL_VERSION,
    requestId,
    source: 'scene-library',
    target: {
      path: MODEL_DETAIL_PATH,
      query: { id: String(target.modelId) },
    },
    openMode: 'host-default',
    modelName: target.modelName,
  };

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      window.removeEventListener('message', handleResult);
      reject(new Error('主平台未响应模型详情跳转请求，请稍后重试。'));
    }, NAVIGATION_TIMEOUT_MS);

    function finish(): void {
      window.clearTimeout(timeoutId);
      window.removeEventListener('message', handleResult);
    }

    function handleResult(event: MessageEvent): void {
      if (event.source !== window.parent || event.origin !== parentOrigin) return;
      if (!isNavigationResult(event.data) || event.data.requestId !== requestId) return;

      finish();
      if (event.data.status === 'accepted') {
        resolve({ mode: event.data.mode ?? 'same-page' });
        return;
      }

      reject(new Error(event.data.message || '主平台拒绝了模型详情跳转请求。'));
    }

    window.addEventListener('message', handleResult);
    window.parent.postMessage(request, parentOrigin);
  });
}
