
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PropulsionThreeProps } from './three-types';

export const PropulsionThreeScene: React.FC<PropulsionThreeProps> = ({ 
  parts, 
  activePartId, 
  rpm, 
  pitchAngle,
  showWake,
  onPartSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 工业环境背景 ---
    const gridHelper = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // --- 推进器模型组 ---
    const propulsionGroup = new THREE.Group();
    scene.add(propulsionGroup);

    const interactives: THREE.Mesh[] = [];

    // 1. 吊舱主体 (Pod Body)
    const podGeo = new THREE.CapsuleGeometry(2, 6, 4, 32);
    podGeo.rotateZ(Math.PI / 2);
    const podMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x334155, 
      metalness: 0.9, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.8
    });
    const pod = new THREE.Mesh(podGeo, podMat);
    pod.userData = { id: 'PROP-POD-01' };
    propulsionGroup.add(pod);
    interactives.push(pod);

    // 2. 螺旋桨桨毂 (Propeller Hub)
    const hubGroup = new THREE.Group();
    hubGroup.position.x = 4; // 位于吊舱后端
    propulsionGroup.add(hubGroup);

    const hubGeo = new THREE.CylinderGeometry(0.8, 1.2, 2, 32);
    hubGeo.rotateZ(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.userData = { id: 'PROP-HUB-01' };
    hubGroup.add(hub);
    interactives.push(hub);

    // 3. 桨叶 (Blades)
    const bladeCount = 4;
    const bladeMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < bladeCount; i++) {
        const angle = (i / bladeCount) * Math.PI * 2;
        const bladeGeo = new THREE.BoxGeometry(3, 0.2, 1.5);
        const bladeMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x94a3b8, 
            metalness: 0.7, 
            roughness: 0.3,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0
        });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        
        // 围绕桨毂排列
        const container = new THREE.Group();
        container.rotation.x = angle;
        container.add(blade);
        blade.position.set(0, 1.8, 0); // 径向偏移
        
        hubGroup.add(container);
        bladeMeshes.push(blade);
        blade.userData = { id: `PROP-BLADE-0${i+1}` };
        interactives.push(blade);
    }

    // 4. 尾流粒子 (Wake Flow Particles)
    const particleCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVel = new Float32Array(particleCount);
    for(let i=0; i<particleCount; i++) {
        pPos[i*3] = 4 + Math.random() * 20; // X 向后延伸
        pPos[i*3+1] = (Math.random() - 0.5) * 6;
        pPos[i*3+2] = (Math.random() - 0.5) * 6;
        pVel[i] = 0.1 + Math.random() * 0.2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0x0ea5e9, 
        size: 0.1, 
        transparent: true, 
        opacity: 0, 
        blending: THREE.AdditiveBlending 
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- 灯光系统 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const spot = new THREE.SpotLight(0x0ea5e9, 10, 50, Math.PI/4);
    spot.position.set(10, 20, 10);
    scene.add(spot);

    // 交互射束
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
            onPartSelect(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      // 旋转逻辑
      const rotationSpeed = (rpm / 60) * 0.1;
      hubGroup.rotation.x += rotationSpeed;

      // 螺距角调整
      bladeMeshes.forEach(b => {
          b.rotation.y = (pitchAngle / 180) * Math.PI;
          
          // 高亮逻辑
          const mat = b.material as THREE.MeshPhysicalMaterial;
          const isActive = b.userData.id === activePartId;
          mat.emissiveIntensity = isActive ? 0.5 + Math.sin(time * 5) * 0.3 : 0;
      });

      // 尾流动画
      if (showWake && rpm > 0) {
          pMat.opacity = Math.min(0.6, rpm / 500);
          const positions = pGeo.attributes.position.array as Float32Array;
          for(let i=0; i<particleCount; i++) {
              positions[i*3] += pVel[i] * (rpm/100); // 速度受RPM影响
              if (positions[i*3] > 25) {
                  positions[i*3] = 4;
                  positions[i*3+1] = (Math.random() - 0.5) * 6;
                  positions[i*3+2] = (Math.random() - 0.5) * 6;
              }
          }
          pGeo.attributes.position.needsUpdate = true;
      } else {
          pMat.opacity = 0;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
          mountRef.current.removeEventListener('click', onClick);
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [activePartId, rpm, pitchAngle, showWake]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
