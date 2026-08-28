// 2026-08-09 新增：通过本地 BFF 加载并交互展示 FBX/GLB/GLTF 外部模型；
// 2026-08-12 调整：模型按版本获取 ArrayBuffer，并以候选解析成功后再替换旧模型的方式无损更新；
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Expand, Pause, Play, RotateCcw } from 'lucide-react';
import type { ModelAssetDescriptor, RemoteBindableField, RemoteRenderConfig } from '../../src/remoteModelShowcase/types';
import { apiUrl } from '../../src/integration/apiClient';
import { advanceViewerRotation, prepareViewerModel } from '../../src/remoteModelShowcase/modelViewerTransform';

interface RemoteModelViewerProps {
  asset: ModelAssetDescriptor;
  fields: RemoteBindableField[];
  renderConfig?: RemoteRenderConfig;
  accent: string;
  autoRotateSpeed: number;
}

type ModelLoadFailureStage = 'request' | 'parse';

type ModelLoadPhase = 'preparing' | 'downloading' | 'parsing' | 'ready';

interface ModelLoadProgress {
  phase: ModelLoadPhase;
  percent: number;
  receivedBytes: number;
  expectedBytes: number;
}

interface ModelBufferResult {
  buffer: ArrayBuffer;
  responseVersion: string | null;
}

interface SharedModelBufferTask {
  assetUrl: string;
  controller: AbortController;
  promise: Promise<ModelBufferResult>;
  keys: Set<string>;
  subscribers: Set<(progress: ModelLoadProgress) => void>;
  progress: ModelLoadProgress;
  settled: boolean;
  succeeded: boolean;
  abortMessage: string | null;
  abortTimer: number | null;
  lastAccessedAt: number;
}

// 2026-08-27 优化：同一模型下载任务共享字节进度；版本轮询或组件重挂载不再重复拉取大文件。
const modelBufferTasks = new Map<string, SharedModelBufferTask>();
const allModelBufferTasks = new Set<SharedModelBufferTask>();
const MAX_RESOLVED_MODEL_BUFFERS = 3;
const MODEL_PREPARE_TIMEOUT_MS = 75_000;
const MODEL_STREAM_STALL_TIMEOUT_MS = 30_000;

function modelCacheKey(asset: ModelAssetDescriptor): string {
  return `${asset.localAssetUrl}::${asset.version}`;
}

function versionedModelUrl(asset: ModelAssetDescriptor): string {
  const url = new URL(apiUrl(asset.localAssetUrl), window.location.origin);
  url.searchParams.set('v', asset.version);
  return `${url.pathname}${url.search}`;
}

function taskKey(assetUrl: string, version: string): string {
  return `${assetUrl}::${version}`;
}

function publishProgress(task: SharedModelBufferTask, progress: ModelLoadProgress): void {
  task.progress = progress;
  task.subscribers.forEach((subscriber) => subscriber(progress));
}

function removeTask(task: SharedModelBufferTask): void {
  task.keys.forEach((key) => {
    if (modelBufferTasks.get(key) === task) modelBufferTasks.delete(key);
  });
  allModelBufferTasks.delete(task);
}

function registerTaskAlias(task: SharedModelBufferTask, key: string): void {
  const existing = modelBufferTasks.get(key);
  if (existing && existing !== task && !existing.settled) return;
  modelBufferTasks.set(key, task);
  task.keys.add(key);
}

function pruneResolvedTasks(): void {
  const removable = [...allModelBufferTasks]
    .filter((task) => task.settled && task.succeeded && task.subscribers.size === 0)
    .sort((left, right) => left.lastAccessedAt - right.lastAccessedAt);
  while (removable.length > MAX_RESOLVED_MODEL_BUFFERS) {
    const oldest = removable.shift();
    if (oldest) removeTask(oldest);
  }
}

