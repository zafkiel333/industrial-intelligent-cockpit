import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { IndustrialCameraState } from './three-types';

interface ThreeSceneProps {
  state: IndustrialCameraState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<IndustrialCameraState>(state);
  const conveyorBeltRef = useRef<THREE.Mesh | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const strobeLightRef = useRef<THREE.PointLight | null>(null);
  const lastStrobeTimeRef = useRef<number>(0);

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
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Basic ambient light (dim)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Strobe Light
    const strobeLight = new THREE.PointLight(0xffffff, 0, 10);
    strobeLight.position.set(0, 2, 0);
    scene.add(strobeLight);
    strobeLightRef.current = strobeLight;

    // Conveyor Belt
    const beltGeo = new THREE.BoxGeometry(10, 0.2, 2);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    scene.add(belt);
    conveyorBeltRef.current = belt;

    // Camera Model
    const cameraGeo = new THREE.BoxGeometry(0.5, 0.5, 0.8);
    const cameraMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const cameraMesh = new THREE.Mesh(cameraGeo, cameraMat);
    cameraMesh.position.set(0, 2.5, 0);
    cameraMesh.rotation.x = Math.PI / 2; // Pointing down
    scene.add(cameraMesh);

    // Lens
    const lensGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, 2.1, 0);
    scene.add(lens);

    // Objects on conveyor
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    const createObject = (xOffset: number) => {
      const objGeo = new THREE.BoxGeometry(0.6, 0.4, 0.6);
      const objMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
      const obj = new THREE.Mesh(objGeo, objMat);
      obj.position.set(xOffset, 0.3, 0);
      return obj;
    };

    // Add a few objects
    for (let i = -5; i <= 5; i += 2) {
      objectsGroup.add(createObject(i));
    }

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;
      time += 0.016; // approx 60fps

      // Move objects
      if (objectsGroupRef.current) {
        objectsGroupRef.current.children.forEach(obj => {
          obj.position.x += currentState.conveyorSpeed * 0.016;
          if (obj.position.x > 5) {
            obj.position.x = -5;
          }
        });
      }

      // Strobe logic
      const now = performance.now();
      const strobePeriodMs = 1000 / currentState.strobeFrequency;
      
      if (now - lastStrobeTimeRef.current >= strobePeriodMs) {
        lastStrobeTimeRef.current = now;
        if (strobeLightRef.current) {
          strobeLightRef.current.intensity = 5; // Flash on
        }
      }

      // Turn off strobe after duration
      if (strobeLightRef.current && strobeLightRef.current.intensity > 0) {
        const timeSinceFlash = now - lastStrobeTimeRef.current;
        // Convert microseconds to milliseconds for comparison
        if (timeSinceFlash > currentState.strobeDuration / 1000) {
          strobeLightRef.current.intensity = 0;
        }
      }

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
