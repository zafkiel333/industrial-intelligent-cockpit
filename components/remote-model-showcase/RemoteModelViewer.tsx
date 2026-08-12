// 2026-08-09 新增：通过本地 BFF 加载并交互展示 FBX/GLB/GLTF 外部模型；
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Expand, Pause, Play, RotateCcw } from 'lucide-react';
import type { ModelAssetDescriptor, RemoteBindableField, RemoteRenderConfig } from '../../src/remoteModelShowcase/types';

interface RemoteModelViewerProps {
  asset: ModelAssetDescriptor;
  fields: RemoteBindableField[];
  renderConfig?: RemoteRenderConfig;
  accent: string;
  autoRotateSpeed: number;
}

type ModelLoadFailureStage = 'request' | 'parse';

// 2026-08-09 修复：缓存已校验的模型二进制并合并同一资源的并发请求；
const modelBufferCache = new Map<string, Promise<ArrayBuffer>>();

async function responseError(response: Response): Promise<Error> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => ({})) as { error?: { code?: string; message?: string }; message?: string };
    const message = payload.error?.message || payload.message || `模型代理请求失败（${response.status}）`;
    // 2026-08-12 调整：保留后端模型错误码，便于区分远端资源失败和前端解析失败；
    return new Error(payload.error?.code ? `${message}（${payload.error.code}）` : message);
  }
  return new Error(`模型代理请求失败（${response.status}）`);
}