function subscribeToTask(
  task: SharedModelBufferTask,
  subscriber: (progress: ModelLoadProgress) => void,
): () => void {
  task.lastAccessedAt = Date.now();
  if (task.abortTimer !== null) {
    window.clearTimeout(task.abortTimer);
    task.abortTimer = null;
  }
  task.subscribers.add(subscriber);
  subscriber(task.progress);
  return () => {
    task.subscribers.delete(subscriber);
    if (!task.settled && task.subscribers.size === 0 && task.abortTimer === null) {
      // React 会先清理旧 effect 再挂载新 effect；延迟到下一任务可避免版本别名切换误取消同一下载。
      task.abortTimer = window.setTimeout(() => {
        task.abortTimer = null;
        if (!task.settled && task.subscribers.size === 0) {
          task.abortMessage = '页面已切换，已取消旧模型下载。';
          task.controller.abort();
          removeTask(task);
        }
      }, 0);
    }
    pruneResolvedTasks();
  };
}

async function responseError(response: Response): Promise<Error> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => ({})) as { error?: { code?: string; message?: string }; message?: string };
    const message = payload.error?.message || payload.message || `模型代理请求失败（${response.status}）`;
    return new Error(payload.error?.code ? `${message}（${payload.error.code}）` : message);
  }
  return new Error(`模型代理请求失败（${response.status}）`);
}

// 2026-08-12 新增：将 API 返回的近黑背景提升为中深蓝灰，改善灰模辨识度；
function resolveViewerBackground(configured?: string): THREE.Color {
  const fallback = new THREE.Color('#29485e');
  if (!configured) return fallback;
  try {
    const candidate = new THREE.Color(configured);
    const hsl = { h: 0, s: 0, l: 0 };
    candidate.getHSL(hsl);
    return hsl.l < 0.18 ? fallback : candidate;
  } catch {
    return fallback;
  }
}

function validateModelBuffer(asset: ModelAssetDescriptor, buffer: ArrayBuffer): void {
  if (buffer.byteLength === 0) throw new Error('模型文件为空');
  const bytes = new Uint8Array(buffer);
  const header = new TextDecoder('ascii').decode(bytes.subarray(0, 32));
  if (asset.format === 'fbx' && !header.startsWith('Kaydara FBX Binary') && !header.trimStart().startsWith('; FBX')) {
    throw new Error('接口返回内容不是有效的 FBX 文件');
  }
  if (asset.format === 'glb' && header.slice(0, 4) !== 'glTF') {
    throw new Error('接口返回内容不是有效的 GLB 文件');
  }
  if (asset.format === 'gltf') {
    try {
      const document = JSON.parse(new TextDecoder().decode(bytes));
      if (!document?.asset?.version) throw new Error('missing asset.version');
    } catch {
      throw new Error('接口返回内容不是有效的 GLTF 文件');
    }
  }
}

