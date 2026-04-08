import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ReeferState } from './three-types';

interface ThreeSceneProps {
  state: ReeferState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ReeferState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
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

    // Compressor Body
    const compGroup = new THREE.Group();
    scene.add(compGroup);

    const bodyGeo = new THREE.CylinderGeometry(2, 2, 4, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    compGroup.add(body);

    // Cylinder Head (Top part, removable)
    const headGroup = new THREE.Group();
    headGroup.position.set(2.5, 0, 0);
    compGroup.add(headGroup);

    const headGeo = new THREE.CylinderGeometry(1.8, 1.8, 1, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.rotation.z = Math.PI / 2;
    headGroup.add(head);

    // Valve Plate (Between body and head)
    const plateGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.2, 32);
    const plateMatNormal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const plateMatBroken = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.8 }); // Red/rough if broken
    const plate = new THREE.Mesh(plateGeo, plateMatNormal);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(1.9, 0, 0);
    compGroup.add(plate);

    // Pistons (Inside body, simplified)
    const pistonGeo = new THREE.CylinderGeometry(0.8, 0.8, 1, 16);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 });
    const piston1 = new THREE.Mesh(pistonGeo, pistonMat);
    piston1.rotation.z = Math.PI / 2;
    piston1.position.set(1, 0.8, 0);
    compGroup.add(piston1);
    
    const piston2 = new THREE.Mesh(pistonGeo, pistonMat);
    piston2.rotation.z = Math.PI / 2;
    piston2.position.set(1, -0.8, 0);
    compGroup.add(piston2);

    // Pipes
    const pipeGeo = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
    const pipeMatSuction = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue
    const pipeMatDischarge = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Red
    
    const suctionPipe = new THREE.Mesh(pipeGeo, pipeMatSuction);
    suctionPipe.position.set(-1, 2.5, 0);
    compGroup.add(suctionPipe);

    const dischargePipe = new THREE.Mesh(pipeGeo, pipeMatDischarge);
    dischargePipe.position.set(1, 2.5, 0);
    compGroup.add(dischargePipe);

    // Leak Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 50;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) {
        posArray[i] = (Math.random() - 0.5);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.1, color: 0xe0f2fe, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.position.set(1.9, 1, 0); // Near valve plate
    scene.add(particles);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;
      time += 0.1;

      // Animate pistons if running
      if (currentState.compressorRunning) {
        piston1.position.x = 1 + Math.sin(time) * 0.5;
        piston2.position.x = 1 + Math.sin(time + Math.PI) * 0.5;
        
        // Vibrate entire compressor slightly
        compGroup.position.y = Math.sin(time * 5) * 0.02;
        
        // If valve plate broken, vibrate erratically
        if (!currentState.valvePlateIntact) {
            compGroup.position.x = Math.sin(time * 7) * 0.05;
            compGroup.rotation.z = Math.sin(time * 3) * 0.01;
        } else {
            compGroup.position.x = 0;
            compGroup.rotation.z = 0;
        }
      } else {
        compGroup.position.y = 0;
        compGroup.position.x = 0;
        compGroup.rotation.z = 0;
      }

      // Update Valve Plate appearance
      plate.material = currentState.valvePlateIntact ? plateMatNormal : plateMatBroken;

      // Leak animation
      if (currentState.isLeaking) {
        particles.visible = true;
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for(let i=1; i<particleCount*3; i+=3) {
            positions[i] += 0.05; // Float up
            positions[i-1] += (Math.random() - 0.5) * 0.1; // Drift X
            if (positions[i] > 3) {
                positions[i] = 0; // Reset
                positions[i-1] = (Math.random() - 0.5);
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      } else {
        particles.visible = false;
      }

      // Slowly rotate scene
      scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;

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
