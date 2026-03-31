import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FanStatus } from './three-types';

interface ThreeSceneProps {
  status: FanStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<FanStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1, 50);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // Fan Model
    const fanGroup = new THREE.Group();
    scene.add(fanGroup);

    // Housing
    const housingGeom = new THREE.CylinderGeometry(6, 6.5, 4, 32, 1, true);
    const housingMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      metalness: 0.8, 
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const housing = new THREE.Mesh(housingGeom, housingMat);
    fanGroup.add(housing);

    // Motor Hub
    const hubGeom = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.position.y = -0.5;
    fanGroup.add(hub);

    // Blades
    const bladeGroup = new THREE.Group();
    fanGroup.add(bladeGroup);

    const bladeGeom = new THREE.BoxGeometry(5, 0.1, 1.2);
    const bladeMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, 
      metalness: 0.7, 
      roughness: 0.3 
    });
    const iceMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      emissive: 0xccffff, 
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });

    const blades: THREE.Mesh[] = [];
    const icePatches: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.set(Math.cos(angle) * 3, 0, Math.sin(angle) * 3);
      blade.rotation.y = -angle;
      blade.rotation.x = 0.2; // Pitch
      bladeGroup.add(blade);
      blades.push(blade);

      // Ice Patch on each blade
      const iceGeom = new THREE.BoxGeometry(3, 0.15, 1.3);
      const ice = new THREE.Mesh(iceGeom, iceMat);
      ice.position.set(Math.cos(angle) * 3.5, 0.05, Math.sin(angle) * 3.5);
      ice.rotation.y = -angle;
      ice.rotation.x = 0.2;
      ice.visible = false;
      bladeGroup.add(ice);
      icePatches.push(ice);
    }

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x00ffff, 0x1e293b);
    grid.position.y = -5;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Rotation
      bladeGroup.rotation.y += (s.rotationSpeed / 60) * 0.1;

      // Vibration
      if (s.isVibrating) {
        fanGroup.position.x = Math.sin(time * 50) * s.vibrationX * 0.05;
        fanGroup.position.y = Math.sin(time * 55) * s.vibrationY * 0.05;
        fanGroup.position.z = Math.sin(time * 60) * s.vibrationZ * 0.05;
      } else {
        fanGroup.position.set(0, 0, 0);
      }

      // Icing Visualization
      icePatches.forEach(ice => {
        ice.visible = s.isIcing;
        if (s.isIcing) {
          ice.scale.set(1, s.icingThickness / 2, 1);
        }
      });

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
