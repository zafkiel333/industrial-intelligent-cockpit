
import * as THREE from 'three';
import { DustAnimatables, SprayStrategy } from './three-types';

export const initDustScene = (
  group: THREE.Group, 
  animatables: DustAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质 ---
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
  const coalMat = new THREE.MeshStandardMaterial({ 
    color: 0x262626, roughness: 1.0, flatShading: true 
  });
  const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  
  // 粒子材质
  const dustMat = new THREE.PointsMaterial({ 
    color: 0xdca54c, size: 0.15, transparent: true, opacity: 0.6, 
    blending: THREE.AdditiveBlending, depthWrite: false 
  });
  const mistMat = new THREE.PointsMaterial({ 
    color: 0x22d3ee, size: 0.1, transparent: true, opacity: 0.4, 
    blending: THREE.AdditiveBlending, depthWrite: false 
  });

  disposables.push(groundMat, coalMat, nozzleMat, pipeMat, dustMat, mistMat);

  // 1. 堆场地面
  const floorGeo = new THREE.PlaneGeometry(60, 40);
  floorGeo.rotateX(-Math.PI/2);
  const floor = new THREE.Mesh(floorGeo, groundMat);
  floor.position.y = -0.1;
  group.add(floor);
  
  // 边界围网
  const fenceGeo = new THREE.BoxGeometry(60, 2, 0.2);
  const fence = new THREE.Mesh(fenceGeo, new THREE.MeshBasicMaterial({color: 0x334155, wireframe: true}));
  fence.position.set(0, 1, -20);
  group.add(fence);
  animatables.boundary = fence;

  // 2. 料堆 (Coal Stockpiles)
  animatables.stockpiles = new THREE.Group();
  group.add(animatables.stockpiles);

  // 创建两个长条形料堆
  for(let i=0; i<2; i++) {
      const zPos = i === 0 ? -8 : 8;
      // 使用 ParametricGeometry 或 变形 Cylinder 模拟料堆
      const pileGeo = new THREE.ConeGeometry(6, 4, 32, 1, true);
      // 拉长成棱体
      pileGeo.scale(3, 1, 1); 
      const pile = new THREE.Mesh(pileGeo, coalMat);
      pile.position.set(0, 2, zPos);
      animatables.stockpiles.add(pile);
  }

  // 3. 喷淋塔 (Sprinkler Towers)
  animatables.sprinklers = [];
  // 沿料堆两侧布置
  const positions = [
    {x: -10, z: 0}, {x: 0, z: 0}, {x: 10, z: 0}, // 中间通道
    {x: -10, z: -15}, {x: 0, z: -15}, {x: 10, z: -15}, // 后侧
    {x: -10, z: 15}, {x: 0, z: 15}, {x: 10, z: 15} // 前侧
  ];

  const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 6);
  disposables.push(poleGeo);

  positions.forEach(pos => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(pos.x, 0, pos.z);
      
      const pole = new THREE.Mesh(poleGeo, pipeMat);
      pole.position.y = 3;
      towerGroup.add(pole);

      // 喷头关节
      const headGroup = new THREE.Group();
      headGroup.position.y = 6;
      const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 8), nozzleMat);
      nozzle.rotation.x = Math.PI/2;
      nozzle.position.z = 0.4;
      headGroup.add(nozzle);
      
      towerGroup.add(headGroup);
      group.add(towerGroup);
      
      // 存储喷头组以便旋转
      animatables.sprinklers?.push(headGroup);
  });

  // 4. 扬尘粒子系统
  const dustCount = 1000;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  const dustVel = new Float32Array(dustCount * 3); // 速度
  
  for(let i=0; i<dustCount; i++) {
      // 随机分布在料堆表面附近
      dustPos[i*3] = (Math.random()-0.5) * 30;
      dustPos[i*3+1] = Math.random() * 4;
      dustPos[i*3+2] = (Math.random()-0.5) * 25;
      
      dustVel[i*3] = (Math.random()-0.5)*0.02;
      dustVel[i*3+1] = Math.random()*0.02;
      dustVel[i*3+2] = (Math.random()-0.5)*0.02;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('velocity', new THREE.BufferAttribute(dustVel, 3));
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);
  animatables.dustParticles = dust;

  // 5. 水雾粒子系统
  const mistCount = 2000;
  const mistGeo = new THREE.BufferGeometry();
  const mistPos = new Float32Array(mistCount * 3);
  // 把所有水雾粒子先藏起来
  for(let i=0; i<mistCount; i++) {
      mistPos[i*3] = 0; mistPos[i*3+1] = -100; mistPos[i*3+2] = 0;
  }
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
  // 自定义属性：生命周期，源喷头索引
  const mistLife = new Float32Array(mistCount).fill(0);
  mistGeo.setAttribute('life', new THREE.BufferAttribute(mistLife, 1));
  
  const mist = new THREE.Points(mistGeo, mistMat);
  group.add(mist);
  animatables.mistParticles = mist;
};

