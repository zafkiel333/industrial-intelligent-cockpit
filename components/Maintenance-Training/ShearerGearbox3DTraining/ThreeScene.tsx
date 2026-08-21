import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GearboxState } from './three-types';

interface ThreeSceneProps {
  state: GearboxState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GearboxState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(10, 10, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Create a simple gear geometry function
    const createGear = (radius: number, thickness: number, teeth: number, color: number) => {
      const shape = new THREE.Shape();
      const innerRadius = radius * 0.8;
      
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? radius : innerRadius;
        if (i === 0) shape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      shape.closePath();

      const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();
      
      const material = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.3 });
      return new THREE.Mesh(geometry, material);
    };

    // Parts
    const parts = {
      casing: new THREE.Mesh(
        new THREE.BoxGeometry(8, 6, 2),
        new THREE.MeshStandardMaterial({ color: 0x3f3f46, transparent: true, opacity: 0.3, wireframe: true })
      ),
      inputShaft: new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 4),
        new THREE.MeshStandardMaterial({ color: 0xa1a1aa, metalness: 0.9 })
      ),
      gear1: createGear(2, 0.5, 16, 0x3b82f6),
      gear2: createGear(3, 0.5, 24, 0x10b981),
      outputShaft: new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 4),
        new THREE.MeshStandardMaterial({ color: 0xa1a1aa, metalness: 0.9 })
      )
    };

    // Initial positions
    parts.inputShaft.rotation.x = Math.PI / 2;
    parts.inputShaft.position.set(-2, 1, 0);
    
    parts.gear1.position.set(-2, 1, 0);
    
    parts.gear2.position.set(1, -1, 0);
    
    parts.outputShaft.rotation.x = Math.PI / 2;
    parts.outputShaft.position.set(1, -1, 0);

    scene.add(parts.casing);
    scene.add(parts.inputShaft);
    scene.add(parts.gear1);
    scene.add(parts.gear2);
    scene.add(parts.outputShaft);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Explode logic (move parts along Z axis)
      const explodeFactor = currentState.explodeLevel / 100;
      
      parts.casing.position.z = THREE.MathUtils.lerp(parts.casing.position.z, explodeFactor * -5, 0.1);
      parts.inputShaft.position.z = THREE.MathUtils.lerp(parts.inputShaft.position.z, explodeFactor * 5, 0.1);
      parts.gear1.position.z = THREE.MathUtils.lerp(parts.gear1.position.z, explodeFactor * 2, 0.1);
      parts.gear2.position.z = THREE.MathUtils.lerp(parts.gear2.position.z, explodeFactor * -2, 0.1);
      parts.outputShaft.position.z = THREE.MathUtils.lerp(parts.outputShaft.position.z, explodeFactor * -5, 0.1);

      // Rotation animation
      if (explodeFactor < 0.1) {
        parts.inputShaft.rotation.y += 0.02;
        parts.gear1.rotation.z += 0.02;
        parts.gear2.rotation.z -= 0.02 * (16/24); // Gear ratio
        parts.outputShaft.rotation.y -= 0.02 * (16/24);
      }

      // Highlight active part
      Object.keys(parts).forEach(key => {
        const mesh = parts[key as keyof typeof parts];
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (currentState.activePart === 'all' || currentState.activePart === key) {
          mat.emissive.setHex(0x000000);
          if (key === 'casing') mat.opacity = 0.3;
          else mat.opacity = 1;
        } else {
          mat.emissive.setHex(0x000000);
          mat.opacity = 0.1;
          mat.transparent = true;
        }
      });

      if (currentState.activePart !== 'all' && parts[currentState.activePart as keyof typeof parts]) {
        const activeMesh = parts[currentState.activePart as keyof typeof parts];
        (activeMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x1d4ed8);
        (activeMesh.material as THREE.MeshStandardMaterial).opacity = 1;
      }

      scene.rotation.y += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
