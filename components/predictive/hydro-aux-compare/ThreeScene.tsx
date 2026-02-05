import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AuxComparisonSceneProps } from './three-types';

export const AuxComparisonScene: React.FC<AuxComparisonSceneProps> = ({ 
  units,
  selectedUnitId,
  onSelectUnit
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const unitGroupsRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    unitGroupsRef.current = [];

    const createUnit = (index: number, xPos: number) => {
        const group = new THREE.Group();
        group.position.set(xPos, 0, 0);
        group.userData = { index };
        
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5 });
        const motorMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.6, roughness: 0.4 });
        const pumpMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 2.5), baseMat);
        group.add(base);

        const pump = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.0, 1.5, 32), pumpMat);
        pump.position.y = 0.85;
        group.add(pump);

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1, 16), new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
        shaft.position.y = 2.1;
        shaft.name = 'shaft';
        group.add(shaft);

        const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2, 32), motorMat.clone());
        motor.position.y = 3.6;
        motor.name = 'motor';
        group.add(motor);

        const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.6, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
        ring.rotation.x = -Math.PI/2;
        ring.name = 'ring';
        group.add(ring);

        mainGroup.add(group);
        unitGroupsRef.current.push(group);
    };

    [ -6, 0, 6 ].forEach((x, i) => createUnit(i, x));
    scene.add(new THREE.GridHelper(30, 15, 0x1e293b, 0x0f172a));

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      controls.update();

      unitGroupsRef.current.forEach((group, i) => {
          const unit = units[i];
          if (!unit) return;

          const shaft = group.getObjectByName('shaft');
          const motor = group.getObjectByName('motor') as THREE.Mesh;
          const ring = group.getObjectByName('ring') as THREE.Mesh;

          if (shaft && unit.status === 'running') {
              shaft.rotation.y -= unit.rpm * 0.002;
          }

          if (unit.vibration > 0.5 && unit.status === 'running') {
              group.position.x = (i === 0 ? -6 : i === 1 ? 0 : 6) + (Math.random() - 0.5) * unit.vibration * 0.1;
          }

          if (motor) {
              const mat = motor.material as THREE.MeshStandardMaterial;
              const tNorm = Math.min(1, Math.max(0, (unit.temperature - 20) / 60));
              mat.color.lerpColors(new THREE.Color(0x0f766e), new THREE.Color(0xff0000), tNorm);
          }

          if (ring) {
              const mat = ring.material as THREE.MeshBasicMaterial;
              if (unit.id === selectedUnitId) {
                  mat.opacity = 0.6 + Math.sin(Date.now() * 0.005) * 0.2;
                  mat.color.setHex(0x0ea5e9);
              } else {
                  mat.opacity = 0.1;
                  mat.color.setHex(0x334155);
              }
          }
      });

      renderer.render(scene, camera);
    };
    const animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [units, selectedUnitId]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};