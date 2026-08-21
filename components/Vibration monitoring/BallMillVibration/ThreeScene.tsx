import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    speed: 15,
    vibration: 0.8,
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
    scene.fog = new THREE.FogExp2(0x315268, 0.005);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(80, 60, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Ball Mill Group
    const millGroup = new THREE.Group();
    scene.add(millGroup);

    // Main Drum
    const drumGeom = new THREE.CylinderGeometry(25, 25, 60, 64);
    const drumMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.3
    });
    const drum = new THREE.Mesh(drumGeom, drumMat);
    drum.rotation.z = Math.PI / 2;
    millGroup.add(drum);

    // Drum Wireframe
    const drumWire = new THREE.WireframeGeometry(drumGeom);
    const drumWireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.4 });
    const drumWireMesh = new THREE.LineSegments(drumWire, drumWireMat);
    drumWireMesh.rotation.z = Math.PI / 2;
    millGroup.add(drumWireMesh);

    // Bearings
    const bearingGeom = new THREE.CylinderGeometry(10, 10, 10, 32);
    const bearingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const bearingL = new THREE.Mesh(bearingGeom, bearingMat);
    bearingL.rotation.z = Math.PI / 2;
    bearingL.position.x = -35;
    millGroup.add(bearingL);

    const bearingR = new THREE.Mesh(bearingGeom, bearingMat);
    bearingR.rotation.z = Math.PI / 2;
    bearingR.position.x = 35;
    millGroup.add(bearingR);

    // Internal Balls (Particles)
    const ballCount = 100;
    const balls = new THREE.Group();
    millGroup.add(balls);
    const ballGeom = new THREE.SphereGeometry(1, 8, 8);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    for (let i = 0; i < ballCount; i++) {
      const b = new THREE.Mesh(ballGeom, ballMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 20;
      b.position.set(
        (Math.random() - 0.5) * 50,
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
      balls.add(b);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 150);
    pointLight.position.set(40, 40, 40);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { speed, vibration } = dataRef.current;

      // Rotate Drum
      drum.rotation.x += speed * 0.001;
      drumWireMesh.rotation.x += speed * 0.001;

      // Vibration
      millGroup.position.y = Math.sin(time * 40) * (vibration * 0.1);

      // Animate Balls (Cascading effect)
      balls.children.forEach((b, i) => {
        const mesh = b as THREE.Mesh;
        const angle = time * speed * 0.1 + i;
        const radius = 18 + Math.sin(time + i) * 2;
        mesh.position.y = Math.cos(angle) * radius;
        mesh.position.z = Math.sin(angle) * radius;
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
