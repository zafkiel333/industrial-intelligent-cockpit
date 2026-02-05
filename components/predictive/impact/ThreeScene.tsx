
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ImpactAnimatables } from './three-types';

interface ThreeSceneProps {
  crackSeverity?: number; // 0 to 1
  rotationActive?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  crackSeverity = 0.3,
  rotationActive = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(7, 5, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0x8b5cf6, 2);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: ImpactAnimatables = {};
    const disposables: any[] = [];

    // --- Build Impact Rotor ---
    
    const rotorGroup = new THREE.Group();
    group.add(rotorGroup);
    animatables.rotorBody = rotorGroup;

    // 1. Rotor Core Cylinder
    const coreGeo = new THREE.CylinderGeometry(2, 2, 6, 64);
    coreGeo.rotateZ(Math.PI / 2);
    const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.8, 
        roughness: 0.2,
        emissive: 0x1e1b4b,
        emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    rotorGroup.add(core);
    disposables.push(coreGeo, coreMat);

    // 2. Blow Bar Slots (Visual detail)
    const slotGeo = new THREE.BoxGeometry(6.2, 0.4, 0.8);
    const slotMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    for(let i=0; i<4; i++) {
        const slot = new THREE.Mesh(slotGeo, slotMat);
        const angle = (i / 4) * Math.PI * 2;
        slot.position.set(0, Math.cos(angle) * 1.8, Math.sin(angle) * 1.8);
        slot.rotation.x = -angle;
        rotorGroup.add(slot);
    }
    disposables.push(slotGeo, slotMat);

    // 3. Stress Field Heatmap (Transparent shell)
    const stressGeo = new THREE.CylinderGeometry(2.1, 2.1, 6, 32);
    stressGeo.rotateZ(Math.PI / 2);
    const stressMat = new THREE.MeshStandardMaterial({ 
        color: 0xef4444, 
        transparent: true, 
        opacity: crackSeverity * 0.4,
        side: THREE.DoubleSide,
        wireframe: true
    });
    const stressField = new THREE.Mesh(stressGeo, stressMat);
    rotorGroup.add(stressField);
    animatables.stressField = stressField;
    disposables.push(stressGeo, stressMat);

    // 4. Crack Hotspots (Glowing points)
    const createCracks = () => {
        const count = 20;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            // Place cracks randomly on the surface near the center
            const angle = Math.random() * Math.PI * 2;
            pos[i*3] = (Math.random() - 0.5) * 2; // X center
            pos[i*3+1] = Math.cos(angle) * 2.01;
            pos[i*3+2] = Math.sin(angle) * 2.01;
            
            colors[i*3] = 1; colors[i*3+1] = 0.8; colors[i*3+2] = 0;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.PointsMaterial({ 
            size: 0.15, 
            vertexColors: true, 
            transparent: true,
            opacity: 0.8 
        });
        return new THREE.Points(geo, mat);
    };
    const cracks = createCracks();
    rotorGroup.add(cracks);
    animatables.crackPoints = cracks;
    disposables.push(cracks.geometry, cracks.material);

    // 5. Sensor Array (Decorative)
    const sensorGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
    for(let i=0; i<8; i++) {
        const sensor = new THREE.Mesh(sensorGeo, sensorMat);
        sensor.position.set((i-4)*0.8, 2.2, 0);
        group.add(sensor);
    }
    disposables.push(sensorGeo, sensorMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (rotationActive && animatables.rotorBody) {
          animatables.rotorBody.rotation.x += 0.02;
      }

      // Pulse crack points
      if (animatables.crackPoints) {
          animatables.crackPoints.material.opacity = 0.5 + Math.sin(time * 5) * 0.5;
      }

      // Rotate the whole group slowly for showcase
      group.rotation.y += 0.002;

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
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, [crackSeverity, rotationActive]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
