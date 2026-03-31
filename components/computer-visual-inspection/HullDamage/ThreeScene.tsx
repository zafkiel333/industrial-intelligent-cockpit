import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HullState } from './three-types';

interface ThreeSceneProps {
  state: HullState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const hullRef = useRef<THREE.Mesh | null>(null);
  const damageGroupRef = useRef<THREE.Group | null>(null);
  
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
    camera.position.set(12, 6, 15);
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

    // 1. Ship Hull (Simplified as a curved plane)
    const hullGeo = new THREE.PlaneGeometry(20, 10, 32, 32);
    const vertices = hullGeo.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      // Create a hull curve
      vertices[i + 2] = Math.pow(x / 10, 2) * 2 + Math.pow(y / 5, 2) * 1;
    }
    hullGeo.computeVertexNormals();

    const hullMat = new THREE.MeshPhongMaterial({ 
      color: 0x334155, 
      side: THREE.DoubleSide,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.x = -Math.PI / 2;
    hullRef.current = hull;
    scene.add(hull);

    // 2. Damage Group
    const damageGroup = new THREE.Group();
    damageGroupRef.current = damageGroup;
    hull.add(damageGroup);

    // 3. Scanning Laser
    const laserGeo = new THREE.PlaneGeometry(0.1, 12);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.z = Math.PI / 2;
    scene.add(laser);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x06b6d4, 100);
    spotLight.position.set(10, 10, 10);
    scene.add(spotLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { state: currentState } = propsRef.current;

      // Animate laser
      laser.position.x = Math.sin(Date.now() * 0.001) * 10;
      laser.position.y = 5 + Math.cos(Date.now() * 0.001) * 1;

      // Update damage points
      if (damageGroupRef.current) {
        // Clear old
        while(damageGroupRef.current.children.length > 0) {
          const child = damageGroupRef.current.children[0] as THREE.Mesh;
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
          damageGroupRef.current.remove(child);
        }

        // Add current
        currentState.damagePoints.forEach(p => {
          const pGeo = new THREE.SphereGeometry(0.3, 16, 16);
          const pMat = new THREE.MeshBasicMaterial({ 
            color: p.severity === 'high' ? 0xef4444 : p.severity === 'medium' ? 0xf59e0b : 0x10b981,
            transparent: true,
            opacity: 0.8 + Math.sin(Date.now() * 0.01) * 0.2
          });
          const pMesh = new THREE.Mesh(pGeo, pMat);
          pMesh.position.set(p.position[0], p.position[1], p.position[2] + 0.2);
          damageGroupRef.current?.add(pMesh);
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
