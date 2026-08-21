import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    vibration: 1.5,
    frequency: 15,
  });

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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.01);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(40, 30, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Vibrating Screen Model
    const screenGroup = new THREE.Group();
    scene.add(screenGroup);

    // Screen Frame (Solid + Wireframe)
    const frameGeom = new THREE.BoxGeometry(30, 4, 18);
    const frameMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0x10b981,
      emissiveIntensity: 0.1
    });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    screenGroup.add(frame);

    const wireframe = new THREE.WireframeGeometry(frameGeom);
    const line = new THREE.LineSegments(wireframe);
    (line.material as THREE.LineBasicMaterial).color.setHex(0x10b981);
    (line.material as THREE.LineBasicMaterial).transparent = true;
    (line.material as THREE.LineBasicMaterial).opacity = 0.3;
    screenGroup.add(line);

    // Mesh (Grid)
    const meshGeom = new THREE.PlaneGeometry(28, 16);
    const meshMat = new THREE.MeshStandardMaterial({ color: 0x10b981, wireframe: true });
    const mesh = new THREE.Mesh(meshGeom, meshMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 2.1;
    screenGroup.add(mesh);

    // Material Particles (Jumping)
    const particleGeom = new THREE.SphereGeometry(0.4, 8, 8);
    const particleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const particles: THREE.Mesh[] = [];
    for (let i = 0; i < 40; i++) {
      const p = new THREE.Mesh(particleGeom, particleMat);
      p.position.set(Math.random() * 26 - 13, 3, Math.random() * 14 - 7);
      screenGroup.add(p);
      particles.push(p);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x10b981, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { vibration, frequency } = dataRef.current;

      // Vibration (Circular/Linear)
      const vibX = Math.cos(time * frequency) * (vibration / 2);
      const vibY = Math.sin(time * frequency) * (vibration / 2);
      screenGroup.position.set(vibX, vibY, 0);

      // Particles Jumping
      particles.forEach((p, i) => {
        p.position.y = 3 + Math.abs(Math.sin(time * frequency + i)) * 3;
        p.position.x += 0.1;
        if (p.position.x > 13) {
          p.position.x = -13;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    const frameId = requestAnimationFrame(animate);

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
