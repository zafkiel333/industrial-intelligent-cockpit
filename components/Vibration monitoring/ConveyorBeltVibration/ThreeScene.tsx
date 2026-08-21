import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    speed: 3.5,
    vibration: 1.2,
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
    camera.position.set(80, 50, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Conveyor Group
    const conveyorGroup = new THREE.Group();
    scene.add(conveyorGroup);

    // Drive Pulley
    const pulleyGeom = new THREE.CylinderGeometry(15, 15, 30, 64);
    const pulleyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const pulley = new THREE.Mesh(pulleyGeom, pulleyMat);
    pulley.rotation.z = Math.PI / 2;
    conveyorGroup.add(pulley);

    // Pulley Wireframe
    const pulleyWire = new THREE.WireframeGeometry(pulleyGeom);
    const pulleyWireMat = new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.3 });
    const pulleyWireMesh = new THREE.LineSegments(pulleyWire, pulleyWireMat);
    pulleyWireMesh.rotation.z = Math.PI / 2;
    conveyorGroup.add(pulleyWireMesh);

    // Belt (Holographic)
    const beltGeom = new THREE.BoxGeometry(120, 1, 30);
    const beltMat = new THREE.MeshStandardMaterial({ 
      color: 0xf97316, 
      transparent: true, 
      opacity: 0.1,
      emissive: 0xf97316,
      emissiveIntensity: 0.1
    });
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.position.set(60, 15, 0);
    conveyorGroup.add(belt);

    const beltWire = new THREE.WireframeGeometry(beltGeom);
    const beltWireMat = new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.2 });
    const beltWireMesh = new THREE.LineSegments(beltWire, beltWireMat);
    beltWireMesh.position.set(60, 15, 0);
    conveyorGroup.add(beltWireMesh);

    // Motor
    const motorGeom = new THREE.BoxGeometry(20, 20, 25);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const motor = new THREE.Mesh(motorGeom, motorMat);
    motor.position.set(0, 0, -30);
    conveyorGroup.add(motor);

    // Material on Belt
    const materialCount = 30;
    const materials = new THREE.Group();
    conveyorGroup.add(materials);
    const matGeom = new THREE.BoxGeometry(4, 4, 4);
    const matMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    for (let i = 0; i < materialCount; i++) {
      const m = new THREE.Mesh(matGeom, matMat);
      m.position.set(Math.random() * 100 + 10, 18, (Math.random() - 0.5) * 20);
      materials.add(m);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf97316, 2, 150);
    pointLight.position.set(40, 40, 40);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { speed, vibration } = dataRef.current;

      // Rotate Pulley
      pulley.rotation.x += speed * 0.02;
      pulleyWireMesh.rotation.x += speed * 0.02;

      // Vibration Effect
      conveyorGroup.position.y = Math.sin(time * 30) * (vibration * 0.1);

      // Move Materials
      materials.children.forEach((m) => {
        m.position.x += speed * 0.1;
        if (m.position.x > 110) {
          m.position.x = 10;
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
