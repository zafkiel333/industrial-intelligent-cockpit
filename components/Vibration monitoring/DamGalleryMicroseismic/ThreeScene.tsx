import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dataRef = useRef({
    vibration: 0.2,
    events: [] as { pos: THREE.Vector3; scale: number; opacity: number }[],
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
    scene.background = new THREE.Color(0x020617); // Deep navy, not pure black
    scene.fog = new THREE.FogExp2(0x020617, 0.005);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(100, 80, 150);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Dam Structure (Holographic/Wireframe)
    const damGroup = new THREE.Group();
    scene.add(damGroup);

    // Main Dam Body
    const damGeom = new THREE.BoxGeometry(150, 80, 40);
    const damMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.1,
      wireframe: false,
      side: THREE.DoubleSide,
    });
    const damMesh = new THREE.Mesh(damGeom, damMat);
    damGroup.add(damMesh);

    // Dam Wireframe
    const damWireGeom = new THREE.WireframeGeometry(damGeom);
    const damWireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const damWire = new THREE.LineSegments(damWireGeom, damWireMat);
    damGroup.add(damWire);

    // Gallery (The tunnel inside the dam)
    const galleryGeom = new THREE.BoxGeometry(140, 5, 5);
    const galleryMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.5 });
    const gallery = new THREE.Mesh(galleryGeom, galleryMat);
    gallery.position.y = -10;
    damGroup.add(gallery);

    // Sensors along the gallery
    const sensorGeom = new THREE.SphereGeometry(1, 16, 16);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 1 });
    const sensors: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i++) {
      const sensor = new THREE.Mesh(sensorGeom, sensorMat);
      sensor.position.set(-60 + i * 13, -10, 0);
      damGroup.add(sensor);
      sensors.push(sensor);
    }

    // Seismic Event Visualizer
    const eventGroup = new THREE.Group();
    scene.add(eventGroup);

    const createEvent = (pos: THREE.Vector3) => {
      const ringGeom = new THREE.TorusGeometry(1, 0.1, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 1 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      ring.lookAt(camera.position);
      eventGroup.add(ring);
      return ring;
    };

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    scene.add(directionalLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Subtle vibration of the dam
      damGroup.position.y = Math.sin(time * 2) * 0.1;

      // Pulse sensors
      sensors.forEach((s, i) => {
        s.scale.setScalar(1 + Math.sin(time * 5 + i) * 0.2);
      });

      // Handle seismic events
      if (Math.random() > 0.98) {
        const randomPos = new THREE.Vector3(
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 30
        );
        const ring = createEvent(randomPos);
        dataRef.current.events.push({ pos: randomPos, scale: 1, opacity: 1 });
        
        // Simple cleanup for the mesh
        setTimeout(() => {
          eventGroup.remove(ring);
        }, 2000);
      }

      eventGroup.children.forEach((child) => {
        const ring = child as THREE.Mesh;
        ring.scale.addScalar(0.5);
        (ring.material as THREE.MeshBasicMaterial).opacity -= 0.01;
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
