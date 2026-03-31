import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    speed: 10,
    vibration: 1.5,
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
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.005);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(60, 50, 80);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Conical Crusher Group
    const crusherGroup = new THREE.Group();
    scene.add(crusherGroup);

    // Outer Cone (Casing)
    const outerGeom = new THREE.CylinderGeometry(15, 25, 40, 32, 1, true);
    const outerMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    });
    const outer = new THREE.Mesh(outerGeom, outerMat);
    crusherGroup.add(outer);

    const outerWire = new THREE.WireframeGeometry(outerGeom);
    const outerWireMat = new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.3 });
    const outerWireMesh = new THREE.LineSegments(outerWire, outerWireMat);
    crusherGroup.add(outerWireMesh);

    // Inner Cone (Mantel)
    const innerGroup = new THREE.Group();
    crusherGroup.add(innerGroup);
    const innerGeom = new THREE.CylinderGeometry(5, 15, 35, 32);
    const innerMat = new THREE.MeshStandardMaterial({ 
      color: 0xfacc15, 
      metalness: 0.8, 
      roughness: 0.2,
      emissive: 0xfacc15,
      emissiveIntensity: 0.1
    });
    const inner = new THREE.Mesh(innerGeom, innerMat);
    innerGroup.add(inner);

    // Main Shaft
    const shaftGeom = new THREE.CylinderGeometry(2, 2, 60, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    innerGroup.add(shaft);

    // Material Particles
    const particles = new THREE.Group();
    scene.add(particles);
    const pGeom = new THREE.DodecahedronGeometry(0.8);
    const pMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    for (let i = 0; i < 40; i++) {
      const p = new THREE.Mesh(pGeom, pMat);
      p.position.set(
        (Math.random() - 0.5) * 20,
        20 + Math.random() * 40,
        (Math.random() - 0.5) * 20
      );
      particles.add(p);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xfacc15, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const { speed, vibration } = dataRef.current;

      // Eccentric Motion
      const eccentricRadius = 2;
      innerGroup.position.x = Math.sin(time * speed) * eccentricRadius;
      innerGroup.position.z = Math.cos(time * speed) * eccentricRadius;
      innerGroup.rotation.z = Math.sin(time * speed) * 0.1;

      // Vibration
      crusherGroup.position.y = Math.sin(time * 40) * (vibration * 0.05);

      // Particles Falling
      particles.children.forEach((p) => {
        p.position.y -= 0.8;
        if (p.position.y < -20) {
          p.position.y = 20 + Math.random() * 40;
          p.position.x = (Math.random() - 0.5) * 15;
          p.position.z = (Math.random() - 0.5) * 15;
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
