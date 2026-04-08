import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { UVLampState } from './three-types';

interface ThreeSceneProps {
  state: UVLampState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<UVLampState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);
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

    // UV Reactor Chamber
    const chamberGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 32);
    const chamberMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, transparent: true, opacity: 0.4 });
    const chamber = new THREE.Mesh(chamberGeo, chamberMat);
    chamber.rotation.z = Math.PI / 2;
    scene.add(chamber);

    // Quartz Sleeve (Inside chamber)
    const sleeveGeo = new THREE.CylinderGeometry(0.3, 0.3, 6.2, 32);
    const sleeveMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, transmission: 0.9 });
    const sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeve.rotation.z = Math.PI / 2;
    scene.add(sleeve);

    // End Cap
    const capGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(3.2, 0, 0);
    scene.add(cap);

    // UV Lamp
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, 0, 0);

    const lampGeo = new THREE.CylinderGeometry(0.15, 0.15, 5.8, 16);
    const lampMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b5cf6, // Purple/UV color
      emissive: 0x8b5cf6,
      emissiveIntensity: 2
    });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.rotation.z = Math.PI / 2;
    lampGroup.add(lamp);

    // Lamp Connector
    const connGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16);
    const connMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8 });
    const conn = new THREE.Mesh(connGeo, connMat);
    conn.rotation.z = Math.PI / 2;
    conn.position.set(3, 0, 0);
    lampGroup.add(conn);

    scene.add(lampGroup);

    // UV Light Source (Point light)
    const uvLight = new THREE.PointLight(0x8b5cf6, 2, 10);
    scene.add(uvLight);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Step logic
      if (currentState.step === 0) {
        // Normal running
        lampMat.emissiveIntensity = 2 + Math.sin(Date.now() * 0.005) * 0.5; // Flicker slightly
        uvLight.intensity = 2;
        cap.position.x = 3.2;
        lampGroup.position.x = 0;
      } else if (currentState.step === 1) {
        // Power off
        lampMat.emissiveIntensity = 0;
        uvLight.intensity = 0;
        cap.position.x = 3.2;
        lampGroup.position.x = 0;
      } else if (currentState.step === 2) {
        // Remove cap
        lampMat.emissiveIntensity = 0;
        uvLight.intensity = 0;
        cap.position.x = THREE.MathUtils.lerp(cap.position.x, 4.5, 0.1);
        lampGroup.position.x = 0;
      } else if (currentState.step === 3) {
        // Extract lamp
        lampMat.emissiveIntensity = 0;
        uvLight.intensity = 0;
        cap.position.x = 4.5;
        lampGroup.position.x = THREE.MathUtils.lerp(lampGroup.position.x, 6, 0.05); // Pull out to the right
      } else if (currentState.step === 4) {
        // Insert new (Reset position, keep off)
        lampMat.emissiveIntensity = 0;
        uvLight.intensity = 0;
        cap.position.x = THREE.MathUtils.lerp(cap.position.x, 3.2, 0.1);
        lampGroup.position.x = THREE.MathUtils.lerp(lampGroup.position.x, 0, 0.1);
      }

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;
      scene.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;

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
