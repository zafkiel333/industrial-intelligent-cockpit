import * as THREE from 'three';

const VIEWER_MODEL_MAX_DIMENSION = 4.8;
const VIEWER_MAX_ROTATION_RATE = 0.48;
const VIEWER_RPM_ROTATION_DIVISOR = 3_333.333333;
const VIEWER_MAX_FRAME_DELTA_SECONDS = 0.1;
const VIEWER_BASE_EMISSIVE_USER_DATA_KEY = 'remoteViewerBaseEmissive';
const VIEWER_TEXTURED_EMISSIVE_LIFT = 0.14;
const VIEWER_UNTEXTURED_EMISSIVE_LIFT = 0.018;

export interface PreparedViewerModel {
  root: THREE.Group;
  size: THREE.Vector3;
  meshCount: number;
}

export interface ViewerMaterialVisibilityResult {
  materialCount: number;
  texturedMaterialCount: number;
  rescuedTextureMaterialCount: number;
}

type ViewerColorMaterial = THREE.Material & {
  color?: THREE.Color;
  map?: THREE.Texture | null;
  emissive?: THREE.Color;
  emissiveMap?: THREE.Texture | null;
};

function viewerColorMaterial(material: THREE.Material): ViewerColorMaterial | null {
  const candidate = material as ViewerColorMaterial;
  return candidate.color instanceof THREE.Color && candidate.emissive instanceof THREE.Color
    ? candidate
    : null;
}

/**
 * 统一模型库中依赖贴图的 FBX 显示下限。
 *
 * 部分资源的缩略图颜色丰富，但 FBX 内嵌贴图在浏览器中会解析成近黑纹理；仅增加灯光无法
 * 改善纯黑漫反射。这里保留原材质和贴图，只给贴图材质增加很低的无贴图自发光底色，同时
 * 取消会再次把底色乘黑的 emissiveMap。优先模型替换仍由页面绑定完成，本函数只负责兜底。
 */
export function enhanceViewerMaterialVisibility(root: THREE.Object3D): ViewerMaterialVisibilityResult {
  const visited = new Set<THREE.Material>();
  let texturedMaterialCount = 0;
  let rescuedTextureMaterialCount = 0;

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material || visited.has(material)) return;
      visited.add(material);
      const candidate = viewerColorMaterial(material);
      if (!candidate) return;

      const importedEmissive = candidate.emissive!.clone();
      const hasDiffuseTexture = candidate.map instanceof THREE.Texture;
      if (hasDiffuseTexture) {
        texturedMaterialCount += 1;
        candidate.map!.colorSpace = THREE.SRGBColorSpace;
      }

      const baseEmissive = candidate.color!.clone().multiplyScalar(
        hasDiffuseTexture ? VIEWER_TEXTURED_EMISSIVE_LIFT : VIEWER_UNTEXTURED_EMISSIVE_LIFT,
      );
      if (!hasDiffuseTexture && importedEmissive.getHex() !== 0x000000) {
        baseEmissive.add(importedEmissive.multiplyScalar(0.22));
      }

      if (hasDiffuseTexture && candidate.emissiveMap instanceof THREE.Texture) {
        candidate.emissiveMap = null;
      }
      if (hasDiffuseTexture) rescuedTextureMaterialCount += 1;

      baseEmissive.r = Math.min(baseEmissive.r, 1);
      baseEmissive.g = Math.min(baseEmissive.g, 1);
      baseEmissive.b = Math.min(baseEmissive.b, 1);
      material.userData[VIEWER_BASE_EMISSIVE_USER_DATA_KEY] = baseEmissive.getHex();
      candidate.emissive!.copy(baseEmissive);
      material.needsUpdate = true;
    });
  });

  return {
    materialCount: visited.size,
    texturedMaterialCount,
    rescuedTextureMaterialCount,
  };
}

/** 在告警红色覆盖结束后恢复每个模型材质自身的可读性底色。 */
export function applyViewerMaterialAlertState(material: THREE.Material, abnormal: boolean): void {
  const candidate = viewerColorMaterial(material);
  if (!candidate) return;
  if (abnormal) {
    candidate.emissive!.set('#5b1212');
    return;
  }
  const stored = material.userData[VIEWER_BASE_EMISSIVE_USER_DATA_KEY];
  candidate.emissive!.setHex(typeof stored === 'number' ? stored : 0x000000);
}

/**
 * 将来源模型放进以几何中心为原点的独立枢轴。
 *
 * 不能只修改来源根节点的位置后再旋转该根节点：部分 FBX 的建模原点距离
 * 实际几何体很远，这样会让模型绕来源原点公转并快速离开视窗中心。
 */
export function prepareViewerModel(
  object: THREE.Object3D,
  maxDimension = VIEWER_MODEL_MAX_DIMENSION,
): PreparedViewerModel {
  let meshCount = 0;
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) meshCount += 1;
  });

  object.updateMatrixWorld(true);
  const initialBox = new THREE.Box3().setFromObject(object);
  if (meshCount === 0 || initialBox.isEmpty()) {
    throw new Error('模型文件已解析，但没有可显示的网格对象');
  }

  const initialSize = initialBox.getSize(new THREE.Vector3());
  const largestDimension = Math.max(initialSize.x, initialSize.y, initialSize.z, 0.001);
  object.scale.multiplyScalar(maxDimension / largestDimension);
  object.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(object);
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
  object.position.sub(scaledCenter);

  const root = new THREE.Group();
  root.name = 'remote-model-centered-pivot';
  root.add(object);
  root.updateMatrixWorld(true);

  return {
    root,
    size: new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()),
    meshCount,
  };
}

/** 使用真实帧间隔推进遥测驱动的视觉旋转，避免高刷新率屏幕转得更快。 */
export function advanceViewerRotation(
  currentAngle: number,
  rpm: number,
  deltaSeconds: number,
): number {
  const safeAngle = Number.isFinite(currentAngle) ? currentAngle : 0;
  const safeRpm = Number.isFinite(rpm) ? Math.abs(rpm) : 0;
  const safeDelta = Number.isFinite(deltaSeconds)
    ? Math.min(Math.max(deltaSeconds, 0), VIEWER_MAX_FRAME_DELTA_SECONDS)
    : 0;
  const rotationRate = Math.min(safeRpm / VIEWER_RPM_ROTATION_DIVISOR, VIEWER_MAX_ROTATION_RATE);
  return (safeAngle + rotationRate * safeDelta) % (Math.PI * 2);
}
