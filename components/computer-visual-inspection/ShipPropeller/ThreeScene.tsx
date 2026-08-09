import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PropellerState } from './three-types';

interface ThreeSceneProps {
  state: PropellerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Propeller Group
    const propellerGroup = new THREE.Group();
    
    // Hub
    const hubGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const hubMaterial = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.rotation.x = Math.PI / 2;
    propellerGroup.add(hub);

    // Blades
    const bladeGeometry = new THREE.BoxGeometry(0.1, 3, 1);
    const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b });
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      blade.position.y = 1.5 * Math.cos((i * Math.PI) / 2);
      blade.position.x = 1.5 * Math.sin((i * Math.PI) / 2);
      blade.rotation.z = (i * Math.PI) / 2;
      blade.rotation.y = 0.5; // Pitch
      propellerGroup.add(blade);
    }

    scene.add(propellerGroup);

    // Cavitation Particles
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = -Math.random() * 5;
      velocities[i * 3 + 2] = -0.1 - Math.random() * 0.2;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Damage Markers
    const damageMarkers: THREE.Mesh[] = [];
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const updateMarkers = () => {
      damageMarkers.forEach(m => scene.remove(m));
      damageMarkers.length = 0;
      
      stateRef.current.damagePoints.forEach(p => {
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(p.x, p.y, p.z);
        scene.add(marker);
        damageMarkers.push(marker);
      });
    };

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const { rotationSpeed, cavitationIntensity } = stateRef.current;
      
      // Rotate propeller
      propellerGroup.rotation.z += rotationSpeed * 0.1;

      // Update particles
      const posAttr = particles.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.setZ(i, posAttr.getZ(i) + velocities[i * 3 + 2] * (1 + cavitationIntensity));
        if (posAttr.getZ(i) < -5) {
          posAttr.setZ(i, 0);
          posAttr.setX(i, (Math.random() - 0.5) * 2);
          posAttr.setY(i, (Math.random() - 0.5) * 2);
        }
      }
      posAttr.needsUpdate = true;
      particleMaterial.opacity = cavitationIntensity * 0.5;

      // Pulse damage markers
      const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
      markerMaterial.opacity = 0.5 + pulse * 0.5;
      markerMaterial.transparent = true;

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
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
