import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) containerRef.current.removeChild(existingCanvas);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.002);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(150, 100, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Dam Structure (Wireframe + Solid)
    const damGroup = new THREE.Group();
    scene.add(damGroup);

    const damGeom = new THREE.BoxGeometry(200, 100, 40);
    const damMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.4,
      metalness: 0.9,
      roughness: 0.1
    });
    const dam = new THREE.Mesh(damGeom, damMat);
    damGroup.add(dam);

    const damWire = new THREE.WireframeGeometry(damGeom);
    const damWireMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const damWireMesh = new THREE.LineSegments(damWire, damWireMat);
    damGroup.add(damWireMesh);

    // Gallery Tunnels (Glowing cylinders)
    const galleryGeom = new THREE.CylinderGeometry(2, 2, 200, 16);
    galleryGeom.rotateZ(Math.PI / 2);
    const galleryMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      emissive: 0x0ea5e9, 
      emissiveIntensity: 2 
    });
    
    for (let i = -2; i <= 2; i++) {
      const gallery = new THREE.Mesh(galleryGeom, galleryMat);
      gallery.position.y = i * 20;
      gallery.position.z = 0;
      damGroup.add(gallery);
    }

    // Seismic Events (Glowing spheres)
    const events: THREE.Mesh[] = [];
    const eventGeom = new THREE.SphereGeometry(2, 16, 16);
    const eventMat = new THREE.MeshStandardMaterial({ 
      color: 0xf43f5e, 
      emissive: 0xf43f5e, 
      emissiveIntensity: 5 
    });

    const createEvent = () => {
      const event = new THREE.Mesh(eventGeom, eventMat);
      event.position.set(
        (Math.random() - 0.5) * 180,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 30
      );
      event.scale.set(0.1, 0.1, 0.1);
      damGroup.add(event);
      events.push(event);

      // Pulse ring
      const ringGeom = new THREE.RingGeometry(1, 1.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(event.position);
      ring.lookAt(camera.position);
      damGroup.add(ring);

      return { event, ring, startTime: Date.now() };
    };

    let activeEvents: any[] = [];

    // Grid Floor
    const grid = new THREE.GridHelper(1000, 50, 0x1e293b, 0x0f172a);
    grid.position.y = -60;
    scene.add(grid);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x0ea5e9, 2);
    spotLight.position.set(100, 200, 100);
    scene.add(spotLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (Math.random() > 0.98) {
        activeEvents.push(createEvent());
      }

      activeEvents = activeEvents.filter(item => {
        const elapsed = Date.now() - item.startTime;
        if (elapsed > 2000) {
          damGroup.remove(item.event);
          damGroup.remove(item.ring);
          return false;
        }
        const scale = (elapsed / 2000) * 10;
        item.event.scale.set(1 - elapsed/2000, 1 - elapsed/2000, 1 - elapsed/2000);
        item.ring.scale.set(scale, scale, scale);
        item.ring.material.opacity = 1 - elapsed/2000;
        item.ring.lookAt(camera.position);
        return true;
      });

      damGroup.rotation.y = Math.sin(time * 0.2) * 0.1;
      
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
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
