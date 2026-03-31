import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CavitationPoint } from './three-types';

interface ThreeSceneProps {
  rpm: number;
  cavitationPoints: CavitationPoint[];
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ rpm, cavitationPoints }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ rpm, cavitationPoints });

  useEffect(() => {
    propsRef.current = { rpm, cavitationPoints };
  }, [rpm, cavitationPoints]);

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
    camera.position.set(0, 5, 10);
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
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controlsRef.current = controls;

    // 1. Turbine Runner (Simplified)
    const runnerGroup = new THREE.Group();
    scene.add(runnerGroup);

    const hubGeo = new THREE.CylinderGeometry(1, 1.2, 2, 32);
    const hubMat = new THREE.MeshPhongMaterial({ color: 0x334155, shininess: 100 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    runnerGroup.add(hub);

    const bladeCount = 6;
    const bladeGeo = new THREE.BoxGeometry(4, 0.2, 2);
    // Twist blades
    const bladePositions = bladeGeo.attributes.position;
    for (let i = 0; i < bladePositions.count; i++) {
      const x = bladePositions.getX(i);
      if (x > 0) {
        const y = bladePositions.getY(i);
        const z = bladePositions.getZ(i);
        bladePositions.setY(i, y + x * 0.2);
        bladePositions.setZ(i, z + x * 0.1);
      }
    }
    
    const bladeMat = new THREE.MeshPhongMaterial({ 
      color: 0x64748b, 
      shininess: 150,
      transparent: true,
      opacity: 0.9
    });

    for (let i = 0; i < bladeCount; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.x = 2.5;
      const pivot = new THREE.Group();
      pivot.rotation.y = (i / bladeCount) * Math.PI * 2;
      pivot.add(blade);
      runnerGroup.add(pivot);
    }

    // 2. Cavitation Markers
    const cavitationGroup = new THREE.Group();
    runnerGroup.add(cavitationGroup);

    // 3. Environment
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x0ea5e9, 10);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    // 4. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { rpm: currentRpm, cavitationPoints: currentPoints } = propsRef.current;

      // Rotate runner
      runnerGroup.rotation.y += (currentRpm / 60) * 0.1;

      // Update cavitation points
      if (cavitationGroup.children.length !== currentPoints.length) {
        while(cavitationGroup.children.length > 0) {
          cavitationGroup.remove(cavitationGroup.children[0]);
        }
        currentPoints.forEach(point => {
          const bubbleGeo = new THREE.SphereGeometry(0.15 * point.intensity, 8, 8);
          const bubbleMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.8 
          });
          const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
          bubble.position.set(point.position[0], point.position[1], point.position[2]);
          cavitationGroup.add(bubble);
        });
      }

      // Bubble animation
      cavitationGroup.children.forEach((child, i) => {
        child.scale.setScalar(1 + Math.sin(Date.now() * 0.01 + i) * 0.3);
      });

      if (controlsRef.current) {
        controlsRef.current.update();
      }

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
