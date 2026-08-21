import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MagnetronState } from './three-types';

interface ThreeSceneProps {
  state: MagnetronState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<MagnetronState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Radar Scanner Base Unit
    const baseGeo = new THREE.BoxGeometry(6, 2, 4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1;
    scene.add(base);

    // Waveguide
    const waveguideGeo = new THREE.BoxGeometry(1, 0.5, 3);
    const waveguideMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 }); // Brass color
    const waveguide = new THREE.Mesh(waveguideGeo, waveguideMat);
    waveguide.position.set(0, 0.25, -0.5);
    scene.add(waveguide);

    // Magnetron Assembly
    const magnetronGroup = new THREE.Group();
    magnetronGroup.position.set(0, 1, 0);
    
    // Magnetron Body
    const magBodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16);
    const magBodyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7 }); // Reddish casing
    const magBody = new THREE.Mesh(magBodyGeo, magBodyMat);
    magnetronGroup.add(magBody);

    // Magnetron Magnets (Sides)
    const magnetGeo = new THREE.BoxGeometry(2, 1, 1);
    const magnetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const magnet = new THREE.Mesh(magnetGeo, magnetMat);
    magnetronGroup.add(magnet);

    // Probe (inserts into waveguide)
    const probeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 1 });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.position.y = -1;
    magnetronGroup.add(probe);

    scene.add(magnetronGroup);

    // High Voltage Capacitor
    const capGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(2, 0.75, 0);
    scene.add(cap);

    // Microwave Radiation Particles (Visual effect)
    const waveGeo = new THREE.BufferGeometry();
    const waveCount = 100;
    const wavePos = new Float32Array(waveCount * 3);
    for (let i = 0; i < waveCount * 3; i++) {
      wavePos[i] = 0;
      wavePos[i + 1] = 0.25; // Inside waveguide
      wavePos[i + 2] = -0.5 - Math.random() * 2;
    }
    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePos, 3));
    const waveMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.15, transparent: true, opacity: 0.8 });
    const waveParticles = new THREE.Points(waveGeo, waveMat);
    scene.add(waveParticles);

    // Discharge Tool (Screwdriver)
    const toolGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 16);
    const toolMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const tool = new THREE.Mesh(toolGeo, toolMat);
    tool.position.set(2, 2.5, 0);
    tool.rotation.z = Math.PI / 4;
    tool.visible = false;
    scene.add(tool);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Transmission animation
      if (currentState.isTransmitting && currentState.step === 0) {
        waveParticles.visible = true;
        const positions = waveGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < waveCount; i++) {
          positions[i * 3 + 2] -= 0.2; // Move along waveguide
          if (positions[i * 3 + 2] < -3) {
            positions[i * 3 + 2] = -0.5;
            positions[i * 3] = (Math.random() - 0.5) * 0.5;
          }
        }
        waveGeo.attributes.position.needsUpdate = true;
        magBodyMat.emissive.setHex(0xef4444);
        magBodyMat.emissiveIntensity = 0.5;
      } else {
        waveParticles.visible = false;
        magBodyMat.emissiveIntensity = 0;
      }

      // Step animations
      if (currentState.step === 0) {
        // Normal
        magnetronGroup.position.y = 1;
        tool.visible = false;
      } else if (currentState.step === 1) {
        // Discharge
        magnetronGroup.position.y = 1;
        tool.visible = true;
        // Tool touches capacitor
        tool.position.y = THREE.MathUtils.lerp(tool.position.y, 1.5, 0.1);
      } else if (currentState.step === 2) {
        // Remove old
        tool.visible = false;
        magnetronGroup.position.y = THREE.MathUtils.lerp(magnetronGroup.position.y, 4, 0.05);
        magnetronGroup.position.x = THREE.MathUtils.lerp(magnetronGroup.position.x, -4, 0.05); // Move away
      } else if (currentState.step === 3) {
        // Install new
        tool.visible = false;
        // Bring new magnetron in
        magnetronGroup.position.x = THREE.MathUtils.lerp(magnetronGroup.position.x, 0, 0.05);
        if (Math.abs(magnetronGroup.position.x) < 0.1) {
          magnetronGroup.position.y = THREE.MathUtils.lerp(magnetronGroup.position.y, 1, 0.05); // Lower into place
        }
      } else if (currentState.step === 4) {
        // Warm-up
        magnetronGroup.position.y = 1;
        magnetronGroup.position.x = 0;
        // Pulsing glow for warm-up
        magBodyMat.emissive.setHex(0xfacc15); // Yellow glow
        magBodyMat.emissiveIntensity = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
      }

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
