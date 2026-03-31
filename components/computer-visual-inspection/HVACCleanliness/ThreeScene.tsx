import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HVACStatus } from './three-types';

interface ThreeSceneProps {
  status: HVACStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<HVACStatus>(status);

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
    camera.position.set(0, 5, 15);

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

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // HVAC Duct (Transparent Cylinder)
    const ductGeom = new THREE.CylinderGeometry(3, 3, 20, 32, 1, true);
    const ductMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      transparent: true, 
      opacity: 0.2, 
      side: THREE.DoubleSide,
      metalness: 0.9,
      roughness: 0.1
    });
    const duct = new THREE.Mesh(ductGeom, ductMat);
    duct.rotation.x = Math.PI / 2;
    scene.add(duct);

    // Duct Frame
    const frameGeom = new THREE.CylinderGeometry(3.1, 3.1, 20, 32, 1, true);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.1 });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    frame.rotation.x = Math.PI / 2;
    scene.add(frame);

    // Inspection Robot
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    const robotBodyGeom = new THREE.BoxGeometry(1, 0.6, 1.5);
    const robotMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const robotBody = new THREE.Mesh(robotBodyGeom, robotMat);
    robotGroup.add(robotBody);

    const cameraLensGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const lens = new THREE.Mesh(cameraLensGeom, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.8;
    robotGroup.add(lens);

    const lightGeom = new THREE.SphereGeometry(0.1, 16, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const rLight = new THREE.Mesh(lightGeom, lightMat);
    rLight.position.set(0.3, 0.2, 0.8);
    robotGroup.add(rLight);

    const spotLight = new THREE.SpotLight(0xffffff, 2, 10, Math.PI / 6);
    spotLight.position.set(0, 0, 0.8);
    robotGroup.add(spotLight);
    spotLight.target.position.set(0, 0, 5);
    robotGroup.add(spotLight.target);

    // Dust Particles
    const dustCount = 500;
    const dustParticles = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      dustPos[i * 3] = r * Math.cos(theta);
      dustPos[i * 3 + 1] = r * Math.sin(theta);
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    dustParticles.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dMat = new THREE.PointsMaterial({ color: 0x64748b, size: 0.05, transparent: true, opacity: 0.5 });
    const dustSystem = new THREE.Points(dustParticles, dMat);
    scene.add(dustSystem);

    // Mold Spots (Random spheres on duct surface)
    const moldGroup = new THREE.Group();
    scene.add(moldGroup);
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 18;
      const mGeom = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 8, 8);
      const mMat = new THREE.MeshStandardMaterial({ color: 0x166534, transparent: true, opacity: 0.8 });
      const m = new THREE.Mesh(mGeom, mMat);
      m.position.set(2.9 * Math.cos(theta), 2.9 * Math.sin(theta), z);
      moldGroup.add(m);
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

      // Robot movement
      robotGroup.position.z = (s.robotPosition - 0.5) * 18;
      robotGroup.rotation.y = Math.sin(time * 2) * 0.1;

      // Dust visual feedback
      dMat.opacity = s.dustLevel * 0.8;
      dMat.size = 0.05 + s.dustLevel * 0.05;

      // Mold visual feedback
      moldGroup.visible = s.moldDetected;
      if (s.moldDetected) {
        moldGroup.children.forEach((m: any) => {
          m.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
        });
      }

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