export const animateDustScene = (
  animatables: DustAnimatables, 
  strategy: SprayStrategy,
  windSpeed: number, // 0-10
  time: number
) => {
  const isSpraying = strategy !== 'IDLE';

  // 1. 扬尘动画
  if (animatables.dustParticles) {
      const pos = animatables.dustParticles.geometry.attributes.position.array as Float32Array;
      // 抑尘效果：如果喷淋开启，尘埃数量/高度减少
      const dustSuppressionFactor = isSpraying ? 0.3 : 1.0;
      
      for(let i=0; i<pos.length; i+=3) {
          // 受风影响
          pos[i*3] += 0.01 * windSpeed + (Math.random()-0.5)*0.02; // X轴风
          pos[i*3+1] += 0.01 * dustSuppressionFactor; // 上升
          
          // 边界重置
          if (pos[i*3+1] > 6 * dustSuppressionFactor || pos[i*3] > 30) {
              pos[i*3] = (Math.random()-0.5) * 30; // Reset X
              pos[i*3+1] = 0;
              pos[i*3+2] = (Math.random()-0.5) * 20;
          }
      }
      animatables.dustParticles.geometry.attributes.position.needsUpdate = true;
      // 调整整体透明度
      (animatables.dustParticles.material as THREE.PointsMaterial).opacity = isSpraying ? 0.2 : 0.6;
  }

  // 2. 喷淋枪旋转逻辑
  if (animatables.sprinklers) {
      animatables.sprinklers.forEach((head, idx) => {
          if (strategy === 'SMART_TRACK') {
              // 追踪假想尘源 (缓慢摆动)
              head.rotation.y = Math.sin(time * 0.5 + idx) * 0.5;
              head.rotation.x = Math.sin(time * 0.3) * 0.2; 
          } else if (strategy === 'GALE_MODE') {
              // 对抗风向 (固定角度)
              head.rotation.y = -0.5; // 迎风
              head.rotation.x = -0.2; // 压低
          } else if (strategy === 'HUMIDIFY') {
              // 360度旋转
              head.rotation.y += 0.02;
              head.rotation.x = -0.4; // 抛高
          } else {
              // Reset
              head.rotation.set(0,0,0);
          }
      });
  }

  // 3. 水雾粒子发射逻辑
  if (animatables.mistParticles && animatables.sprinklers) {
      const pos = animatables.mistParticles.geometry.attributes.position.array as Float32Array;
      const life = animatables.mistParticles.geometry.attributes.life.array as Float32Array;
      const sprinklerCount = animatables.sprinklers.length;
      
      // 每帧发射一些粒子
      if (isSpraying) {
          let particlesPerFrame = 20;
          for(let i=0; i<life.length; i++) {
              if (life[i] <= 0 && particlesPerFrame > 0) {
                  // Respawn at a random active sprinkler
                  const spIdx = Math.floor(Math.random() * sprinklerCount);
                  const sp = animatables.sprinklers[spIdx];
                  // 获取喷头世界坐标 (Approx, assuming simplified transform)
                  const origin = sp.parent!.position.clone();
                  origin.y += 6; // Tower height
                  
                  // 方向
                  const dir = new THREE.Vector3(0, 0, 1);
                  dir.applyEuler(sp.rotation); // Apply nozzle rotation
                  
                  pos[i*3] = origin.x;
                  pos[i*3+1] = origin.y;
                  pos[i*3+2] = origin.z;
                  
                  // Store velocity in pos temporarily? No, simple physics here
                  // We need velocity state. For simplicity, we'll calculate next pos based on direction
                  // Let's use a simple deterministic path based on life
                  
                  life[i] = 1.0; // Reset life
                  particlesPerFrame--;
              }
          }
      }

      // Update living particles
      for(let i=0; i<life.length; i++) {
          if (life[i] > 0) {
              life[i] -= 0.015; // Decay
              
              // 简单模拟喷射抛物线
              // 这里的物理其实需要velocity buffer，简化处理：
              // 假设所有粒子都从中心喷向四周，或者简化为只显示一团雾
              // 为了效果好，我们需要知道每个粒子的初速度向量。
              // 由于没有Buffer存速度，我们用随机扩散模拟水雾弥漫
              
              pos[i*3] += (Math.random()-0.3) * 0.5 + (windSpeed * 0.05); // 被风吹
              pos[i*3+1] -= 0.05; // 重力
              pos[i*3+2] += (Math.random()-0.5) * 0.5;

              // 地面碰撞
              if (pos[i*3+1] < 0) life[i] = 0;
          } else {
              pos[i*3+1] = -100; // Hide
          }
      }
      animatables.mistParticles.geometry.attributes.position.needsUpdate = true;
      animatables.mistParticles.geometry.attributes.life.needsUpdate = true;
  }
};
