import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { BatteryStatus } from './three-types';

interface ThreeSceneProps {
  status: BatteryStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef(status);

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
    camera.position.set(3, 3, 5);

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x00f2ff, 2);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x7000ff, 2);
    rimLight.position.set(-5, -5, -5);
    scene.add(rimLight);

    // Battery Model Group
    const batteryGroup = new THREE.Group();
    scene.add(batteryGroup);

    // Battery Body
    const bodyGeo = new THREE.BoxGeometry(2, 1.5, 1.2);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.2,
      roughness: 0.8,
      clearcoat: 0.5
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    batteryGroup.add(body);

    // Terminals
    const terminalGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 32);
    const terminalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    
    const posTerminal = new THREE.Mesh(terminalGeo, terminalMat);
    posTerminal.position.set(0.7, 0.9, 0);
    batteryGroup.add(posTerminal);

    const negTerminal = new THREE.Mesh(terminalGeo, terminalMat);
    negTerminal.position.set(-0.7, 0.9, 0);
    batteryGroup.add(negTerminal);

    // Terminal Caps (Red/Black)
    const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 32);
    const redCap = new THREE.Mesh(capGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    redCap.position.y = 0.15;
    posTerminal.add(redCap);

    const blackCap = new THREE.Mesh(capGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
    blackCap.position.y = 0.15;
    negTerminal.add(blackCap);

    // Corrosion Effect (Crystals)
    const crystalCount = 50;
    const crystalGeo = new THREE.IcosahedronGeometry(0.05, 0);
    const posCrystals: THREE.Mesh[] = [];
    const negCrystals: THREE.Mesh[] = [];

    for (let i = 0; i < crystalCount; i++) {
      const crystalMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0,
        roughness: 0.9
      });
      
      const pCrystal = new THREE.Mesh(crystalGeo, crystalMat);
      pCrystal.position.set(
        (Math.random() - 0.5) * 0.4,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.4
      );
      pCrystal.scale.setScalar(0.5 + Math.random());
      posTerminal.add(pCrystal);
      posCrystals.push(pCrystal);

      const nCrystal = new THREE.Mesh(crystalGeo, crystalMat.clone());
      nCrystal.position.set(
        (Math.random() - 0.5) * 0.4,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.4
      );
      nCrystal.scale.setScalar(0.5 + Math.random());
      negTerminal.add(nCrystal);
      negCrystals.push(nCrystal);
    }

    // Leakage Effect (Liquid Plane)
    const leakGeo = new THREE.CircleGeometry(0.4, 32);
    const leakMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f2ff,
      transparent: true,
      opacity: 0,
      roughness: 0.1,
      metalness: 0.5,
      transmission: 0.5,
      thickness: 0.1
    });
    const leakPlane = new THREE.Mesh(leakGeo, leakMat);
    leakPlane.rotation.x = -Math.PI / 2;
    leakPlane.position.set(0, 0.76, 0);
    batteryGroup.add(leakPlane);

    // Grid Helper
    const grid = new THREE.GridHelper(10, 20, 0x00f2ff, 0x1e293b);
    grid.position.y = -1;
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      const currentStatus = statusRef.current;

      // Update Corrosion Visuals
      const corrosionOpacity = currentStatus.corrosionLevel / 100;
      posCrystals.forEach((c, i) => {
        const mat = c.material as THREE.MeshStandardMaterial;
        mat.opacity = i < (currentStatus.corrosionLevel / 2) ? 0.8 : 0;
        if (mat.opacity > 0) {
          mat.color.setHSL(0.1, 0.2, 0.8 + Math.sin(Date.now() * 0.001 + i) * 0.1);
        }
      });
      negCrystals.forEach((c, i) => {
        const mat = c.material as THREE.MeshStandardMaterial;
        mat.opacity = i < (currentStatus.corrosionLevel / 2) ? 0.8 : 0;
      });

      // Update Leakage Visuals
      if (currentStatus.leakageDetected) {
        leakMat.opacity = 0.6;
        leakPlane.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.1);
      } else {
        leakMat.opacity = 0;
      }

      // Subtle rotation
      batteryGroup.rotation.y += 0.002;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // Empty dependency array

  return <div ref={containerRef} className="w-full h-full" />;
};
