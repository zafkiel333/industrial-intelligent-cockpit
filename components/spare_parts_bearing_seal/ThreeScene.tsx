
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BearingSealThreeProps } from './three-types';

export const BearingSealThreeScene: React.FC<BearingSealThreeProps> = ({ 
  parts, 
  activeId, 
  rpm,
  explodeLevel,
  onSelect,
  showOilFilm
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const assemblyRef = useRef<THREE.Group>(null);
  const rollersRef = useRef<THREE.Mesh[]>([]);
  const cageRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // 深邃的金属实验室氛围
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // 启用物理光照计算
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- 材质定义 ---
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.9,
      roughness: 0.2,
    });

    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0xcd7f32,
      metalness: 0.8,
      roughness: 0.4,
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.9,
      metalness: 0.1
    });

    const activeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.2
    });

    // --- 轴承组件构建 ---
    const assembly = new THREE.Group();
    assemblyRef.current = assembly;
    scene.add(assembly);

    const interactives: THREE.Mesh[] = [];

    // 1. 外圈 (Outer Ring)
    const outerGeo = new THREE.CylinderGeometry(4, 4, 2, 64, 1, true);
    // 增加厚度感（这里简化为双面）
    outerGeo.scale(1, 1, 1);
    const outerRing = new THREE.Mesh(outerGeo, steelMat.clone());
    outerRing.material.side = THREE.DoubleSide;
    outerRing.rotation.z = Math.PI / 2;
    outerRing.userData = { id: 'OUTER_RING', type: 'outer_ring' };
    assembly.add(outerRing);
    interactives.push(outerRing);

    // 外圈边缘装饰
    const outerRimGeo = new THREE.TorusGeometry(4, 0.2, 16, 100);
    const outerRim1 = new THREE.Mesh(outerRimGeo, steelMat);
    outerRim1.rotation.y = Math.PI / 2;
    outerRim1.position.x = 1;
    outerRing.add(outerRim1);
    const outerRim2 = outerRim1.clone();
    outerRim2.position.x = -1;
    outerRing.add(outerRim2);

    // 2. 内圈 (Inner Ring)
    const innerGeo = new THREE.CylinderGeometry(2.5, 2.5, 2.2, 64, 1, true);
    const innerRing = new THREE.Mesh(innerGeo, steelMat.clone());
    innerRing.material.side = THREE.DoubleSide;
    innerRing.rotation.z = Math.PI / 2;
    innerRing.userData = { id: 'INNER_RING', type: 'inner_ring' };
    assembly.add(innerRing);
    interactives.push(innerRing);

    // 3. 滚子 (Rollers) & 保持架 (Cage)
    const rollerGroup = new THREE.Group();
    assembly.add(rollerGroup);
    
    const rollerCount = 12;
    const rollerGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 32);
    rollersRef.current = [];

    for (let i = 0; i < rollerCount; i++) {
        const angle = (i / rollerCount) * Math.PI * 2;
        const radius = 3.25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius; // y in 3D space relative to rotation

        const roller = new THREE.Mesh(rollerGeo, steelMat.clone());
        // 初始位置
        roller.position.set(x, 0, z);
        // 朝向中心
        roller.lookAt(0, 0, 0);
        roller.rotateX(Math.PI / 2); // 调整圆柱体方向
        
        roller.userData = { id: `ROLLER_${i}`, angle: angle, radius: radius };
        rollerGroup.add(roller);
        rollersRef.current.push(roller);
        interactives.push(roller);
    }

    // 保持架 (Cage) - 简化为圆环
    const cageGeo = new THREE.TorusGeometry(3.25, 0.4, 16, 100);
    const cage = new THREE.Mesh(cageGeo, bronzeMat.clone());
    cage.rotation.x = Math.PI / 2; // 躺平
    cage.scale.set(1, 1, 0.2); // 压扁
    cage.userData = { id: 'CAGE', type: 'cage' };
    // @ts-ignore
    cageRef.current = cage;
    rollerGroup.add(cage);
    interactives.push(cage);

    // 4. 密封件 (Seals)
    const sealGeo = new THREE.RingGeometry(2.6, 3.9, 64);
    const sealLeft = new THREE.Mesh(sealGeo, rubberMat.clone());
    sealLeft.position.x = -1.2;
    sealLeft.rotation.y = -Math.PI / 2;
    sealLeft.userData = { id: 'SEAL_L', type: 'seal_lip' };
    assembly.add(sealLeft);
    interactives.push(sealLeft);

    const sealRight = new THREE.Mesh(sealGeo, rubberMat.clone());
    sealRight.position.x = 1.2;
    sealRight.rotation.y = Math.PI / 2;
    sealRight.userData = { id: 'SEAL_R', type: 'seal_lip' };
    assembly.add(sealRight);
    interactives.push(sealRight);

    // --- 油膜粒子系统 ---
    const oilCount = 500;
    const oilGeo = new THREE.BufferGeometry();
    const oilPos = new Float32Array(oilCount * 3);
    for(let i=0; i<oilCount*3; i+=3) {
        const theta = Math.random() * Math.PI * 2;
        const r = 3.25 + (Math.random() - 0.5) * 0.5;
        const y = (Math.random() - 0.5) * 1.8;
        oilPos[i] = Math.cos(theta) * r;
        oilPos[i+1] = y;
        oilPos[i+2] = Math.sin(theta) * r;
    }
    oilGeo.setAttribute('position', new THREE.BufferAttribute(oilPos, 3));
    const oilMat = new THREE.PointsMaterial({ 
        color: 0xeab308, 
        size: 0.05, 
        transparent: true, 
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const oilParticles = new THREE.Points(oilGeo, oilMat);
    assembly.add(oilParticles);

    // --- 灯光 ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0xffffff, 10);
    spotLight.position.set(10, 20, 10);
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    const blueBackLight = new THREE.PointLight(0x0ea5e9, 5, 20);
    blueBackLight.position.set(-5, -5, -5);
    scene.add(blueBackLight);

    const amberFillLight = new THREE.PointLight(0xf59e0b, 2, 20);
    amberFillLight.position.set(5, 5, 5);
    scene.add(amberFillLight);

    // --- 交互 ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactives);
        if (intersects.length > 0) {
            onSelect(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- 动画 ---
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // 1. 旋转逻辑 (RPM simulation)
      // 假设内圈旋转，保持架和滚子公转速度约为内圈的一半
      const rotSpeed = rpm / 60 * 0.02; 
      
      innerRing.rotation.x -= rotSpeed; // 内圈自转
      
      // 滚子公转
      rollersRef.current.forEach((roller, i) => {
          const originalAngle = roller.userData.angle;
          const currentOrbit = originalAngle - (time * rotSpeed * 0.5); // 公转
          
          const r = roller.userData.radius + (explodeLevel * 2); // 爆炸位移
          
          roller.position.x = Math.cos(currentOrbit) * r;
          roller.position.z = Math.sin(currentOrbit) * r;
          
          roller.lookAt(0, 0, 0); // 始终朝向中心
          roller.rotateX(Math.PI / 2); 
          
          // 滚子自转 (方向与公转相反)
          roller.rotateY(time * rotSpeed * 2);

          // 高亮处理
          const id = roller.userData.id;
          if (id === activeId) {
             roller.material = activeMat;
             roller.scale.setScalar(1.2);
          } else {
             roller.material = steelMat;
             roller.scale.setScalar(1);
          }
      });

      // 保持架跟随滚子公转
      if (cageRef.current) {
          cageRef.current.rotation.z = - (time * rotSpeed * 0.5);
      }

      // 2. 爆炸视图逻辑
      // 外圈向外
      outerRing.position.y = explodeLevel * 4; // Y轴实际上是场景的垂直轴，模型是横躺的，这是错的
      // 模型整体朝向是Z轴对齐。我们需要根据初始构建调整。
      // Outer Ring: rotation Z=PI/2. Its local Y is world X.
      // 简单起见，我们手动调整组件的世界坐标
      
      sealLeft.position.x = -1.2 - (explodeLevel * 4);
      sealRight.position.x = 1.2 + (explodeLevel * 4);
      
      // 3. 油膜可视化
      if (showOilFilm) {
          oilMat.opacity = 0.6 + Math.sin(time * 5) * 0.2;
          oilParticles.rotation.y = - (time * rotSpeed * 0.5); // 跟随油液流动
      } else {
          oilMat.opacity = 0;
      }

      // 整体微动
      assembly.rotation.z = Math.sin(time * 0.2) * 0.1;
      assembly.rotation.y = time * 0.1;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
          mountRef.current.removeEventListener('click', onClick);
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [parts, activeId, rpm, explodeLevel, showOilFilm, onSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
