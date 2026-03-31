import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HoistRopeState } from './three-types';

interface ThreeSceneProps {
  state: HoistRopeState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const ropeRef = useRef<THREE.Group | null>(null);
  const scanFrameRef = useRef<THREE.Mesh | null>(null);
  
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
    camera.position.set(5, 2, 8);
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

    // 1. Steel Wire Rope (Simplified as multiple cylinders)
    const ropeGroup = new THREE.Group();
    ropeRef.current = ropeGroup;
    scene.add(ropeGroup);

    const wireGeo = new THREE.CylinderGeometry(0.1, 0.1, 20, 8);
    const wireMat = new THREE.MeshPhongMaterial({ color: 0x64748b, shininess: 100 });
    
    for (let i = 0; i < 6; i++) {
      const wire = new THREE.Mesh(wireGeo, wireMat);
      const angle = (i / 6) * Math.PI * 2;
      wire.position.set(Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3);
      wire.rotation.y = angle;
      ropeGroup.add(wire);
    }

    // 2. Scanning Frame
    const frameGeo = new THREE.TorusGeometry(1.5, 0.05, 16, 100);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
    const scanFrame = new THREE.Mesh(frameGeo, frameMat);
    scanFrame.rotation.x = Math.PI / 2;
    scanFrameRef.current = scanFrame;
    scene.add(scanFrame);

    // 3. Broken Wires Group
    const brokenGroup = new THREE.Group();
    scene.add(brokenGroup);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xef4444, 100);
    spotLight.position.set(5, 5, 5);
    scene.add(spotLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { state: currentState } = propsRef.current;

      // Move rope vertically
      if (ropeRef.current) {
        ropeRef.current.position.y -= currentState.ropeSpeed * 0.01;
        if (ropeRef.current.position.y < -5) ropeRef.current.position.y = 5;
        
        // Twist animation
        ropeRef.current.rotation.y += 0.01;
      }

      // Animate scan frame
      if (scanFrameRef.current) {
        scanFrameRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.05);
      }

      // Update broken wires
      if (brokenGroup.children.length === 0 && currentState.brokenWires.length > 0) {
        currentState.brokenWires.forEach(bw => {
          const bwGeo = new THREE.SphereGeometry(0.1, 8, 8);
          const bwMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const bwMesh = new THREE.Mesh(bwGeo, bwMat);
          bwMesh.position.set(bw.position[0], bw.position[1], bw.position[2]);
          brokenGroup.add(bwMesh);
        });
      }
      
      // Keep broken wires relative to rope
      brokenGroup.position.y = ropeRef.current?.position.y || 0;
      brokenGroup.rotation.y = ropeRef.current?.rotation.y || 0;

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
