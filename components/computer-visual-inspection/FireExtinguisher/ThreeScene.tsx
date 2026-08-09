import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ExtinguisherStatus } from './three-types';

interface ThreeSceneProps {
  status: ExtinguisherStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statusRef = useRef<ExtinguisherStatus>(status);

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

    const directionalLight = new THREE.DirectionalLight(0xff0000, 1.2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // Fire Extinguisher Model
    const extinguisherGroup = new THREE.Group();
    scene.add(extinguisherGroup);

    // Body
    const bodyGeom = new THREE.CylinderGeometry(2, 2, 8, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0xef4444, 
      metalness: 0.7, 
      roughness: 0.2,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    extinguisherGroup.add(body);

    // Top Cap
    const capGeom = new THREE.SphereGeometry(2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const cap = new THREE.Mesh(capGeom, capMat);
    cap.position.y = 4;
    extinguisherGroup.add(cap);

    // Handle
    const handleGeom = new THREE.BoxGeometry(0.5, 2, 3);
    const handle = new THREE.Mesh(handleGeom, capMat);
    handle.position.set(0, 5.5, 1);
    handle.rotation.x = Math.PI / 4;
    extinguisherGroup.add(handle);

    // Pressure Gauge
    const gaugeGroup = new THREE.Group();
    gaugeGroup.position.set(0, 4.5, 1.8);
    extinguisherGroup.add(gaugeGroup);

    const gaugeGeom = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
    const gaugeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const gauge = new THREE.Mesh(gaugeGeom, gaugeMat);
    gauge.rotation.x = Math.PI / 2;
    gaugeGroup.add(gauge);

    // Gauge Needle
    const needleGeom = new THREE.BoxGeometry(0.05, 0.6, 0.05);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const needle = new THREE.Mesh(needleGeom, needleMat);
    needle.position.z = 0.15;
    gaugeGroup.add(needle);

    // Gauge Face (Green/Red zones)
    const faceGeom = new THREE.CircleGeometry(0.7, 32);
    const faceMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });
    const face = new THREE.Mesh(faceGeom, faceMat);
    face.position.z = 0.11;
    gaugeGroup.add(face);

    // Corrosion Spots
    const corrosionGroup = new THREE.Group();
    scene.add(corrosionGroup);
    for (let i = 0; i < 15; i++) {
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 7;
      const cGeom = new THREE.SphereGeometry(Math.random() * 0.2 + 0.1, 8, 8);
      const cMat = new THREE.MeshStandardMaterial({ color: 0x78350f, transparent: true, opacity: 0 });
      const c = new THREE.Mesh(cGeom, cMat);
      c.position.set(2.05 * Math.cos(theta), y, 2.05 * Math.sin(theta));
      corrosionGroup.add(c);
    }

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0xef4444, 0x1e293b);
    grid.position.y = -4.5;
    scene.add(grid);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const s = statusRef.current;

      // Needle rotation based on pressure (0-2 MPa)
      // Normal range 1.2-1.5 is center-ish
      const targetRotation = (s.pressure / 2) * Math.PI - Math.PI / 2;
      needle.rotation.z = THREE.MathUtils.lerp(needle.rotation.z, -targetRotation, 0.1);

      // Corrosion visual
      corrosionGroup.children.forEach((c: any) => {
        c.material.opacity = s.corrosionLevel * 0.8;
      });

      // Pulse if expired or low pressure
      if (s.isExpired || s.pressure < 1.0) {
        bodyMat.emissiveIntensity = 0.2 + Math.sin(time * 10) * 0.3;
        bodyMat.color.setHex(0xef4444);
      } else {
        bodyMat.emissiveIntensity = 0.2;
        bodyMat.color.setHex(0xef4444);
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
