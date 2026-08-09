import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CabinetStatus } from './three-types';

interface ThreeSceneProps {
  status: CabinetStatus;
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

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(4, 3, 6);

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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x00f2ff, 2);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x7000ff, 2);
    rimLight.position.set(-5, -5, -5);
    scene.add(rimLight);

    // Cabinet Main Body (Transparent Shell)
    const cabinetGeo = new THREE.BoxGeometry(2.5, 4, 1.2);
    const cabinetMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.3,
      transmission: 0.5,
      thickness: 0.5,
    });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    scene.add(cabinet);

    // Cabinet Frame
    const frameGeo = new THREE.BoxGeometry(2.6, 4.1, 1.3);
    const frameEdges = new THREE.EdgesGeometry(frameGeo);
    const frameMat = new THREE.LineBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.5 });
    const frame = new THREE.LineSegments(frameEdges, frameMat);
    scene.add(frame);

    // Internal Components (Simplified Breakers/Modules)
    const components: THREE.Mesh[] = [];
    const componentGroup = new THREE.Group();
    
    const rows = 4;
    const cols = 3;
    const compWidth = 0.5;
    const compHeight = 0.6;
    const compDepth = 0.4;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const compGeo = new THREE.BoxGeometry(compWidth, compHeight, compDepth);
        const compMat = new THREE.MeshStandardMaterial({ 
          color: 0x334155,
          emissive: 0x000000,
          metalness: 0.8,
          roughness: 0.2
        });
        const comp = new THREE.Mesh(compGeo, compMat);
        comp.position.set(
          (c - (cols - 1) / 2) * 0.7,
          (r - (rows - 1) / 2) * 0.9,
          0
        );
        componentGroup.add(comp);
        components.push(comp);

        // Add a small indicator light on each component
        const lightGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const indicator = new THREE.Mesh(lightGeo, lightMat);
        indicator.position.set(0.15, 0.2, 0.21);
        comp.add(indicator);
      }
    }
    scene.add(componentGroup);

    // Heat Glow Effect
    const glowGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0 
    });
    const heatGlow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(heatGlow);

    // Grid Helper
    const grid = new THREE.GridHelper(10, 20, 0x00f2ff, 0x1e293b);
    grid.position.y = -2.1;
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      const currentStatus = statusRef.current;

      // Update component colors based on temperature
      components.forEach((comp, idx) => {
        const compMat = comp.material as THREE.MeshStandardMaterial;
        const indicator = comp.children[0] as THREE.Mesh;
        const indicatorMat = indicator.material as THREE.MeshBasicMaterial;

        if (currentStatus.isOverheating && idx === 5) { // Simulate one component overheating
          compMat.emissive.setHex(0xff3300);
          compMat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
          indicatorMat.color.setHex(0xff0000);
          
          heatGlow.position.copy(comp.position);
          heatGlow.position.add(componentGroup.position);
          heatGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.2);
          heatGlow.material.opacity = 0.4 + Math.sin(Date.now() * 0.01) * 0.2;
        } else {
          compMat.emissive.setHex(0x000000);
          indicatorMat.color.setHex(0x00ff00);
          if (!currentStatus.isOverheating) heatGlow.material.opacity = 0;
        }
      });

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
  }, []); // Empty dependency array as per requirements

  return <div ref={containerRef} className="w-full h-full" />;
};
