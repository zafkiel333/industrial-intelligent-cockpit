
import * as THREE from 'three';
import { PathAnimatables, SimPathState } from './three-types';

export const initPathScene = (
  group: THREE.Group, 
  animatables: PathAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- Materials ---
  const structureMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, roughness: 0.8, metalness: 0.2, wireframe: false 
  });
  const compMat = new THREE.MeshStandardMaterial({ 
    color: 0xa855f7, roughness: 0.3, metalness: 0.7, emissive: 0x6b21a8, emissiveIntensity: 0.2
  });
  const pathMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 });
  const laserMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.3 });
  const volumeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.05 });

  disposables.push(structureMat, compMat, pathMat, laserMat, volumeMat);

  // 1. 复杂环境背景 (Tunnel & Racks)
  const envGroup = new THREE.Group();
  const cageGeo = new THREE.BoxGeometry(10, 8, 30);
  const cage = new THREE.Mesh(cageGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.BackSide, wireframe: true }));
  envGroup.add(cage);
  
  // 模拟支架障碍物
  const obsGroup = new THREE.Group();
  for(let i=0; i<6; i++) {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 1), structureMat);
      rack.position.set(i % 2 === 0 ? -3.5 : 3.5, 0, -10 + i * 4);
      obsGroup.add(rack);
  }
  envGroup.add(obsGroup);
  group.add(envGroup);
  animatables.obstacles = obsGroup;

  // 2. 待移出部件 (Modification Target: e.g., Motor)
  const motorGroup = new THREE.Group();
  const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3), compMat);
  motorBody.rotateX(Math.PI/2);
  motorGroup.add(motorBody);
  motorGroup.position.set(0, 0, -12); // 起始深度
  group.add(motorGroup);
  animatables.movingComponent = motorGroup;

  // 3. 规划路径线 (Path Line)
  const pathPoints = [
      new THREE.Vector3(0, 0, -12),
      new THREE.Vector3(1, 0.5, -8),
      new THREE.Vector3(-1.5, -0.5, -2),
      new THREE.Vector3(0, 0, 5),
      new THREE.Vector3(2, 1, 12)
  ];
  const curve = new THREE.CatmullRomCurve3(pathPoints);
  const curvePoints = curve.getPoints(100);
  const pathGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const pathLine = new THREE.Line(pathGeo, pathMat);
  group.add(pathLine);
  animatables.pathLine = pathLine;
  
  // 扫掠体积 (Swept Volume Visual)
  const tubeGeo = new THREE.TubeGeometry(curve, 100, 1.5, 8, false);
  const sweptVolume = new THREE.Mesh(tubeGeo, volumeMat);
  group.add(sweptVolume);
  animatables.sweptVolume = sweptVolume;

  // 4. 关键路径点标记
  const markerGroup = new THREE.Group();
  const markerGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  pathPoints.forEach(p => {
      const m = new THREE.Mesh(markerGeo, markerMat);
      m.position.copy(p);
      markerGroup.add(m);
  });
  group.add(markerGroup);
  animatables.waypointMarkers = markerGroup;

  // 5. 激光扫描器 (Scan beam)
  const laserGeo = new THREE.CylinderGeometry(0.01, 4, 10);
  laserGeo.rotateX(Math.PI/2);
  laserGeo.translate(0,0,5);
  const scanner = new THREE.Mesh(laserGeo, laserMat);
  scanner.visible = false;
  group.add(scanner);
  animatables.scannerBeam = scanner;

  // Floor Grid
  const grid = new THREE.GridHelper(60, 30, 0x334155, 0x0f172a);
  grid.position.y = -4;
  group.add(grid);
};

export const animatePathSim = (
  animatables: PathAnimatables, 
  state: SimPathState,
  time: number
) => {
  if (!animatables.movingComponent) return;

  // 1. 自动执行仿真动画
  if (state === 'EXECUTING' || state === 'FINISH') {
      const curve = (animatables.pathLine?.geometry as THREE.BufferGeometry).userData?.curve || 
                    new THREE.CatmullRomCurve3([
                        new THREE.Vector3(0, 0, -12),
                        new THREE.Vector3(1, 0.5, -8),
                        new THREE.Vector3(-1.5, -0.5, -2),
                        new THREE.Vector3(0, 0, 5),
                        new THREE.Vector3(2, 1, 12)
                    ]);
      
      const t = (time * 0.1) % 1;
      const pos = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      
      animatables.movingComponent.position.copy(pos);
      animatables.movingComponent.lookAt(pos.clone().add(tangent));
  }

  // 2. 扫描状态
  if (state === 'ANALYZING') {
      if (animatables.scannerBeam) {
          animatables.scannerBeam.visible = true;
          animatables.scannerBeam.rotation.z += 0.05;
          animatables.scannerBeam.position.z = Math.sin(time) * 10;
      }
  } else {
      if (animatables.scannerBeam) animatables.scannerBeam.visible = false;
  }

  // 3. 故障干涉状态
  if (state === 'INTERFERENCE') {
      animatables.movingComponent.position.set(1, 0.5, -8); // 停止在干涉点
      const compMat = (animatables.movingComponent.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      compMat.emissive.setHex(0xef4444);
      compMat.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
  } else {
      const compMat = (animatables.movingComponent.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (compMat) compMat.emissiveIntensity = 0.2;
  }
};
