import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { WaterQualitySamplingProps } from './three-types';

export const ThreeScene: React.FC<WaterQualitySamplingProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#082f49'); // sky-900
    scene.fog = new THREE.FogExp2('#082f49', 0.02);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.2; // Allow looking slightly below water

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Water Surface
    const waterGeo = new THREE.PlaneGeometry(100, 100, 50, 50);
    const waterMat = new THREE.MeshStandardMaterial({ 
      color: 0x0284c7, // sky-600
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.8,
      side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Sampling Buoy/Station
    const stationGroup = new THREE.Group();
    
    // Base float
    const baseGeo = new THREE.CylinderGeometry(3, 3, 1, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // amber-500
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0;
    stationGroup.add(base);

    // Tower
    const towerGeo = new THREE.CylinderGeometry(0.5, 0.5, 6, 16);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5 }); // slate-200
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 3.5;
    stationGroup.add(tower);

    // Solar Panel
    const panelGeo = new THREE.BoxGeometry(4, 0.1, 2);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8 }); // blue-900
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.y = 6.5;
    panel.rotation.x = Math.PI / 6;
    stationGroup.add(panel);

    // Sensor Probe (Underwater)
    const probeGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 16);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.position.y = -4;
    stationGroup.add(probe);

    // Sensor Tip (Glowing)
    const tipGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // sky-400
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = -8;
    stationGroup.add(tip);

    // Data transmission rings
    const ringGeo = new THREE.TorusGeometry(1, 0.05, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0 });
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat.clone());
      ring.rotation.x = Math.PI / 2;
      stationGroup.add(ring);
      rings.push(ring);
    }

    scene.add(stationGroup);

    // Particles (Turbidity/Dissolved Oxygen visualization)
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 20;
      particlePos[i + 1] = -Math.random() * 10; // Underwater
      particlePos[i + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.5
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { phValue, turbidity, dissolvedOxygen, isAlert } = propsRef.current;

      // Bobbing motion for the buoy
      stationGroup.position.y = Math.sin(time * 2) * 0.2;
      stationGroup.rotation.z = Math.sin(time * 1.5) * 0.05;
      stationGroup.rotation.x = Math.cos(time * 1.2) * 0.05;

      // Water surface animation (simple vertex displacement)
      const positions = waterGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = Math.sin(x * 0.5 + time) * 0.5 + Math.cos(y * 0.5 + time) * 0.5;
      }
      waterGeo.attributes.position.needsUpdate = true;

      // Transmission rings animation
      rings.forEach((ring, index) => {
        const offsetTime = time + index * 0.5;
        ring.position.y = 6.5 + (offsetTime % 2) * 2;
        const scale = 1 + (offsetTime % 2);
        ring.scale.setScalar(scale);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (offsetTime % 2));
      });

      // Particle animation based on turbidity and DO
      particleMat.opacity = turbidity / 100; // More turbid = more visible particles
      // Color based on DO (higher DO = whiter/bluer, lower = greener/browner)
      const doRatio = dissolvedOxygen / 10;
      particleMat.color.setHSL(0.5 + (doRatio * 0.1), 0.8, 0.2 + (doRatio * 0.6));

      // Water color based on pH and turbidity
      if (phValue < 6.5) {
        waterMat.color.setHex(0x0369a1); // More acidic (darker blue)
      } else if (phValue > 8.5) {
        waterMat.color.setHex(0x0d9488); // More alkaline (teal)
      } else {
        waterMat.color.setHex(0x0284c7); // Normal (sky blue)
      }
      
      // Alert visualization
      if (isAlert) {
        tipMat.color.setHex(0xef4444); // red-500
        rings.forEach(r => (r.material as THREE.MeshBasicMaterial).color.setHex(0xef4444));
      } else {
        tipMat.color.setHex(0x38bdf8); // sky-400
        rings.forEach(r => (r.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8));
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
