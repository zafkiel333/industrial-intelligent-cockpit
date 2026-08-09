import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FunnelState } from './three-types';

interface ThreeSceneProps {
  state?: FunnelState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<FunnelState>(state || {
    vibrationIntensity: 0.15,
    materialLevel: 65,
    impactForce: 120,
    gateOpening: 45,
    vibrationFrequency: 30
  });

  useEffect(() => {
    if (state) stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 12, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(5, 15, 5);
    scene.add(directionalLight);

    // Funnel Model
    const funnelGroup = new THREE.Group();
    scene.add(funnelGroup);

    // 1. Main Funnel Body (Multi-segment for detail)
    const bodyGroup = new THREE.Group();
    funnelGroup.add(bodyGroup);

    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      metalness: 0.7,
      roughness: 0.3
    });

    // Upper Cylindrical Part
    const upperGeom = new THREE.CylinderGeometry(4, 4, 2, 32, 1, true);
    const upper = new THREE.Mesh(upperGeom, bodyMat);
    upper.position.y = 8;
    bodyGroup.add(upper);

    // Middle Conical Part
    const middleGeom = new THREE.CylinderGeometry(4, 1.2, 5, 32, 1, true);
    const middle = new THREE.Mesh(middleGeom, bodyMat);
    middle.position.y = 4.5;
    bodyGroup.add(middle);

    // Lower Discharge Part
    const lowerGeom = new THREE.CylinderGeometry(1.2, 1.2, 1.5, 32, 1, true);
    const lower = new THREE.Mesh(lowerGeom, bodyMat);
    lower.position.y = 1.25;
    bodyGroup.add(lower);

    // 2. Support Structure (Detailed frame)
    const frameGroup = new THREE.Group();
    funnelGroup.add(frameGroup);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const legPositions = [[3.5, 4.5, 3.5], [-3.5, 4.5, 3.5], [3.5, 4.5, -3.5], [-3.5, 4.5, -3.5]];
    
    legPositions.forEach(pos => {
      // Main Leg
      const legGeom = new THREE.BoxGeometry(0.4, 9, 0.4);
      const leg = new THREE.Mesh(legGeom, frameMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      frameGroup.add(leg);

      // Bracing
      const braceGeom = new THREE.CylinderGeometry(0.1, 0.1, 5);
      const brace = new THREE.Mesh(braceGeom, frameMat);
      brace.position.set(pos[0] * 0.5, 4.5, pos[2] * 0.5);
      brace.rotation.z = Math.PI / 4 * (pos[0] > 0 ? 1 : -1);
      frameGroup.add(brace);
    });

    // 3. Vibrator Unit
    const vibratorGroup = new THREE.Group();
    vibratorGroup.position.set(2.8, 5, 0);
    bodyGroup.add(vibratorGroup);

    const vibBodyGeom = new THREE.BoxGeometry(0.8, 1.2, 0.8);
    const vibBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const vibBody = new THREE.Mesh(vibBodyGeom, vibBodyMat);
    vibratorGroup.add(vibBody);

    const vibHeadGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.6);
    const vibHeadMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.5 });
    const vibHead = new THREE.Mesh(vibHeadGeom, vibHeadMat);
    vibHead.rotation.z = Math.PI / 2;
    vibHead.position.x = 0.4;
    vibratorGroup.add(vibHead);

    // 4. Discharge Gate
    const gateGeom = new THREE.BoxGeometry(2.5, 0.2, 2.5);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const gate = new THREE.Mesh(gateGeom, gateMat);
    gate.position.y = 0.5;
    funnelGroup.add(gate);

    // 5. Material Particles
    const particleCount = 60;
    const particles: THREE.Mesh[] = [];
    const particleGeom = new THREE.SphereGeometry(0.12, 8, 8);
    const particleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.4 });

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeom, particleMat);
      particle.position.set(
        (Math.random() - 0.5) * 6,
        7 + Math.random() * 2,
        (Math.random() - 0.5) * 6
      );
      funnelGroup.add(particle);
      particles.push(particle);
    }

    const grid = new THREE.GridHelper(30, 20, 0x00ffff, 0x1e293b);
    scene.add(grid);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const { vibrationIntensity, vibrationFrequency, gateOpening } = stateRef.current;
      const time = Date.now() * 0.001;

      // Vibration effect
      const vib = Math.sin(time * vibrationFrequency) * (vibrationIntensity * 0.06);
      bodyGroup.position.x = vib;
      bodyGroup.position.z = vib;
      vibHead.rotation.x += vibrationFrequency * 0.1;

      // Gate Opening
      gate.position.x = (gateOpening / 100) * 2.5;

      // Particle Flow
      particles.forEach((p, i) => {
        // Gravity
        p.position.y -= 0.05 + Math.random() * 0.05;
        
        // Funnel Constraint
        const pRadius = Math.sqrt(p.position.x * p.position.x + p.position.z * p.position.z);
        const funnelRadiusAtY = p.position.y > 7 ? 4 : (p.position.y < 2 ? 1.2 : 1.2 + (p.position.y - 2) * (2.8 / 5));
        
        if (pRadius > funnelRadiusAtY - 0.2) {
          const angle = Math.atan2(p.position.z, p.position.x);
          p.position.x = Math.cos(angle) * (funnelRadiusAtY - 0.2);
          p.position.z = Math.sin(angle) * (funnelRadiusAtY - 0.2);
        }

        // Reset particles
        if (p.position.y < 0.5) {
          if (Math.random() * 100 < gateOpening) {
            // Pass through gate
            if (p.position.y < -2) {
              p.position.set((Math.random() - 0.5) * 6, 9, (Math.random() - 0.5) * 6);
            }
          } else {
            // Blocked by gate
            p.position.y = 0.6;
            p.position.x += (Math.random() - 0.5) * 0.1;
            p.position.z += (Math.random() - 0.5) * 0.1;
          }
        }
      });

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
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
