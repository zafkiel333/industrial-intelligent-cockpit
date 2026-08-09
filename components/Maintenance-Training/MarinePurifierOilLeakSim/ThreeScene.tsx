import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PurifierState } from './three-types';

interface ThreeSceneProps {
  state: PurifierState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<PurifierState>(state);

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

    // Purifier Casing (Transparent)
    const casingGeo = new THREE.CylinderGeometry(3, 3, 4, 32, 1, true);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    scene.add(casing);

    // Rotating Bowl
    const bowlGroup = new THREE.Group();
    
    // Bowl body
    const bowlGeo = new THREE.CylinderGeometry(2.5, 1.5, 2, 32);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowlGroup.add(bowl);

    // Disc stack (visual representation)
    const discGeo = new THREE.ConeGeometry(2.2, 1.5, 32);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, wireframe: true });
    const discs = new THREE.Mesh(discGeo, discMat);
    discs.position.y = 0.5;
    bowlGroup.add(discs);

    scene.add(bowlGroup);

    // Water Seal Ring (Blue)
    const sealGeo = new THREE.TorusGeometry(2.3, 0.1, 16, 64);
    const sealMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.8 });
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.position.y = 1.2;
    seal.rotation.x = Math.PI / 2;
    scene.add(seal);

    // Sludge Port (Where oil leaks if seal breaks)
    const portGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    const portMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const port = new THREE.Mesh(portGeo, portMat);
    port.position.set(3, -1, 0);
    port.rotation.z = Math.PI / 2;
    scene.add(port);

    // Oil Leak Particles
    const leakGeo = new THREE.BufferGeometry();
    const leakCount = 100;
    const leakPos = new Float32Array(leakCount * 3);
    for (let i = 0; i < leakCount * 3; i++) {
      leakPos[i] = 3.5; // Start at port
      leakPos[i + 1] = -1;
      leakPos[i + 2] = 0;
    }
    leakGeo.setAttribute('position', new THREE.BufferAttribute(leakPos, 3));
    const leakMat = new THREE.PointsMaterial({ color: 0xeab308, size: 0.15, transparent: true, opacity: 0.8 }); // Yellow oil
    const leakParticles = new THREE.Points(leakGeo, leakMat);
    scene.add(leakParticles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Bowl Rotation
      // 10000 RPM is too fast for visual, scale it down
      const speed = (currentState.rpm / 10000) * 0.5;
      bowlGroup.rotation.y += speed;

      // Water Seal Animation
      if (currentState.waterSealIntact) {
        seal.scale.set(1, 1, 1);
        sealMat.opacity = 0.8;
      } else {
        // Seal broken/lost
        seal.scale.set(1, 1, 0.1);
        sealMat.opacity = 0.2;
      }

      // Leak Animation
      if (currentState.isLeaking && currentState.rpm > 1000) {
        leakParticles.visible = true;
        const positions = leakGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < leakCount; i++) {
          positions[i * 3] += 0.1 + Math.random() * 0.1; // Shoot out
          positions[i * 3 + 1] -= 0.05 + Math.random() * 0.05; // Fall down
          
          // Reset
          if (positions[i * 3] > 6) {
            positions[i * 3] = 3.5;
            positions[i * 3 + 1] = -1 + (Math.random() - 0.5) * 0.2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
          }
        }
        leakGeo.attributes.position.needsUpdate = true;
      } else {
        leakParticles.visible = false;
      }

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.1;

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
