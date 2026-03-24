import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GateBladeProps } from './three-types';

export const ThreeScene: React.FC<GateBladeProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0e17');
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Gate Blade Model
    const gateGroup = new THREE.Group();
    
    // Main blade
    const bladeGeo = new THREE.BoxGeometry(15, 20, 1);
    const bladeMat = new THREE.MeshStandardMaterial({ 
      color: 0x8899aa, 
      metalness: 0.7, 
      roughness: 0.3 
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    gateGroup.add(blade);

    // Support beams
    const beamGeo = new THREE.BoxGeometry(16, 1, 2);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x667788, metalness: 0.8 });
    for(let i = 0; i < 4; i++) {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = -8 + i * 5.3;
      beam.position.z = 0.5;
      gateGroup.add(beam);
    }

    // Stress heatmap overlay
    const heatmapGeo = new THREE.BoxGeometry(15.1, 20.1, 1.1);
    const heatmapMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const heatmap = new THREE.Mesh(heatmapGeo, heatmapMat);
    gateGroup.add(heatmap);

    scene.add(gateGroup);

    // Water flow particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 30;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.3,
      color: 0x00aaff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.position.z = 5;
    scene.add(particles);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      const { waterPressure, vibrationLevel, isAlert } = propsRef.current;

      // Vibration effect
      if (vibrationLevel > 5) {
        gateGroup.position.x = Math.sin(time * 20) * (vibrationLevel * 0.01);
        gateGroup.position.z = Math.cos(time * 25) * (vibrationLevel * 0.01);
      } else {
        gateGroup.position.x = 0;
        gateGroup.position.z = 0;
      }

      // Heatmap opacity based on pressure
      heatmapMat.opacity = (waterPressure / 100) * 0.6;
      if (isAlert) {
        heatmapMat.color.setHex(0xff0000);
      } else {
        heatmapMat.color.setHex(0x00ff00);
      }

      // Water flow animation
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for(let i = 1; i < particleCount * 3; i += 3) {
        pPositions[i] -= 0.2 + (waterPressure / 100) * 0.3;
        if (pPositions[i] < -15) {
          pPositions[i] = 15;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

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
