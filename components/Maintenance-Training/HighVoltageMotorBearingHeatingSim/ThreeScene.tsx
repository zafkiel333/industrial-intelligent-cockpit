import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MotorHeatingState } from './three-types';

interface ThreeSceneProps {
  state: MotorHeatingState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<MotorHeatingState>(state);
  const bearingRef = useRef<THREE.Mesh | null>(null);
  const heatGlowRef = useRef<THREE.PointLight | null>(null);
  const probeRef = useRef<THREE.Mesh | null>(null);

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
    camera.position.set(2, 2, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Heater Base
    const heaterGeo = new THREE.BoxGeometry(1.5, 0.5, 1.5);
    const heaterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const heater = new THREE.Mesh(heaterGeo, heaterMat);
    heater.position.y = -0.25;
    scene.add(heater);

    // Heating Coil (Yoke)
    const yokeGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 32);
    const yokeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const yoke = new THREE.Mesh(yokeGeo, yokeMat);
    yoke.rotation.x = Math.PI / 2;
    yoke.position.y = 0.5;
    scene.add(yoke);

    // Bearing
    // Inner diameter 100mm -> 0.5 units, Outer 200mm -> 1.0 units
    const bearingGeo = new THREE.TorusGeometry(0.75, 0.25, 16, 64);
    const bearingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const bearing = new THREE.Mesh(bearingGeo, bearingMat);
    bearing.rotation.x = Math.PI / 2;
    bearing.position.y = 0.5;
    scene.add(bearing);
    bearingRef.current = bearing;

    // Heat Glow (Point Light inside bearing)
    const heatGlow = new THREE.PointLight(0xff4500, 0, 2);
    heatGlow.position.y = 0.5;
    scene.add(heatGlow);
    heatGlowRef.current = heatGlow;

    // Magnetic Probe
    const probeGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red probe
    const probe = new THREE.Mesh(probeGeo, probeMat);
    // Positioned on the inner ring of the bearing
    probe.position.set(0.5, 0.6, 0);
    scene.add(probe);
    probeRef.current = probe;

    // Probe Wire
    const wireGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.5, 0.75, 0),
        new THREE.Vector3(0.8, 1.0, 0),
        new THREE.Vector3(1.0, 0, 0)
    ]);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wire = new THREE.Line(wireGeo, wireMat);
    scene.add(wire);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Bearing Color based on temperature
      // Room temp (20) -> Grey, Hot (110) -> Reddish glow
      const tempRatio = Math.max(0, Math.min(1, (currentState.bearingTemperature - 20) / 100));
      
      // Interpolate color from grey to dark red
      const baseColor = new THREE.Color(0xe2e8f0);
      const hotColor = new THREE.Color(0xff6b6b);
      (bearing.material as THREE.MeshStandardMaterial).color.lerpColors(baseColor, hotColor, tempRatio * 0.5);

      // Update Glow
      if (heatGlowRef.current) {
          heatGlowRef.current.intensity = tempRatio * 2;
      }

      // Update Probe Position
      if (probeRef.current) {
          probeRef.current.visible = currentState.magneticProbeAttached;
          wire.visible = currentState.magneticProbeAttached;
      }

      // Simulate Expansion (Visual only, exaggerated)
      // Expansion is tiny (e.g., 0.1mm), so we exaggerate it for visual effect
      const visualExpansion = 1 + (currentState.expansionAmount * 10); 
      bearing.scale.set(visualExpansion, visualExpansion, visualExpansion);

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
