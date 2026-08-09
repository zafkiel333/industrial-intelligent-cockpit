import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SeparatorState } from './three-types';

interface ThreeSceneProps {
  state: SeparatorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SeparatorState>(state);

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
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Separator Base
    const baseGeo = new THREE.CylinderGeometry(3, 3.5, 2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2;
    scene.add(base);

    // Rotating Bowl Assembly
    const bowlGroup = new THREE.Group();
    scene.add(bowlGroup);

    // Bowl Body (Cutaway)
    const bowlGeo = new THREE.CylinderGeometry(2.5, 2.5, 3, 32, 1, true, 0, Math.PI * 1.5);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, side: THREE.DoubleSide });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowlGroup.add(bowl);

    // Disc Stack (Simplified)
    const discGeo = new THREE.ConeGeometry(2, 1.5, 32, 1, true, 0, Math.PI * 1.5);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, side: THREE.DoubleSide });
    for (let i = 0; i < 5; i++) {
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = -0.5 + i * 0.3;
      bowlGroup.add(disc);
    }

    // Sludge Space (Outer edge)
    const sludgeGeo = new THREE.TorusGeometry(2.3, 0.2, 16, 32, Math.PI * 1.5);
    const sludgeMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 }); // Dark grey/black
    const sludge = new THREE.Mesh(sludgeGeo, sludgeMat);
    sludge.rotation.x = Math.PI / 2;
    sludge.position.y = 0;
    bowlGroup.add(sludge);

    // Operating Water Mechanism (Bottom)
    const opWaterGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
    const opWaterMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.5 });
    const opWater = new THREE.Mesh(opWaterGeo, opWaterMat);
    opWater.position.y = -1.75;
    bowlGroup.add(opWater);

    // Sliding Bowl Bottom (Moves down to discharge)
    const slidingBottomGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32);
    const slidingBottomMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8 });
    const slidingBottom = new THREE.Mesh(slidingBottomGeo, slidingBottomMat);
    slidingBottom.position.y = -1.4;
    bowlGroup.add(slidingBottom);

    // Fluid Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 0.5; // Start near center
      particlePos[i * 3 + 1] = 1.5; // Start at top
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      
      // Color: Mix of oil (yellow/brown) and water (blue)
      const isOil = Math.random() > 0.5;
      particleColors[i * 3] = isOil ? 0.8 : 0.2; // R
      particleColors[i * 3 + 1] = isOil ? 0.6 : 0.5; // G
      particleColors[i * 3 + 2] = isOil ? 0.1 : 0.9; // B
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(particleGeo, particleMat);
    bowlGroup.add(particles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotation based on RPM
      const rotationSpeed = (currentState.rpm / 8000) * 0.5;
      bowlGroup.rotation.y += rotationSpeed;

      // Vibration effect
      if (currentState.vibration > 0) {
        const vibAmount = currentState.vibration * 0.02;
        bowlGroup.position.x = (Math.random() - 0.5) * vibAmount;
        bowlGroup.position.z = (Math.random() - 0.5) * vibAmount;
      } else {
        bowlGroup.position.x = 0;
        bowlGroup.position.z = 0;
      }

      // Bowl Open/Close animation (Discharge)
      if (currentState.bowlOpen) {
        slidingBottom.position.y = THREE.MathUtils.lerp(slidingBottom.position.y, -1.8, 0.2);
        sludgeMat.opacity = THREE.MathUtils.lerp(sludgeMat.opacity, 0, 0.1); // Sludge disappears
        sludgeMat.transparent = true;
      } else {
        slidingBottom.position.y = THREE.MathUtils.lerp(slidingBottom.position.y, -1.4, 0.1);
        sludgeMat.opacity = THREE.MathUtils.lerp(sludgeMat.opacity, currentState.sludgeLevel / 100, 0.05);
      }

      // Particle animation (Separation process)
      if (currentState.rpm > 4000 && currentState.oilFeed) {
        particles.visible = true;
        const positions = particleGeo.attributes.position.array as Float32Array;
        const colors = particleGeo.attributes.color.array as Float32Array;
        
        for (let i = 0; i < particleCount; i++) {
          // Move down
          positions[i * 3 + 1] -= 0.05;
          
          // Centrifugal force: move outwards based on density (color roughly represents density here)
          const isOil = colors[i * 3] > 0.5; // Yellowish
          const radius = Math.sqrt(positions[i * 3]**2 + positions[i * 3 + 2]**2);
          
          if (positions[i * 3 + 1] < 1 && positions[i * 3 + 1] > -1) {
             // Inside disc stack
             if (isOil && radius > 0.5) {
               // Oil moves inwards (lighter)
               positions[i * 3] *= 0.95;
               positions[i * 3 + 2] *= 0.95;
             } else if (!isOil && radius < 2.2) {
               // Water/Sludge moves outwards (heavier)
               positions[i * 3] *= 1.05;
               positions[i * 3 + 2] *= 1.05;
             }
          }

          // Reset if at bottom or discharged
          if (positions[i * 3 + 1] < -1.5 || (currentState.bowlOpen && radius > 2)) {
            positions[i * 3] = (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] = 1.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      } else {
        particles.visible = false;
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
