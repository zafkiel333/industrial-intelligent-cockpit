import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThrusterState } from './three-types';

interface ThreeSceneProps {
  state?: ThrusterState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<ThrusterState>(state || {
    rpm: 800,
    vibrationIntensity: 0.18,
    pitchAngle: 45,
    thrust: 120,
    motorTemp: 55
  });

  useEffect(() => {
    if (state) {
      stateRef.current = state;
    }
  }, [state]);

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

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Thruster Model
    const thrusterGroup = new THREE.Group();
    scene.add(thrusterGroup);

    // Tunnel
    const tunnelGeom = new THREE.CylinderGeometry(2.5, 2.5, 6, 32, 1, true);
    const tunnelMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    thrusterGroup.add(tunnel);

    // Hub
    const hubGeom = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.rotation.z = Math.PI / 2;
    thrusterGroup.add(hub);

    // Blades
    const bladeGroup = new THREE.Group();
    thrusterGroup.add(bladeGroup);

    const bladeGeom = new THREE.BoxGeometry(0.1, 2, 0.8);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8 });
    
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(bladeGeom, bladeMat);
      const pivot = new THREE.Group();
      pivot.rotation.x = (i * Math.PI) / 2;
      b.position.y = 1.2;
      pivot.add(b);
      bladeGroup.add(pivot);
    }

    // Grid
    const grid = new THREE.GridHelper(20, 10, 0x00ffff, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { rpm, vibrationIntensity, pitchAngle } = stateRef.current;
      const time = Date.now() * 0.001;

      // Rotation
      bladeGroup.rotation.x += rpm * 0.0002;

      // Pitch (visualize by rotating blades slightly on their local axis)
      bladeGroup.children.forEach(pivot => {
        pivot.children[0].rotation.y = THREE.MathUtils.degToRad(pitchAngle - 45);
      });

      // Vibration effect
      const vib = Math.sin(time * 150) * (vibrationIntensity * 0.02);
      thrusterGroup.position.y = vib;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
