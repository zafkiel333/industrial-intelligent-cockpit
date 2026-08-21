import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    impactEnergy: 50,
    vibration: 2.5,
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
    camera.position.set(60, 50, 80);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Crusher Group
    const crusherGroup = new THREE.Group();
    scene.add(crusherGroup);

    // Main Chamber
    const chamberGeom = new THREE.CylinderGeometry(20, 25, 40, 32, 1, true);
    const chamberMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    });
    const chamber = new THREE.Mesh(chamberGeom, chamberMat);
    crusherGroup.add(chamber);

    const chamberWire = new THREE.WireframeGeometry(chamberGeom);
    const chamberWireMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.3 });
    const chamberWireMesh = new THREE.LineSegments(chamberWire, chamberWireMat);
    crusherGroup.add(chamberWireMesh);

    // Rotor
    const rotorGeom = new THREE.CylinderGeometry(5, 5, 35, 16);
    const rotorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
    const rotor = new THREE.Mesh(rotorGeom, rotorMat);
    crusherGroup.add(rotor);

    // Material Particles (Falling)
    const particles = new THREE.Group();
    scene.add(particles);
    const pGeom = new THREE.DodecahedronGeometry(1);
    const pMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    for (let i = 0; i < 20; i++) {
      const p = new THREE.Mesh(pGeom, pMat);
      p.position.set(
        (Math.random() - 0.5) * 10,
        30 + Math.random() * 50,
        (Math.random() - 0.5) * 10
      );
      particles.add(p);
    }

    // Impact Flash
    const flashGeom = new THREE.SphereGeometry(10, 16, 16);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0 });
    const flash = new THREE.Mesh(flashGeom, flashMat);
    flash.position.y = -10;
    scene.add(flash);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf43f5e, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { impactEnergy, vibration } = dataRef.current;

      // Rotate Rotor
      rotor.rotation.y += 0.1;

      // Vibration
      crusherGroup.position.x = Math.sin(time * 50) * (vibration * 0.05);
      crusherGroup.position.z = Math.cos(time * 50) * (vibration * 0.05);

      // Particles Falling
      particles.children.forEach((p) => {
        p.position.y -= 1;
        if (p.position.y < -10) {
          p.position.y = 30 + Math.random() * 50;
          // Trigger Flash on impact
          flashMat.opacity = 0.5;
        }
      });

      if (flashMat.opacity > 0) {
        flashMat.opacity -= 0.05;
        flash.scale.setScalar(1 + flashMat.opacity * 2);
      }

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
