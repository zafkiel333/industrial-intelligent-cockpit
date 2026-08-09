
import * as THREE from 'three';
import { ShoalAnimatables, ShoalSimMode } from './three-types';

export const initShoalScene = (
  group: THREE.Group, 
  animatables: ShoalAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质定义 ---
  const bedMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9, roughness: 0.4, metalness: 0.3, flatShading: true, wireframe: false 
  });
  const wireMat = new THREE.MeshBasicMaterial({ 
    color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.1 
  });
  const pathMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });

  disposables.push(bedMat, wireMat, pathMat);

  // 1. 动态河床地形 (Riverbed Terrain)
  const width = 60, length = 100, segments = 64;
  const bedGeo = new THREE.PlaneGeometry(width, length, segments, segments);
  const pos = bedGeo.attributes.position;
  
  // 生成初始浅滩地形 (中心高，两边低，带有航道槽)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // 基础深度
    let z = Math.sin(x * 0.1) * 2;
    // 中间浅滩抬升
    const distToCenter = Math.sqrt(x*x + y*y);
    z += Math.max(0, 8 - distToCenter * 0.3);
    // 挖掘出的航道槽 (Channel Trench)
    if (Math.abs(x) < 6) {
        z -= 6;
    }
    pos.setZ(i, z);
  }
  bedGeo.computeVertexNormals();
  disposables.push(bedGeo);

  const bed = new THREE.Mesh(bedGeo, bedMat);
  bed.rotation.x = -Math.PI / 2;
  group.add(bed);
  animatables.riverBed = bed;

  const bedWire = new THREE.Mesh(bedGeo, wireMat);
  bedWire.rotation.x = -Math.PI / 2;
  bedWire.position.y = 0.05;
  group.add(bedWire);

  // 2. 航道中心线 (Channel Axis)
  const linePoints = [];
  for(let i=-50; i<=50; i+=2) {
      linePoints.push(new THREE.Vector3(0, 0.5, i));
  }
  const pathGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
  const pathLine = new THREE.Line(pathGeo, pathMat);
  group.add(pathLine);
  animatables.channelPath = pathLine;

  // 3. 悬浮泥沙粒子 (Sediment)
  const pCount = 800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for(let i=0; i<pCount; i++) {
      pPos[i*3] = (Math.random()-0.5)*40;
      pPos[i*3+1] = Math.random()*5;
      pPos[i*3+2] = (Math.random()-0.5)*80;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.15, transparent: true, opacity: 0.4 });
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);
  animatables.sedimentCloud = particles;

  // 4. 水面辅助
  const waterGeo = new THREE.PlaneGeometry(60, 100);
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x0c4a6e, transparent: true, opacity: 0.3 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI/2;
  water.position.y = 10;
  group.add(water);

  // 5. 辅助网格
  const grid = new THREE.GridHelper(100, 20, 0x1e293b, 0x0f172a);
  grid.position.y = -5;
  group.add(grid);
};

export const animateShoalScene = (
  animatables: ShoalAnimatables, 
  mode: ShoalSimMode,
  time: number
) => {
  // 1. 粒子流动
  if (animatables.sedimentCloud && animatables.sedimentCloud.geometry.attributes.position) {
      const pos = animatables.sedimentCloud.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<pos.length; i+=3) {
          pos[i+2] += 0.1; // 向下游流动
          if (pos[i+2] > 40) pos[i+2] = -40;
          pos[i+1] += Math.sin(time + i)*0.01;
      }
      animatables.sedimentCloud.geometry.attributes.position.needsUpdate = true;
  }

  // 2. 地形演变脉冲
  if (animatables.riverBed && mode === 'EVOLUTION') {
      const pos = animatables.riverBed.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const originalZ = pos.getZ(i);
          // 模拟泥沙淤积波动
          if (Math.abs(x) > 8) {
              pos.setZ(i, originalZ + Math.sin(time*0.5 + y*0.1) * 0.02);
          }
      }
      animatables.riverBed.geometry.attributes.position.needsUpdate = true;
  }
};
