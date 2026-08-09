
import * as THREE from 'three';
import { AgingAnimatables, AssessmentPhase } from './three-types';

export const initAgingScene = (
  group: THREE.Group, 
  animatables: AgingAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0x475569, 
    roughness: 0.9, 
    metalness: 0.3 
  }); 
  const rustMat = new THREE.MeshStandardMaterial({ 
    color: 0x78350f, 
    roughness: 1.0, 
    transparent: true, 
    opacity: 0.6 
  }); // 锈蚀色
  const internalMat = new THREE.MeshStandardMaterial({ 
    color: 0x94a3b8, 
    metalness: 0.8, 
    roughness: 0.2, 
    transparent: true, 
    opacity: 0.3 
  });
  const laserMat = new THREE.MeshBasicMaterial({ 
    color: 0xf59e0b, 
    transparent: true, 
    opacity: 0.4, 
    side: THREE.DoubleSide 
  });

  disposables.push(bodyMat, rustMat, internalMat, laserMat);

  // 1. 发动机主体 (Engine Block)
  const engineGroup = new THREE.Group();
  group.add(engineGroup);
  animatables.mainEngine = engineGroup;

  const block = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 3), bodyMat);
  block.position.y = 2;
  engineGroup.add(block);

  // 模拟外壳锈蚀斑点
  const rustGroup = new THREE.Group();
  for(let i=0; i<15; i++) {
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), rustMat);
    patch.scale.set(1.5, 0.1, 1.2);
    patch.position.set(
        (Math.random()-0.5)*6,
        1 + Math.random()*3,
        (Math.random()-0.5)*3.1
    );
    rustGroup.add(patch);
  }
  engineGroup.add(rustGroup);
  animatables.rustOverlay = rustGroup;

  // 2. 内部结构 (Crankshaft etc - Visible in NDT)
  const internalGroup = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 6), internalMat);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.y = 1.5;
  internalGroup.add(shaft);
  internalGroup.visible = false;
  engineGroup.add(internalGroup);
  animatables.internalCore = internalGroup;

  // 3. 扫描环 (Scanning Effect)
  const scanGeo = new THREE.TorusGeometry(3.5, 0.05, 16, 100);
  const scanRing = new THREE.Mesh(scanGeo, laserMat);
  scanRing.rotation.x = Math.PI / 2;
  scanRing.visible = false;
  group.add(scanRing);
  animatables.scanRing = scanRing;

  // 4. 故障热点 (Fatigue Hotspots)
  const hotGroup = new THREE.Group();
  const hotMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
  const points = [[2, 3, 1.51], [-1.5, 2.5, 1.51], [0, 1.2, 1.51]];
  points.forEach(p => {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), hotMat);
      dot.position.set(p[0], p[1], p[2]);
      hotGroup.add(dot);
  });
  hotGroup.visible = false;
  engineGroup.add(hotGroup);
  animatables.hotspots = hotGroup;

  // 5. 地面基座
  const floor = new THREE.GridHelper(30, 20, 0x334155, 0x1e293b);
  group.add(floor);
};

export const animateAgingScene = (
  animatables: AgingAnimatables, 
  phase: AssessmentPhase,
  time: number
) => {
  if (animatables.mainEngine) {
    if (phase === 'STRESS_TEST') {
        // 模拟高负荷下的剧烈震动
        animatables.mainEngine.position.x = Math.sin(time * 50) * 0.05;
        animatables.mainEngine.position.y = Math.cos(time * 40) * 0.05;
    } else {
        animatables.mainEngine.position.set(0, 0, 0);
    }
  }

  if (animatables.scanRing) {
    if (phase === 'NDT_SCAN') {
        animatables.scanRing.visible = true;
        animatables.scanRing.position.y = 1 + Math.sin(time * 2) * 3;
    } else {
        animatables.scanRing.visible = false;
    }
  }

  if (animatables.hotspots) {
      animatables.hotspots.visible = (phase === 'NDT_SCAN' || phase === 'REPAIR_SIM');
      animatables.hotspots.scale.setScalar(1 + Math.sin(time * 10) * 0.1);
  }

  if (animatables.internalCore) {
      animatables.internalCore.visible = (phase === 'NDT_SCAN');
  }

  if (animatables.rustOverlay && phase === 'UPGRADE_SIM') {
      // 模拟现代化改造：锈迹消失，设备变新
      animatables.rustOverlay.visible = false;
  } else if (animatables.rustOverlay) {
      animatables.rustOverlay.visible = true;
  }
};
