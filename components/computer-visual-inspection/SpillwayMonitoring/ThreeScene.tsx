import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ErosionZone } from './three-types';

interface ThreeSceneProps {
  erosionZones: ErosionZone[];
  flowIntensity: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ erosionZones, flowIntensity }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ erosionZones, flowIntensity });

  useEffect(() => {
    propsRef.current = { erosionZones, flowIntensity };
  }, [erosionZones, flowIntensity]);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 1. Spillway Structure
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);

    const baseGeo = new THREE.BoxGeometry(20, 2, 10);
    const baseMat = new THREE.MeshPhongMaterial({ color: 0x1e293b });
    const base = new THREE.Mesh(baseGeo, baseMat);
    structureGroup.add(base);

    const slopeGeo = new THREE.BoxGeometry(20, 1, 15);
    const slope = new THREE.Mesh(slopeGeo, baseMat);
    slope.rotation.x = -Math.PI / 6;
    slope.position.set(0, 3, -5);
    structureGroup.add(slope);

    // 2. Water Flow (Particles)
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = 8 + Math.random() * 2;
      positions[i * 3 + 2] = -12;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 1] = -0.1 - Math.random() * 0.2;
      velocities[i * 3 + 2] = 0.2 + Math.random() * 0.3;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMaterial = new THREE.PointsMaterial({
      color: 0x0ea5e9,
      size: 0.1,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const flowSystem = new THREE.Points(particles, pMaterial);
    scene.add(flowSystem);

    // 3. Erosion Markers
    const erosionGroup = new THREE.Group();
    scene.add(erosionGroup);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0x0ea5e9, 50);
    spotLight.position.set(10, 20, 10);
    scene.add(spotLight);

    // 5. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { flowIntensity: currentFlow, erosionZones: currentZones } = propsRef.current;

      // Update flow
      const posAttr = particles.getAttribute('position');
      for (let i = 0; i < particleCount; i++) {
        const speedMult = 0.5 + currentFlow * 1.5;
        posAttr.setX(i, posAttr.getX(i) + velocities[i * 3] * speedMult);
        posAttr.setY(i, posAttr.getY(i) + velocities[i * 3 + 1] * speedMult);
        posAttr.setZ(i, posAttr.getZ(i) + velocities[i * 3 + 2] * speedMult);

        if (posAttr.getZ(i) > 5 || posAttr.getY(i) < 0) {
          posAttr.setX(i, (Math.random() - 0.5) * 18);
          posAttr.setY(i, 8 + Math.random() * 2);
          posAttr.setZ(i, -12);
        }
      }
      posAttr.needsUpdate = true;

      // Update erosion zones
      if (erosionGroup.children.length !== currentZones.length) {
        while(erosionGroup.children.length > 0) {
          erosionGroup.remove(erosionGroup.children[0]);
        }
        currentZones.forEach(zone => {
          const markerGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
          const markerMat = new THREE.MeshBasicMaterial({ 
            color: zone.severity === 'high' ? 0xef4444 : 0xf59e0b,
            transparent: true,
            opacity: 0.6
          });
          const marker = new THREE.Mesh(markerGeo, markerMat);
          marker.position.set(zone.position[0], zone.position[1], zone.position[2]);
          marker.rotation.x = -Math.PI / 6;
          erosionGroup.add(marker);
        });
      }

      erosionGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.scale.setScalar(1 + Math.sin(Date.now() * 0.01 + i) * 0.2);
        }
      });

      if (controlsRef.current) controlsRef.current.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
