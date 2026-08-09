import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AnchorChainState } from './three-types';

interface ThreeSceneProps {
  state: AnchorChainState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
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
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 8, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Windlass (Simplified)
    const windlassGroup = new THREE.Group();
    const drumGeometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    const drumMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const drum = new THREE.Mesh(drumGeometry, drumMaterial);
    drum.rotation.z = Math.PI / 2;
    windlassGroup.add(drum);

    const baseGeometry = new THREE.BoxGeometry(4, 1, 4);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1.5;
    windlassGroup.add(base);

    scene.add(windlassGroup);

    // Anchor Chain (Simplified as a tube)
    const chainPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      chainPoints.push(new THREE.Vector3(0, -i * 0.5, i * 0.2));
    }
    const chainCurve = new THREE.CatmullRomCurve3(chainPoints);
    const chainGeometry = new THREE.TubeGeometry(chainCurve, 64, 0.2, 8, false);
    const chainMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const chain = new THREE.Mesh(chainGeometry, chainMaterial);
    chain.position.set(0, 0, 1.5);
    scene.add(chain);

    // Sea Floor (Simplified)
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -20;
    scene.add(floor);

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const { length, tension } = stateRef.current;
      
      // Rotate windlass
      drum.rotation.x += (length > 0 ? 0.01 : 0);

      // Pulse chain color based on tension
      const tensionFactor = Math.min(1, tension / 1000);
      chainMaterial.emissive.setHex(0xf43f5e);
      chainMaterial.emissiveIntensity = tensionFactor * 0.5;

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
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