// 2026-08-12 新增：将 API 返回的近黑背景提升为中深蓝灰，直接在 Three.js 场景内改善灰模辨识度；
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
  const cached = modelBufferCache.get(asset.localAssetUrl);
  if (cached) {
    const buffer = await cached;
    onProgress(100);
    return buffer;
  }

  const request = (async () => {
    const response = await fetch(asset.localAssetUrl, { headers: { Accept: 'application/octet-stream' } });
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

  modelBufferCache.set(asset.localAssetUrl, request);
  try {
    return await request;
  } catch (error) {
    modelBufferCache.delete(asset.localAssetUrl);
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
  const baseXRef = useRef(0);
  const controlsRef = useRef<OrbitControls | null>(null);
  const resetViewRef = useRef<() => void>(() => undefined);
  const [progress, setProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [failureStage, setFailureStage] = useState<ModelLoadFailureStage | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [autoRotate, setAutoRotate] = useState(renderConfig?.auto_rotate !== false);

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
    if (!loadError) return;
    // 2026-08-09 修复：模型存储暂时不可用时每 30 秒自动重试，同时保留手动重试入口；
    const timer = window.setTimeout(() => setReloadKey((value) => value + 1), 30_000);
    return () => window.clearTimeout(timer);
  }, [loadError]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;

    setProgress(0);
    setLoadError(null);
    setFailureStage(null);
    const scene = new THREE.Scene();
    const viewerBackground = resolveViewerBackground(renderConfig?.background_color);
    scene.background = viewerBackground;
    scene.fog = new THREE.FogExp2(viewerBackground, 0.045);

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 1_000);
    const configuredPosition = renderConfig?.camera_default?.position;
    camera.position.set(...(configuredPosition || [5, 3, 8]));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 2026-08-09 修复：隔离高 DPI 绘图缓冲区与 CSS 布局尺寸，阻断 ResizeObserver 高度反馈循环；
    // Keep the drawing buffer at device resolution, but decouple the canvas'
    // intrinsic pixel size from layout. Without the explicit CSS size, a
    // high-DPI canvas can enlarge its parent, which then triggers another
    // ResizeObserver resize and causes an unbounded height feedback loop.
    renderer.setSize(width, height, false);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    // 2026-08-12 修复：FBX WebGL 画布强制使用正常合成，避免全局 Canvas 混合模式导致画布不显示；
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

    const target = new THREE.Vector3(...(renderConfig?.camera_default?.target || [0, 0, 0]));
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = autoRotateSpeed;
    controls.target.copy(target);
    controls.update();
    controlsRef.current = controls;

    const fitModel = (object: THREE.Object3D) => {
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
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      baseXRef.current = object.position.x;
      const fittedBox = new THREE.Box3().setFromObject(object);
      const size = fittedBox.getSize(new THREE.Vector3());
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
      scene.add(object);
      rootRef.current = object;
      setProgress(100);
    };

    const onError = (error: unknown, stage: ModelLoadFailureStage) => {
      console.error('[model-showcase] 3D model load failed:', error);
      if (!disposed) {
        setFailureStage(stage);
        setLoadError(error instanceof Error ? error.message : '3D 模型加载失败，请稍后重试。');
      }
    };

    const loadModel = async () => {
      let buffer: ArrayBuffer;
      try {
        buffer = await fetchModelBuffer(asset, (nextProgress) => {
          if (!disposed) setProgress(nextProgress);
        });
      } catch (error) {
        onError(error, 'request');
        return;
      }
      if (disposed) return;
      try {
        if (asset.format === 'fbx') {
          fitModel(new FBXLoader().parse(buffer, ''));
        } else {
          await new Promise<void>((resolve, reject) => {
            new GLTFLoader().parse(buffer, '', (gltf) => {
              try {
                fitModel(gltf.scene);
                resolve();
              } catch (error) {
                reject(error);
              }
            }, reject);
          });
        }
      } catch (error) {
        onError(error, 'parse');
      }
    };
    void loadModel();

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
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
      controls.dispose();
      controlsRef.current = null;
      if (rootRef.current) disposeObject(rootRef.current);
      rootRef.current = null;
      grid.geometry.dispose();
      gridMaterials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [accent, asset, autoRotateSpeed, reloadKey, renderConfig]);

  return (
    // 2026-08-12 调整：为外部模型视窗增加独立样式作用域，隔离全局浅色兼容规则；
    <div className="remote-model-viewer industrial-visual-surface relative h-full min-h-0 max-h-full overflow-hidden bg-[#29485e] [contain:layout_paint]" ref={containerRef}>
      {progress < 100 && !loadError && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07111f]/90">
          <div className="mb-3 text-xs tracking-[0.28em] text-cyan-300">正在通过 API 加载模型</div>
          <div className="h-1.5 w-48 overflow-hidden rounded bg-slate-800">
            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 font-mono text-xs text-slate-400">{progress}%</div>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#29485e]/95 px-8 text-center text-sm text-rose-300">
          <span className="font-semibold">{failureStage === 'request' ? '模型资源请求失败' : '模型解析或渲染失败'}</span>
          <span className="mt-2 max-w-lg break-words leading-6">{loadError}</span>
          <span className="mt-2 max-w-lg text-[10px] leading-5 text-slate-400">
            {failureStage === 'request'
              ? '前端视窗与 FBX 加载器已就绪，但后端未取得有效模型二进制；失败后每 30 秒自动重试。'
              : '模型二进制已经取得，但解析或建立网格时发生异常；可重新加载并查看浏览器错误信息。'}
          </span>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-4 border border-cyan-500/35 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-200 hover:bg-cyan-500/20">
            重新加载模型
          </button>
        </div>
      )}
      <div className="absolute bottom-3 right-3 z-20 flex gap-2">
        <button
          type="button"
          onClick={() => setAutoRotate((value) => !value)}
          className="rounded border border-cyan-500/30 bg-slate-950/80 p-2 text-cyan-200 transition hover:border-cyan-400 hover:text-white"
          title={autoRotate ? '暂停自动旋转' : '开启自动旋转'}
        >
          {autoRotate ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button type="button" onClick={() => resetViewRef.current()} className="rounded border border-cyan-500/30 bg-slate-950/80 p-2 text-cyan-200 transition hover:border-cyan-400 hover:text-white" title="重置视角">
          <RotateCcw size={15} />
        </button>
        <button type="button" onClick={() => containerRef.current?.requestFullscreen?.()} className="rounded border border-cyan-500/30 bg-slate-950/80 p-2 text-cyan-200 transition hover:border-cyan-400 hover:text-white" title="全屏查看">
          <Expand size={15} />
        </button>
      </div>
      <div className="pointer-events-none absolute left-3 top-3 z-20 rounded border border-white/10 bg-slate-950/65 px-2.5 py-1.5 font-mono text-[10px] text-slate-300">
        {asset.fileName} · {(asset.fileSize / 1024 / 1024).toFixed(1)} MB
      </div>
    </div>
  );
};
