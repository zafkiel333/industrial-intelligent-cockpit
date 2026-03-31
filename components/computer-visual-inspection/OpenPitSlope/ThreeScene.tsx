import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SlopeState } from './three-types';

interface ThreeSceneProps {
  state: SlopeState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const terrainRef = useRef<THREE.Mesh | null>(null);
  
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
    camera.position.set(15, 10, 15);
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

    // 1. Terrain (Slope)
    const geometry = new THREE.PlaneGeometry(20, 20, 32, 32);
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      // Create a slope effect
      vertices[i + 2] = (x + 10) * 0.5 + Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.5;
    }
    geometry.computeVertexNormals();

    // Heatmap material
    const material = new THREE.MeshPhongMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrainRef.current = terrain;
    scene.add(terrain);

    // 2. Scanning Laser
    const laserGeo = new THREE.CylinderGeometry(0.01, 0.01, 30, 8);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.8 });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.z = Math.PI / 2;
    scene.add(laser);

    // 3. Points
    const pointsGroup = new THREE.Group();
    scene.add(pointsGroup);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x06b6d4, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { state: currentState } = propsRef.current;

      // Animate laser
      laser.position.z = Math.sin(Date.now() * 0.001) * 10;
      laser.position.y = 5 + Math.cos(Date.now() * 0.001) * 2;

      // Update points
      if (pointsGroup.children.length === 0) {
        currentState.points.forEach(p => {
          const pGeo = new THREE.SphereGeometry(0.2, 16, 16);
          const pMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          const pMesh = new THREE.Mesh(pGeo, pMat);
          pMesh.position.set(p.position[0], p.position[2], -p.position[1]);
          pointsGroup.add(pMesh);
        });
      }

      pointsGroup.children.forEach((p, i) => {
        const pointData = currentState.points[i];
        if (pointData && p instanceof THREE.Mesh) {
          const mat = p.material as THREE.MeshBasicMaterial;
          const intensity = Math.min(1, pointData.displacement / 50);
          mat.color.setRGB(0.1 + intensity * 0.9, 0.7 - intensity * 0.5, 0.5);
          p.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);
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
