import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LeakageState } from './three-types';

interface ThreeSceneProps {
  state: LeakageState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<LeakageState>(state);

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
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Penstock (Main Pipe)
    const pipeGeo = new THREE.CylinderGeometry(3, 3, 20, 32);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    scene.add(pipe);

    // Expansion Joint (Flanges)
    const flangeGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.5, 32);
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    
    const flangeLeft = new THREE.Mesh(flangeGeo, flangeMat);
    flangeLeft.rotation.z = Math.PI / 2;
    flangeLeft.position.x = -0.5;
    scene.add(flangeLeft);

    const flangeRight = new THREE.Mesh(flangeGeo, flangeMat);
    flangeRight.rotation.z = Math.PI / 2;
    flangeRight.position.x = 0.5;
    scene.add(flangeRight);

    // Repair Clamp (Appears as progress increases)
    const clampGeo = new THREE.CylinderGeometry(3.6, 3.6, 1.5, 32, 1, true, 0, Math.PI);
    const clampMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1, side: THREE.DoubleSide });
    const clamp = new THREE.Mesh(clampGeo, clampMat);
    clamp.rotation.z = Math.PI / 2;
    clamp.position.y = 0; // Top half
    clamp.visible = false;
    scene.add(clamp);

    // Water Leak Particles
    const leakGeo = new THREE.BufferGeometry();
    const leakCount = 1000;
    const leakPos = new Float32Array(leakCount * 3);
    const leakVel = [];
    for(let i=0; i<leakCount; i++) {
      leakPos[i*3] = (Math.random() - 0.5) * 0.5; // Between flanges
      leakPos[i*3+1] = 3; // Top of pipe
      leakPos[i*3+2] = (Math.random() - 0.5) * 2;
      leakVel.push({
        x: (Math.random() - 0.5) * 0.2,
        y: Math.random() * 0.5 + 0.2, // Shoot up
        z: (Math.random() - 0.5) * 0.2
      });
    }
    leakGeo.setAttribute('position', new THREE.BufferAttribute(leakPos, 3));
    const leakMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.1, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const leak = new THREE.Points(leakGeo, leakMat);
    scene.add(leak);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotate scene slightly
      scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;

      // Update Clamp visibility based on progress
      if (currentState.repairProgress > 0) {
        clamp.visible = true;
        // Scale clamp to wrap around
        const wrapAngle = Math.PI * (currentState.repairProgress / 100);
        clamp.geometry.dispose();
        clamp.geometry = new THREE.CylinderGeometry(3.6, 3.6, 1.5, 32, 1, true, Math.PI/2 - wrapAngle/2, wrapAngle);
      } else {
        clamp.visible = false;
      }

      // Water leak animation
      if (currentState.leakRate > 0) {
        leak.visible = true;
        const positions = leakGeo.attributes.position.array as Float32Array;
        const activeParticles = Math.floor((currentState.leakRate / 100) * leakCount);
        
        for(let i=0; i<leakCount; i++) {
          if (i < activeParticles) {
            positions[i*3] += leakVel[i].x;
            positions[i*3+1] += leakVel[i].y;
            positions[i*3+2] += leakVel[i].z;
            leakVel[i].y -= 0.02; // Gravity

            // Reset particle if it falls below pipe
            if (positions[i*3+1] < -5 || Math.random() < 0.02) {
              positions[i*3] = (Math.random() - 0.5) * 0.5;
              positions[i*3+1] = 3.2; // Start just above flange
              positions[i*3+2] = (Math.random() - 0.5) * 2;
              leakVel[i].y = Math.random() * 0.5 + 0.2 * (currentState.pressure / 10); // Pressure affects height
            }
          } else {
            // Hide inactive particles
            positions[i*3+1] = -100; 
          }
        }
        leakGeo.attributes.position.needsUpdate = true;
      } else {
        leak.visible = false;
      }

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
