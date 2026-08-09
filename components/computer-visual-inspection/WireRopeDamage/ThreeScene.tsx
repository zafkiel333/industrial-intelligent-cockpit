import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RopeDamage } from './three-types';

interface ThreeSceneProps {
  damages: RopeDamage[];
  isMoving: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ damages, isMoving }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ damages, isMoving });

  useEffect(() => {
    propsRef.current = { damages, isMoving };
  }, [damages, isMoving]);

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
    camera.position.set(5, 5, 10);
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

    // 1. Wire Rope (Cylinder with texture-like geometry)
    const ropeGroup = new THREE.Group();
    scene.add(ropeGroup);

    const ropeGeo = new THREE.CylinderGeometry(0.5, 0.5, 20, 32);
    const ropeMat = new THREE.MeshPhongMaterial({ color: 0x475569, shininess: 100 });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    ropeGroup.add(rope);

    // 2. Damage Markers
    const damageMarkers = new THREE.Group();
    ropeGroup.add(damageMarkers);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xef4444, 100);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    // 4. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { damages: currentDamages, isMoving: currentMoving } = propsRef.current;

      if (currentMoving) {
        ropeGroup.position.y = (Date.now() * 0.002) % 10 - 5;
      }

      // Update damage markers
      if (damageMarkers.children.length !== currentDamages.length) {
        while(damageMarkers.children.length > 0) {
          damageMarkers.remove(damageMarkers.children[0]);
        }
        currentDamages.forEach((damage) => {
          const markerGeo = new THREE.SphereGeometry(0.2, 16, 16);
          const markerMat = new THREE.MeshBasicMaterial({ 
            color: damage.type === 'broken' ? 0xef4444 : (damage.type === 'corrosion' ? 0xf59e0b : 0x3b82f6)
          });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.set(0.5, damage.position - 10, 0);
          damageMarkers.add(marker);
        });
      }

      // Pulse markers
      damageMarkers.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.2);
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
