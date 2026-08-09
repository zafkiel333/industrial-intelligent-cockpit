import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BeltState } from './three-types';

interface ThreeSceneProps {
  state: BeltState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const beltRef = useRef<THREE.Mesh | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  
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
    camera.position.set(10, 8, 12);
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
    const beltGeo = new THREE.BoxGeometry(30, 0.2, 4);
    const beltTexture = new THREE.TextureLoader().load('https://picsum.photos/seed/belt_surface/512/512');
    beltTexture.wrapS = THREE.RepeatWrapping;
    beltTexture.repeat.set(6, 1);
    
    const beltMat = new THREE.MeshPhongMaterial({ map: beltTexture, color: 0x1e293b });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    beltRef.current = belt;
    scene.add(belt);

    // 2. Objects Group
    const objectsGroup = new THREE.Group();
    objectsGroupRef.current = objectsGroup;
    scene.add(objectsGroup);

    // 3. Scanning Frame
    const frameGeo = new THREE.BoxGeometry(0.5, 5, 5);
    const frameMat = new THREE.MeshPhongMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 2.5, 0);
    scene.add(frame);

    const scanLineGeo = new THREE.PlaneGeometry(0.1, 5);
    const scanLineMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const scanLine = new THREE.Mesh(scanLineGeo, scanLineMat);
    scanLine.rotation.y = Math.PI / 2;
    scanLine.position.set(0, 2.5, 0);
    scene.add(scanLine);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xef4444, 100);
    spotLight.position.set(0, 10, 0);
    scene.add(spotLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { state: currentState } = propsRef.current;

      // Move belt texture
      if (beltRef.current && beltRef.current.material instanceof THREE.MeshPhongMaterial) {
        const mat = beltRef.current.material as THREE.MeshPhongMaterial;
        if (mat.map) {
          mat.map.offset.x += currentState.beltSpeed * 0.01;
        }
      }

      // Animate scan line
      scanLine.position.z = Math.sin(Date.now() * 0.005) * 2;

      // Update detected objects
      if (objectsGroupRef.current) {
        // Clear old
        while(objectsGroupRef.current.children.length > 0) {
          const child = objectsGroupRef.current.children[0] as THREE.Mesh;
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
          objectsGroupRef.current.remove(child);
        }

        // Add current
        currentState.detectedObjects.forEach(obj => {
          const objGeo = obj.type === 'foreign' ? new THREE.BoxGeometry(0.5, 0.5, 0.5) : new THREE.SphereGeometry(0.8, 16, 16);
          const objMat = new THREE.MeshPhongMaterial({ 
            color: obj.type === 'foreign' ? 0xef4444 : 0xf59e0b,
            emissive: obj.type === 'foreign' ? 0xef4444 : 0xf59e0b,
            emissiveIntensity: 0.5 + Math.sin(Date.now() * 0.01) * 0.5
          });
          const objMesh = new THREE.Mesh(objGeo, objMat);
          objMesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
          objectsGroupRef.current?.add(objMesh);

          // Bounding Box
          const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
          const boxMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true });
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set(obj.position[0], obj.position[1], obj.position[2]);
          objectsGroupRef.current?.add(box);
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
