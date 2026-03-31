import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SlopeAnomalies } from './three-types';

interface ThreeSceneProps {
  anomalies: SlopeAnomalies[];
  safetyFactor: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ anomalies, safetyFactor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ anomalies, safetyFactor });

  useEffect(() => {
    propsRef.current = { anomalies, safetyFactor };
  }, [anomalies, safetyFactor]);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 1. Terrain Model (Simplified Slope)
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    const terrainGeo = new THREE.PlaneGeometry(30, 30, 32, 32);
    const terrainMat = new THREE.MeshPhongMaterial({ 
      color: 0x475569, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    // Deform terrain to look like a slope
    const posAttr = terrainGeo.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Create a slope effect
      posAttr.setZ(i, (x + 15) * 0.5 + Math.sin(y * 0.5) * 0.5);
    }
    terrainGeo.computeVertexNormals();

    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrainGroup.add(terrain);

    // 2. Heatmap Overlay (Points)
    const heatmapGroup = new THREE.Group();
    scene.add(heatmapGroup);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x3b82f6, 100);
    spotLight.position.set(10, 30, 10);
    scene.add(spotLight);

    // 4. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { anomalies: currentAnomalies } = propsRef.current;

      // Update anomaly markers
      if (heatmapGroup.children.length !== currentAnomalies.length) {
        while(heatmapGroup.children.length > 0) {
          heatmapGroup.remove(heatmapGroup.children[0]);
        }
        currentAnomalies.forEach(anomaly => {
          const markerGeo = new THREE.SphereGeometry(0.5, 16, 16);
          const markerMat = new THREE.MeshBasicMaterial({ 
            color: anomaly.severity === 'high' ? 0xef4444 : 0xf59e0b,
            transparent: true,
            opacity: 0.8
          });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.set(anomaly.position[0], anomaly.position[1], anomaly.position[2]);
          heatmapGroup.add(marker);

          // Add a "pulse" ring
          const ringGeo = new THREE.RingGeometry(0.6, 0.8, 32);
          const ringMat = new THREE.MeshBasicMaterial({ 
            color: markerMat.color, 
            transparent: true, 
            opacity: 0.5,
            side: THREE.DoubleSide 
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.copy(marker.position);
          ring.rotation.x = -Math.PI / 2;
          heatmapGroup.add(ring);
        });
      }

      // Animate markers
      heatmapGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry instanceof THREE.SphereGeometry) {
            child.scale.setScalar(1 + Math.sin(Date.now() * 0.01 + i) * 0.2);
          } else if (child.geometry instanceof THREE.RingGeometry) {
            child.scale.setScalar(1 + Math.sin(Date.now() * 0.01 + i) * 0.5);
            child.material.opacity = 0.5 - Math.sin(Date.now() * 0.01 + i) * 0.5;
          }
        }
      });

      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
