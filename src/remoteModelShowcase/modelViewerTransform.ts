import * as THREE from 'three';

const VIEWER_MODEL_MAX_DIMENSION = 4.8;
const VIEWER_MAX_ROTATION_RATE = 0.48;
const VIEWER_RPM_ROTATION_DIVISOR = 3_333.333333;
const VIEWER_MAX_FRAME_DELTA_SECONDS = 0.1;

export interface PreparedViewerModel {
  root: THREE.Group;
  size: THREE.Vector3;
  meshCount: number;
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
