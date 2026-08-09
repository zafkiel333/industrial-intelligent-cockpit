import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TunnelStatus } from './three-types';

interface ThreeSceneProps {
  status: TunnelStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<TunnelStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Tunnel Model
    const tunnelGeom = new THREE.CylinderGeometry(5, 5, 20, 32, 1, true);
    const tunnelMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      side: THREE.BackSide,
      metalness: 0.1,
      roughness: 0.9
    });
    const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    scene.add(tunnel);

    // Cables
    const cableGroup = new THREE.Group();
    scene.add(cableGroup);

    const cableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    for (let i = 0; i < 4; i++) {
      const cableGeom = new THREE.CylinderGeometry(0.1, 0.1, 20, 8);
      const cable = new THREE.Mesh(cableGeom, cableMat);
      cable.rotation.z = Math.PI / 2;
      const angle = (i / 4) * Math.PI - Math.PI / 2;
      cable.position.set(0, Math.sin(angle) * 4.5, Math.cos(angle) * 4.5);
      cableGroup.add(cable);
    }

    // Water
    const waterGeom = new THREE.PlaneGeometry(20, 10);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);

    // Intrusion Indicator
    const intrusionGeom = new THREE.SphereGeometry(0.5, 16, 16);
    const intrusionMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1 });
    const intrusion = new THREE.Mesh(intrusionGeom, intrusionMat);
    intrusion.visible = false;
    scene.add(intrusion);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Water Level
      const targetY = -5 + (s.waterLevel / 100) * 10;
      water.position.y += (targetY - water.position.y) * 0.05;
      water.scale.x = 1 + Math.sin(time) * 0.01;

      // Intrusion
      if (s.intrusionDetected) {
        intrusion.visible = true;
        intrusion.position.set(Math.sin(time * 2) * 5, -2, Math.cos(time * 2) * 2);
        intrusion.material.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.5;
      } else {
        intrusion.visible = false;
      }

      // Structural Integrity Glow
      if (s.structuralIntegrity < 80) {
        tunnel.material.emissive.setHex(0xff0000);
        tunnel.material.emissiveIntensity = (100 - s.structuralIntegrity) / 200;
      } else {
        tunnel.material.emissiveIntensity = 0;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