function formatModelBytes(bytes: number): string {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 1 : 2)} MB`;
}

function getModelBufferTask(asset: ModelAssetDescriptor): SharedModelBufferTask {
  const cacheKey = modelCacheKey(asset);
  const cached = modelBufferTasks.get(cacheKey);
  if (cached) {
    cached.lastAccessedAt = Date.now();
    return cached;
  }

  // 首次下载期间，连接轮询可能把元数据指纹切为内容哈希；同一路由的未完成任务必须继续复用。
  const pendingForAsset = [...allModelBufferTasks].find((task) => task.assetUrl === asset.localAssetUrl && !task.settled);
  if (pendingForAsset) {
    registerTaskAlias(pendingForAsset, cacheKey);
    pendingForAsset.lastAccessedAt = Date.now();
    return pendingForAsset;
  }

  const controller = new AbortController();
  const task: SharedModelBufferTask = {
    assetUrl: asset.localAssetUrl,
    controller,
    promise: Promise.resolve({ buffer: new ArrayBuffer(0), responseVersion: null }),
    keys: new Set([cacheKey]),
    subscribers: new Set(),
    progress: { phase: 'preparing', percent: 0, receivedBytes: 0, expectedBytes: asset.fileSize || 0 },
    settled: false,
    succeeded: false,
    abortMessage: null,
    abortTimer: null,
    lastAccessedAt: Date.now(),
  };
  modelBufferTasks.set(cacheKey, task);
  allModelBufferTasks.add(task);

  task.promise = (async () => {
    const prepareTimer = window.setTimeout(() => {
      task.abortMessage = '模型资源准备超过 75 秒，请检查上游模型服务。';
      controller.abort();
    }, MODEL_PREPARE_TIMEOUT_MS);
    // 2026-08-27 调整：版本化 URL 允许浏览器复用已验证响应；服务端内容变化会生成新版本 URL。
    const response = await fetch(versionedModelUrl(asset), {
      cache: 'default',
      signal: controller.signal,
      headers: { Accept: 'application/octet-stream' },
    }).finally(() => window.clearTimeout(prepareTimer));
    if (!response.ok) throw await responseError(response);
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) throw await responseError(response);

    const expectedBytes = Number(response.headers.get('content-length') || asset.fileSize || 0);
    const responseVersion = response.headers.get('x-model-version')?.replace(/^"|"$/g, '') || null;
    if (responseVersion) registerTaskAlias(task, taskKey(asset.localAssetUrl, responseVersion));
    publishProgress(task, { phase: 'downloading', percent: 0, receivedBytes: 0, expectedBytes });
    if (!response.body) {
      const buffer = await response.arrayBuffer();
      validateModelBuffer(asset, buffer);
      publishProgress(task, { phase: 'parsing', percent: 98, receivedBytes: buffer.byteLength, expectedBytes: expectedBytes || buffer.byteLength });
      return { buffer, responseVersion };
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    let stallTimer: number | null = null;
    const armStallTimer = () => {
      if (stallTimer !== null) window.clearTimeout(stallTimer);
      stallTimer = window.setTimeout(() => {
        task.abortMessage = '模型下载连续 30 秒未收到数据，已停止本次请求。';
        controller.abort();
      }, MODEL_STREAM_STALL_TIMEOUT_MS);
    };
    armStallTimer();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        armStallTimer();
        chunks.push(value);
        received += value.byteLength;
        publishProgress(task, {
          phase: 'downloading',
          percent: expectedBytes > 0 ? Math.min(96, Math.round(received / expectedBytes * 100)) : 0,
          receivedBytes: received,
          expectedBytes,
        });
      }
    } finally {
      if (stallTimer !== null) window.clearTimeout(stallTimer);
    }
    const merged = new Uint8Array(received);
    let offset = 0;
    chunks.forEach((chunk) => {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    });
    validateModelBuffer(asset, merged.buffer);
    publishProgress(task, { phase: 'parsing', percent: 98, receivedBytes: received, expectedBytes: expectedBytes || received });
    return { buffer: merged.buffer, responseVersion };
  })().then((result) => {
    task.settled = true;
    task.succeeded = true;
    task.lastAccessedAt = Date.now();
    pruneResolvedTasks();
    return result;
  }).catch((error) => {
    task.settled = true;
    removeTask(task);
    if (task.abortMessage) throw new Error(task.abortMessage);
    throw error;
  });

  return task;
}

function disposeMaterial(material: THREE.Material): void {
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) value.dispose();
  });
  material.dispose();
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry?.dispose();
    if (Array.isArray(child.material)) child.material.forEach(disposeMaterial);
    else if (child.material) disposeMaterial(child.material);
  });
}

async function parseModel(asset: ModelAssetDescriptor, buffer: ArrayBuffer): Promise<THREE.Object3D> {
  if (asset.format === 'fbx') return new FBXLoader().parse(buffer, '');
  return new Promise<THREE.Object3D>((resolve, reject) => {
    new GLTFLoader().parse(buffer, '', (gltf) => resolve(gltf.scene), reject);
  });
}

export const RemoteModelViewer: React.FC<RemoteModelViewerProps> = ({
  asset,
  fields,
  renderConfig,
  accent,
  autoRotateSpeed,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef(fields);
  const rootRef = useRef<THREE.Object3D | null>(null);
  const activeVersionRef = useRef<string | null>(null);
  const baseXRef = useRef(0);
  const controlsRef = useRef<OrbitControls | null>(null);
  const installModelRef = useRef<((object: THREE.Object3D) => void) | null>(null);
  const resetViewRef = useRef<() => void>(() => undefined);
  const loadGenerationRef = useRef(0);
  const [loadProgress, setLoadProgress] = useState<ModelLoadProgress>({
    phase: 'preparing',
    percent: 0,
    receivedBytes: 0,
    expectedBytes: asset.fileSize || 0,
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [failureStage, setFailureStage] = useState<ModelLoadFailureStage | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [autoRotate, setAutoRotate] = useState(renderConfig?.auto_rotate !== false);
  const [hasRenderableModel, setHasRenderableModel] = useState(false);
  const [updatingModel, setUpdatingModel] = useState(false);
  const viewerSettingsKey = useMemo(() => JSON.stringify({
    background: renderConfig?.background_color,
    position: renderConfig?.camera_default?.position,
    target: renderConfig?.camera_default?.target,
  }), [renderConfig?.background_color, renderConfig?.camera_default?.position, renderConfig?.camera_default?.target]);

  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  useEffect(() => {
    setAutoRotate(renderConfig?.auto_rotate !== false);
  }, [renderConfig?.auto_rotate]);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (!loadError || hasRenderableModel) return;
    // 2026-08-12 调整：仅在没有任何可展示版本时自动重试，更新失败时保留旧模型且不反复下载；
    const timer = window.setTimeout(() => setReloadKey((value) => value + 1), 30_000);
    return () => window.clearTimeout(timer);
  }, [hasRenderableModel, loadError]);

  // 2026-08-12 调整：Three.js 场景生命周期与模型版本解耦，版本更新不再销毁画布和旧模型；
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    const scene = new THREE.Scene();
    const viewerBackground = resolveViewerBackground(renderConfig?.background_color);
    scene.background = viewerBackground;
    scene.fog = new THREE.FogExp2(viewerBackground, 0.045);

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 1_000);
    camera.position.set(...(renderConfig?.camera_default?.position || [5, 3, 8]));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 2026-08-09 修复：隔离高 DPI 绘图缓冲区与 CSS 布局尺寸，阻断 ResizeObserver 高度反馈循环；
    renderer.setSize(width, height, false);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.mixBlendMode = 'normal';
    renderer.domElement.style.opacity = '1';
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xbfe8ff, 0x111827, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(new THREE.Color(accent), 1.8);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const grid = new THREE.GridHelper(16, 32, new THREE.Color(accent), 0x183047);
    grid.position.y = -1.65;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.23;
    });
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = autoRotateSpeed;
    controls.target.set(...(renderConfig?.camera_default?.target || [0, 0, 0]));
    controls.update();
    controlsRef.current = controls;

    installModelRef.current = (object: THREE.Object3D) => {
      if (disposed) {
        disposeObject(object);
        return;
      }
      // 2026-08-28 修复：用几何中心枢轴承载旋转，避免偏心 FBX 绕远处建模原点公转并甩出视窗。
      const { root, size } = prepareViewerModel(object);
      baseXRef.current = root.position.x;
      const radius = Math.max(size.length() * 0.52, 2.4);
      const reset = () => {
        camera.position.set(radius * 1.15, radius * 0.72, radius * 1.45);
        controls.target.set(0, 0, 0);
        controls.update();
      };
      resetViewRef.current = reset;
      reset();
      root.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.castShadow = true;
        child.receiveShadow = true;
      });
      // 2026-08-12 新增：候选对象先完成 GPU 程序编译，再释放旧对象，避免解析成功但首帧失败或出现空白帧；
      const previous = rootRef.current;
      scene.add(root);
      try {
        renderer.compile(scene, camera);
      } catch (error) {
        scene.remove(root);
        throw error;
      }
      rootRef.current = root;
      if (previous) {
        scene.remove(previous);
        disposeObject(previous);
      }
    };

    const clock = new THREE.Clock();
    let animationFrame = 0;
    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.elapsedTime;
      const currentFields = fieldsRef.current;
      const vibration = currentFields.find((field) => field.field === 'vibration');
      const rpm = currentFields.find((field) => field.field === 'rpm');
      const abnormal = currentFields.some((field) => field.abnormal);
      const root = rootRef.current;
      if (root) {
        const vibrationRatio = vibration
          ? Math.min(1, Math.abs(vibration.value) / Math.max(Math.abs(vibration.normal_max), 0.001))
          : 0;
        root.position.x = baseXRef.current + Math.sin(elapsed * 18) * vibrationRatio * 0.018;
        // 2026-08-28 修复：旋转量按真实帧间隔计算，60/120 Hz 屏幕保持一致速度。
        if (rpm) root.rotation.y = advanceViewerRotation(root.rotation.y, rpm.value, delta);
        root.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if ('emissive' in material && material.emissive instanceof THREE.Color) {
              material.emissive.set(abnormal ? '#5b1212' : '#000000');
            }
          });
        });
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    let renderedWidth = width;
    let renderedHeight = height;
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(1, container.clientWidth);
      const nextHeight = Math.max(1, container.clientHeight);
      if (nextWidth === renderedWidth && nextHeight === renderedHeight) return;
      renderedWidth = nextWidth;
      renderedHeight = nextHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight, false);
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      loadGenerationRef.current += 1;
      installModelRef.current = null;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
      controls.dispose();
      controlsRef.current = null;
      if (rootRef.current) disposeObject(rootRef.current);
      rootRef.current = null;
      activeVersionRef.current = null;
      setHasRenderableModel(false);
      grid.geometry.dispose();
      gridMaterials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [accent, autoRotateSpeed, viewerSettingsKey]);

  // 2026-08-12 新增：候选版本独立下载和解析，失败不清理当前 rootRef；
  useEffect(() => {
    if (activeVersionRef.current === asset.version && rootRef.current) return;
    const generation = ++loadGenerationRef.current;
    let candidateObject: THREE.Object3D | null = null;
    const retainingPrevious = Boolean(rootRef.current);
    setUpdatingModel(retainingPrevious);
    setLoadProgress({ phase: 'preparing', percent: 0, receivedBytes: 0, expectedBytes: asset.fileSize || 0 });
    setLoadError(null);
    setFailureStage(null);

    const task = getModelBufferTask(asset);
    const unsubscribe = subscribeToTask(task, (nextProgress) => {
      if (loadGenerationRef.current === generation) setLoadProgress(nextProgress);
    });

    const fail = (error: unknown, stage: ModelLoadFailureStage) => {
      console.error('[model-showcase] 3D model load failed:', error);
      if (loadGenerationRef.current !== generation) return;
      setFailureStage(stage);
      setLoadError(error instanceof Error ? error.message : '3D 模型加载失败，请稍后重试。');
      setUpdatingModel(false);
    };

    void (async () => {
      let result: ModelBufferResult;
      try {
        result = await task.promise;
      } catch (error) {
        fail(error, 'request');
        return;
      }
      if (loadGenerationRef.current !== generation) return;
      try {
        setLoadProgress({
          phase: 'parsing',
          percent: 98,
          receivedBytes: result.buffer.byteLength,
          expectedBytes: result.buffer.byteLength,
        });
        // 先让浏览器绘制“解析中”，再执行 FBXLoader 的同步解析，避免下载完成后界面看似冻结。
        await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
        candidateObject = await parseModel(asset, result.buffer);
        if (loadGenerationRef.current !== generation || !installModelRef.current) {
          disposeObject(candidateObject);
          candidateObject = null;
          return;
        }
        installModelRef.current(candidateObject);
        candidateObject = null;
        activeVersionRef.current = result.responseVersion || asset.version;
        setHasRenderableModel(true);
        setUpdatingModel(false);
        setLoadError(null);
        setLoadProgress({
          phase: 'ready',
          percent: 100,
          receivedBytes: result.buffer.byteLength,
          expectedBytes: result.buffer.byteLength,
        });
      } catch (error) {
        if (candidateObject) disposeObject(candidateObject);
        candidateObject = null;
        fail(error, 'parse');
      }
    })();

    return () => {
      unsubscribe();
      if (loadGenerationRef.current === generation) loadGenerationRef.current += 1;
      if (candidateObject) disposeObject(candidateObject);
    };
  }, [asset.localAssetUrl, asset.version, asset.format, reloadKey, viewerSettingsKey]);

  return (
    <div className="remote-model-viewer industrial-visual-surface relative h-full min-h-0 max-h-full overflow-hidden bg-[#29485e] [contain:layout_paint]" ref={containerRef}>
      {loadProgress.phase !== 'ready' && !loadError && !hasRenderableModel && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07111f]/90">
          <div className="mb-3 text-xs tracking-[0.2em] text-cyan-300">
            {loadProgress.phase === 'preparing'
              ? '正在准备模型资源'
              : loadProgress.phase === 'parsing'
                ? '模型已下载，正在解析三维结构'
                : '正在下载三维模型'}
          </div>
          <div className="h-1.5 w-48 overflow-hidden rounded bg-slate-800">
            <div
              className={`h-full bg-cyan-400 transition-all ${loadProgress.phase === 'preparing' ? 'animate-pulse' : ''}`}
              style={{ width: loadProgress.phase === 'preparing' ? '28%' : `${loadProgress.percent}%` }}
            />
          </div>
          <div className="mt-2 font-mono text-xs text-slate-400">
            {loadProgress.phase === 'preparing'
              ? '正在建立安全缓存与下载通道'
              : loadProgress.phase === 'parsing'
                ? '98% · 请稍候'
                : `${loadProgress.percent}% · ${formatModelBytes(loadProgress.receivedBytes)} / ${formatModelBytes(loadProgress.expectedBytes)}`}
          </div>
          {loadProgress.phase === 'preparing' && (
            <div className="mt-2 text-[10px] text-slate-500">首次访问可能需要从模型资源平台准备文件</div>
          )}
        </div>
      )}
      {updatingModel && !loadError && hasRenderableModel && (
        <div className="pointer-events-none absolute left-3 bottom-3 z-20 rounded border border-sky-200 bg-sky-50/95 px-2.5 py-1.5 text-[10px] text-sky-800 shadow-sm">
          正在校验并加载新模型，当前版本继续展示
        </div>
      )}
      {loadError && !hasRenderableModel && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#29485e]/95 px-8 text-center text-sm text-rose-200">
          <span className="font-semibold">{failureStage === 'request' ? '模型资源请求失败' : '模型解析或渲染失败'}</span>
          <span className="mt-2 max-w-lg break-words leading-6">{loadError}</span>
          <span className="mt-2 max-w-lg text-[10px] leading-5 text-slate-300">
            {failureStage === 'request'
              ? '当前尚无可用模型，系统将在 30 秒后自动重试；也可立即重新加载。'
              : '模型二进制已取得，但解析或建立网格时发生异常。'}
          </span>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-4 border border-cyan-300/50 bg-cyan-50/10 px-4 py-2 text-xs text-cyan-100 hover:bg-cyan-50/20">
            重新加载模型
          </button>
        </div>
      )}
      {/* 2026-08-12 新增：候选版本失败时用小字说明并继续显示旧模型； */}
      {loadError && hasRenderableModel && (
        <div className="pointer-events-none absolute left-3 bottom-3 z-20 max-w-[70%] rounded border border-amber-300 bg-amber-50/95 px-2.5 py-1.5 text-[10px] leading-4 text-amber-900 shadow-sm">
          本次模型更新未成功，继续使用上次可用版本：{loadError}
        </div>
      )}
      <div className="absolute bottom-3 right-3 z-20 flex gap-2">
        <button type="button" onClick={() => setAutoRotate((value) => !value)} className="rounded border border-cyan-500/30 bg-slate-950/80 p-2 text-cyan-200 transition hover:border-cyan-400 hover:text-white" title={autoRotate ? '暂停自动旋转' : '开启自动旋转'}>
          {autoRotate ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button type="button" onClick={() => resetViewRef.current()} className="rounded border border-cyan-500/30 bg-slate-950/80 p-2 text-cyan-200 transition hover:border-cyan-400 hover:text-white" title="重置视角">
          <RotateCcw size={15} />
        </button>
        <button type="button" onClick={() => containerRef.current?.requestFullscreen?.()} className="rounded border border-cyan-500/30 bg-slate-950/80 p-2 text-cyan-200 transition hover:border-cyan-400 hover:text-white" title="全屏查看">
          <Expand size={15} />
        </button>
      </div>
      <div className="pointer-events-none absolute left-3 top-3 z-20 rounded border border-white/15 bg-slate-950/70 px-2.5 py-1.5 font-mono text-[10px] text-slate-200">
        {asset.fileName} · {(asset.fileSize / 1024 / 1024).toFixed(1)} MB · v{asset.version.slice(0, 8)}
      </div>
    </div>
  );
};
