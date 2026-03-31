import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BeltCleanerState } from './three-types';

interface ThreeSceneProps {
  state: BeltCleanerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const beltRef = useRef<THREE.Mesh | null>(null);
  const bladesRef = useRef<THREE.Group | null>(null);
  
  const propsRef = useRef({ state });

  useEffect(() => {
    propsRef.current = { state };
  }, [state]);

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
    camera.position.set(8, 6, 10);
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

    // 1. Conveyor Belt
    const beltGeo = new THREE.BoxGeometry(20, 0.2, 4);
    const beltTexture = new THREE.TextureLoader().load('https://picsum.photos/seed/belt/512/512');
    beltTexture.wrapS = THREE.RepeatWrapping;
    beltTexture.repeat.set(4, 1);
    
    const beltMat = new THREE.MeshPhongMaterial({ map: beltTexture, color: 0x111111 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    beltRef.current = belt;
    scene.add(belt);

    // 2. Cleaner Assembly
    const assemblyGroup = new THREE.Group();
    assemblyGroup.position.set(0, -0.5, 0);
    scene.add(assemblyGroup);

    const frameGeo = new THREE.CylinderGeometry(0.1, 0.1, 5, 16);
    const frameMat = new THREE.MeshPhongMaterial({ color: 0x334155 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.rotation.z = Math.PI / 2;
    assemblyGroup.add(frame);

    // 3. Blades
    const bladesGroup = new THREE.Group();
    bladesRef.current = bladesGroup;
    assemblyGroup.add(bladesGroup);

    const bladeGeo = new THREE.BoxGeometry(0.4, 0.8, 0.1);
    for (let i = 0; i < 8; i++) {
      const bladeMat = new THREE.MeshPhongMaterial({ color: 0x10b981 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.x = (i - 3.5) * 0.6;
      blade.position.y = 0.4;
      blade.rotation.x = -0.2;
      bladesGroup.add(blade);
    }

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x06b6d4, 50);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { state: currentState } = propsRef.current;

      // Move belt
      if (beltRef.current && beltRef.current.material instanceof THREE.MeshPhongMaterial) {
        const mat = beltRef.current.material as THREE.MeshPhongMaterial;
        if (mat.map) {
          mat.map.offset.x += currentState.beltSpeed * 0.01;
        }
      }

      // Update blades color based on wear
      if (bladesRef.current) {
        bladesRef.current.children.forEach((blade, i) => {
          const bladeData = currentState.blades[i];
          if (bladeData && blade instanceof THREE.Mesh) {
            const mat = blade.material as THREE.MeshPhongMaterial;
            // Interpolate color from Green to Red
            const r = bladeData.wearLevel;
            const g = 1 - bladeData.wearLevel;
            mat.color.setRGB(r, g, 0.2);
            
            // Add some vibration
            blade.position.y = 0.4 + Math.sin(Date.now() * 0.02) * currentState.vibration * 0.01;
          }
        });
      }

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
