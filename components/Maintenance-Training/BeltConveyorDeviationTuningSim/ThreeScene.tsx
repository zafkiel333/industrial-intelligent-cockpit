import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ConveyorState } from './three-types';

interface ThreeSceneProps {
  state: ConveyorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ConveyorState>(state);

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
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Rollers
    const rollerGroup = new THREE.Group();
    const rollerGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
    
    const rollers: THREE.Mesh[] = [];
    for (let i = -3; i <= 3; i++) {
      const roller = new THREE.Mesh(rollerGeo, rollerMat);
      roller.rotation.z = Math.PI / 2;
      roller.position.set(0, 0, i * 2);
      rollerGroup.add(roller);
      rollers.push(roller);
    }
    scene.add(rollerGroup);

    // Auto-tuning Idlers (Side rollers)
    const idlerGeo = new THREE.CylinderGeometry(0.4, 0.4, 2, 16);
    const idlerMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.8 });
    const leftIdler = new THREE.Mesh(idlerGeo, idlerMat);
    leftIdler.position.set(-2.5, 0.5, 0);
    leftIdler.rotation.z = Math.PI / 4;
    scene.add(leftIdler);

    const rightIdler = new THREE.Mesh(idlerGeo, idlerMat);
    rightIdler.position.set(2.5, 0.5, 0);
    rightIdler.rotation.z = -Math.PI / 4;
    scene.add(rightIdler);

    // Belt
    const beltGeo = new THREE.BoxGeometry(4, 0.2, 14);
    
    // Create striped texture for belt to show movement
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#334155';
    for(let i=0; i<256; i+=32) {
      ctx.fillRect(0, i, 256, 16);
    }
    const beltTex = new THREE.CanvasTexture(canvas);
    beltTex.wrapS = THREE.RepeatWrapping;
    beltTex.wrapT = THREE.RepeatWrapping;
    beltTex.repeat.set(1, 4);

    const beltMat = new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.8 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 0.6;
    scene.add(belt);

    // Warning Laser (Sci-Fi effect)
    const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 6, 8);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 });
    const leftLaser = new THREE.Mesh(laserGeo, laserMat);
    leftLaser.position.set(-2.2, 1, 0);
    leftLaser.rotation.x = Math.PI / 2;
    scene.add(leftLaser);

    const rightLaser = new THREE.Mesh(laserGeo, laserMat);
    rightLaser.position.set(2.2, 1, 0);
    rightLaser.rotation.x = Math.PI / 2;
    scene.add(rightLaser);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Belt movement
      const speed = (currentState.speed / 100) * 0.05;
      beltTex.offset.y -= speed;
      
      rollers.forEach(r => {
        r.rotation.x -= speed * 2;
      });

      // Deviation
      const deviationOffset = (currentState.deviation / 100) * 1.5; // Max 1.5 units left/right
      belt.position.x = THREE.MathUtils.lerp(belt.position.x, deviationOffset, 0.1);

      // Auto-tuning idlers animation
      if (currentState.isAutoTuning && Math.abs(currentState.deviation) > 10) {
        // Tilt idlers to push belt back
        const tilt = currentState.deviation > 0 ? 0.2 : -0.2;
        leftIdler.rotation.y = THREE.MathUtils.lerp(leftIdler.rotation.y, tilt, 0.1);
        rightIdler.rotation.y = THREE.MathUtils.lerp(rightIdler.rotation.y, tilt, 0.1);
      } else {
        leftIdler.rotation.y = THREE.MathUtils.lerp(leftIdler.rotation.y, 0, 0.1);
        rightIdler.rotation.y = THREE.MathUtils.lerp(rightIdler.rotation.y, 0, 0.1);
      }

      // Laser warning
      if (currentState.deviation < -50) {
        leftLaser.material.opacity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        leftLaser.material.color.setHex(0xef4444);
      } else {
        leftLaser.material.opacity = 0.2;
        leftLaser.material.color.setHex(0x22c55e);
      }

      if (currentState.deviation > 50) {
        rightLaser.material.opacity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        rightLaser.material.color.setHex(0xef4444);
      } else {
        rightLaser.material.opacity = 0.2;
        rightLaser.material.color.setHex(0x22c55e);
      }

      // Camera slight sway
      camera.position.x = Math.sin(Date.now() * 0.0005) * 2;
      camera.lookAt(0, 0, 0);

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
