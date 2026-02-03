
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BeltAnimatables } from './three-types';

interface ThreeSceneProps {
  beltSpeed?: number;
  anomalyZone?: number; // 0 to 1 along the line
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  beltSpeed = 1.0,
  anomalyZone = 0.7
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- 高动态工业照明 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const blueRim = new THREE.PointLight(0x0ea5e9, 15, 50);
    blueRim.position.set(-15, 5, -10);
    scene.add(blueRim);

    const warningLight = new THREE.PointLight(0xf97316, 10, 20);
    warningLight.position.set(10 * (anomalyZone - 0.5), 2, 0);
    scene.add(warningLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: BeltAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 输送机框架 (Truss System) ---
    const trussGeo = new THREE.BoxGeometry(30, 0.2, 4);
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const truss = new THREE.Mesh(trussGeo, trussMat);
    truss.position.y = -1;
    group.add(truss);
    disposables.push(trussGeo, trussMat);

    // --- 2. 动态皮带 (The Belt) ---
    // 使用圆角路径模拟连续皮带
    const beltShape = new THREE.Shape();
    beltShape.moveTo(-15, 0.3);
    beltShape.lineTo(15, 0.3);
    beltShape.absarc(15, 0, 0.3, Math.PI/2, -Math.PI/2, true);
    beltShape.lineTo(-15, -0.3);
    beltShape.absarc(-15, 0, 0.3, -Math.PI/2, Math.PI/2, true);
    
    const beltExtrudeSettings = { steps: 2, depth: 3.5, bevelEnabled: false };
    const beltGeo = new THREE.ExtrudeGeometry(beltShape, beltExtrudeSettings);
    beltGeo.rotateY(Math.PI / 2);
    beltGeo.translate(1.75, 0, 0);

    // 皮带材质 - 纹理偏移模拟移动
    const beltTexture = new THREE.DataTexture(new Uint8Array([20, 20, 20, 255, 40, 40, 40, 255]), 2, 1, THREE.RGBAFormat);
    beltTexture.wrapS = THREE.RepeatWrapping;
    beltTexture.repeat.set(20, 1);
    
    const beltMat = new THREE.MeshStandardMaterial({ 
        map: beltTexture,
        color: 0x111827, 
        roughness: 0.7,
        metalness: 0.1
    });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    group.add(belt);
    animatables.beltMesh = belt;
    disposables.push(beltGeo, beltMat);

    // --- 3. 滚筒组 (Pulleys) ---
    const pulleyGeo = new THREE.CylinderGeometry(0.5, 0.5, 3.8, 32);
    pulleyGeo.rotateX(Math.PI / 2);
    const pulleyMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
    
    const headPulley = new THREE.Mesh(pulleyGeo, pulleyMat);
    headPulley.position.x = 15;
    group.add(headPulley);
    animatables.drivePulley = headPulley;

    const tailPulley = headPulley.clone();
    tailPulley.position.x = -15;
    group.add(tailPulley);
    animatables.tailPulley = tailPulley;
    disposables.push(pulleyGeo, pulleyMat);

    // --- 4. 托辊阵列 (Idlers) ---
    const idlerGroup = new THREE.Group();
    const idlerGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 16);
    idlerGeo.rotateX(Math.PI / 2);
    const idlerMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    for(let i = -14; i < 15; i += 1.5) {
        // 三托辊槽形布置
        const left = new THREE.Mesh(idlerGeo, idlerMat);
        left.position.set(i, 0.1, -1);
        left.rotation.z = 0.3;
        const center = new THREE.Mesh(idlerGeo, idlerMat);
        center.position.set(i, 0, 0);
        const right = new THREE.Mesh(idlerGeo, idlerMat);
        right.position.set(i, 0.1, 1);
        right.rotation.z = -0.3;
        idlerGroup.add(left, center, right);
    }
    group.add(idlerGroup);
    animatables.idlers = idlerGroup;
    disposables.push(idlerGeo, idlerMat);

    // --- 5. 物料流 (Material) ---
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 30;
        pPos[i*3+1] = 0.45;
        pPos[i*3+2] = (Math.random() - 0.5) * 1.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x78350f, size: 0.15 });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    animatables.materialParticles = particles;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 皮带与滚筒运动
      const speedFactor = beltSpeed * 0.1;
      if (animatables.beltMesh) {
          (animatables.beltMesh.material as THREE.MeshStandardMaterial).map!.offset.x -= speedFactor * 0.5;
      }
      if (animatables.drivePulley) animatables.drivePulley.rotation.z -= speedFactor;
      if (animatables.tailPulley) animatables.tailPulley.rotation.z -= speedFactor;

      // 物料运动
      if (animatables.materialParticles) {
          const positions = animatables.materialParticles.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              positions[i*3] += speedFactor * 10;
              if (positions[i*3] > 15) positions[i*3] = -15;
          }
          animatables.materialParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 异常区域脉动效果
      warningLight.position.x = 30 * (anomalyZone - 0.5);
      warningLight.intensity = 10 + Math.sin(time * 8) * 5;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [beltSpeed, anomalyZone]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
