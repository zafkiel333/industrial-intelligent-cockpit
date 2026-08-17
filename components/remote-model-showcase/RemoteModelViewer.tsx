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

interface RemoteModelViewerProps {
  asset: ModelAssetDescriptor;
  fields: RemoteBindableField[];
  renderConfig?: RemoteRenderConfig;
  accent: string;
  autoRotateSpeed: number;
}

type ModelLoadFailureStage = 'request' | 'parse';

// 2026-08-12 调整：缓存键同时包含本地路由和内容版本，版本变化后绝不复用旧 ArrayBuffer；
const modelBufferCache = new Map<string, Promise<ArrayBuffer>>();

function modelCacheKey(asset: ModelAssetDescriptor): string {
  return `${asset.localAssetUrl}::${asset.version}`;
}

function versionedModelUrl(asset: ModelAssetDescriptor): string {
  const url = new URL(apiUrl(asset.localAssetUrl), window.location.origin);
  url.searchParams.set('v', asset.version);
  return `${url.pathname}${url.search}`;
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

async function fetchModelBuffer(
  asset: ModelAssetDescriptor,
  onProgress: (progress: number) => void,
): Promise<ArrayBuffer> {
  const cacheKey = modelCacheKey(asset);
  const cached = modelBufferCache.get(cacheKey);
  if (cached) {
    const buffer = await cached;
    onProgress(100);
    return buffer;
  }

  const request = (async () => {
    // 2026-08-12 调整：版本化 URL 配合 no-store，避免浏览器在服务端版本变化后返回旧响应；
    const response = await fetch(versionedModelUrl(asset), {
      cache: 'no-store',
      headers: { Accept: 'application/octet-stream' },
    });
    if (!response.ok) throw await responseError(response);
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) throw await responseError(response);

    const expectedBytes = Number(response.headers.get('content-length') || asset.fileSize || 0);
    if (!response.body) {
      const buffer = await response.arrayBuffer();
      validateModelBuffer(asset, buffer);
      return buffer;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      if (expectedBytes > 0) onProgress(Math.min(96, Math.round(received / expectedBytes * 100)));
    }
    const merged = new Uint8Array(received);
    let offset = 0;
    chunks.forEach((chunk) => {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    });
    validateModelBuffer(asset, merged.buffer);
    return merged.buffer;
  })();

  modelBufferCache.set(cacheKey, request);
  try {
    return await request;
  } catch (error) {
    modelBufferCache.delete(cacheKey);
    throw error;
  }
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
  const [progress, setProgress] = useState(0);
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
      let meshCount = 0;
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) meshCount += 1;
      });
      object.updateMatrixWorld(true);
      const initialBox = new THREE.Box3().setFromObject(object);
      if (meshCount === 0 || initialBox.isEmpty()) {
        disposeObject(object);
        throw new Error('模型文件已解析，但没有可显示的网格对象');
      }
      const initialSize = initialBox.getSize(new THREE.Vector3());
      const scale = 4.8 / Math.max(initialSize.x, initialSize.y, initialSize.z, 0.001);
      object.scale.multiplyScalar(scale);
      const box = new THREE.Box3().setFromObject(object);
      object.position.sub(box.getCenter(new THREE.Vector3()));
      baseXRef.current = object.position.x;
      const size = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
      const radius = Math.max(size.length() * 0.52, 2.4);
      const reset = () => {
        camera.position.set(radius * 1.15, radius * 0.72, radius * 1.45);
        controls.target.set(0, 0, 0);
        controls.update();
      };
      resetViewRef.current = reset;
      reset();
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.castShadow = true;
        child.receiveShadow = true;
      });
      // 2026-08-12 新增：候选对象先完成 GPU 程序编译，再释放旧对象，避免解析成功但首帧失败或出现空白帧；
      const previous = rootRef.current;
      scene.add(object);
      try {
        renderer.compile(scene, camera);
      } catch (error) {
        scene.remove(object);
        throw error;
      }
      rootRef.current = object;
      if (previous) {
        scene.remove(previous);
        disposeObject(previous);
      }
    };

    const clock = new THREE.Clock();
    let animationFrame = 0;
    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
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
        if (rpm) root.rotation.y += Math.min(Math.abs(rpm.value) / 200_000, 0.008);
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
    setProgress(0);
    setLoadError(null);
    setFailureStage(null);

    const fail = (error: unknown, stage: ModelLoadFailureStage) => {
      console.error('[model-showcase] 3D model load failed:', error);
      if (loadGenerationRef.current !== generation) return;
      setFailureStage(stage);
      setLoadError(error instanceof Error ? error.message : '3D 模型加载失败，请稍后重试。');
      setUpdatingModel(false);
    };

    void (async () => {
      let buffer: ArrayBuffer;
      try {
        buffer = await fetchModelBuffer(asset, (nextProgress) => {
          if (loadGenerationRef.current === generation) setProgress(nextProgress);
        });
      } catch (error) {
        fail(error, 'request');
        return;
      }
      if (loadGenerationRef.current !== generation) return;
      try {
        candidateObject = await parseModel(asset, buffer);
        if (loadGenerationRef.current !== generation || !installModelRef.current) {
          disposeObject(candidateObject);
          candidateObject = null;
          return;
        }
        installModelRef.current(candidateObject);
        candidateObject = null;
        activeVersionRef.current = asset.version;
        setHasRenderableModel(true);
        setUpdatingModel(false);
        setLoadError(null);
        setProgress(100);
        // 2026-08-12 新增：新版本切换成功后释放同一路由的旧 ArrayBuffer 缓存；
        const activeKey = modelCacheKey(asset);
        for (const key of modelBufferCache.keys()) {
          if (key.startsWith(`${asset.localAssetUrl}::`) && key !== activeKey) modelBufferCache.delete(key);
        }
      } catch (error) {
        if (candidateObject) disposeObject(candidateObject);
        candidateObject = null;
        fail(error, 'parse');
      }
    })();

    return () => {
      if (loadGenerationRef.current === generation) loadGenerationRef.current += 1;
      if (candidateObject) disposeObject(candidateObject);
    };
  }, [asset.localAssetUrl, asset.version, asset.format, reloadKey, viewerSettingsKey]);

  return (
    <div className="remote-model-viewer industrial-visual-surface relative h-full min-h-0 max-h-full overflow-hidden bg-[#29485e] [contain:layout_paint]" ref={containerRef}>
      {progress < 100 && !loadError && !hasRenderableModel && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07111f]/90">
          <div className="mb-3 text-xs tracking-[0.28em] text-cyan-300">正在通过 API 加载模型</div>
          <div className="h-1.5 w-48 overflow-hidden rounded bg-slate-800">
            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 font-mono text-xs text-slate-400">{progress}%</div>
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
