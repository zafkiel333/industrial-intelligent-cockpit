import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BrushState } from './three-types';

interface ThreeSceneProps {
  state: BrushState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<BrushState>(state);

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
    camera.position.set(5, 4, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Slip Ring
    const ringGeo = new THREE.CylinderGeometry(2, 2, 1.5, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 }); // Copper-like
    const slipRing = new THREE.Mesh(ringGeo, ringMat);
    slipRing.rotation.z = Math.PI / 2;
    scene.add(slipRing);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(1.8, 1.8, 4, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    scene.add(shaft);

    // Brush Holder
    const holderGeo = new THREE.BoxGeometry(1, 2, 1);
    const holderMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.6 });
    const holder = new THREE.Mesh(holderGeo, holderMat);
    holder.position.set(0, 2.5, 0);
    scene.add(holder);

    // Carbon Brush
    const brushGeo = new THREE.BoxGeometry(0.8, 1.5, 0.8);
    const brushMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.2, roughness: 0.8 });
    const brush = new THREE.Mesh(brushGeo, brushMat);
    scene.add(brush);

    // Spring
    const springGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    const springMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, wireframe: true });
    const spring = new THREE.Mesh(springGeo, springMat);
    scene.add(spring);

    // Sparks
    const sparkGeo = new THREE.BufferGeometry();
    const sparkCount = 50;
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVel = [];
    for(let i=0; i<sparkCount; i++) {
      sparkPos[i*3] = (Math.random() - 0.5) * 0.5;
      sparkPos[i*3+1] = 2; // Contact point
      sparkPos[i*3+2] = (Math.random() - 0.5) * 0.5;
      sparkVel.push({
        x: (Math.random() - 0.5) * 0.1,
        y: Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.1
      });
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({ color: 0xfef08a, size: 0.1, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      if (currentState.isRotating) {
        slipRing.rotation.x += 0.05;
        shaft.rotation.x += 0.05;
      }

      // Update brush position based on step
      // Step 0: Normal, Step 1: PPE (Normal), Step 2: Pull out, Step 3: Insert new, Step 4: Check spring
      let targetBrushY = 2.5; // Normal contact
      let targetSpringY = 3.5;
      let targetSpringScaleY = 1;

      if (currentState.step === 2) {
        targetBrushY = 4.5; // Pulled out
        targetSpringY = 5.5;
        targetSpringScaleY = 0.5; // Compressed
      } else if (currentState.step === 3) {
        targetBrushY = 3.5; // Partially inserted
        targetSpringY = 4.5;
        targetSpringScaleY = 0.8;
      } else if (currentState.step === 4) {
        targetBrushY = 2.5; // Fully inserted
        targetSpringY = 3.5;
        targetSpringScaleY = 1.0; // Normal tension
      }

      brush.position.y += (targetBrushY - brush.position.y) * 0.1;
      spring.position.y += (targetSpringY - spring.position.y) * 0.1;
      spring.scale.y += (targetSpringScaleY - spring.scale.y) * 0.1;

      // Sparks animation
      if (currentState.sparkIntensity > 0 && currentState.step < 2) {
        sparks.visible = true;
        const positions = sparkGeo.attributes.position.array as Float32Array;
        for(let i=0; i<sparkCount; i++) {
          positions[i*3] += sparkVel[i].x * currentState.sparkIntensity;
          positions[i*3+1] += sparkVel[i].y * currentState.sparkIntensity;
          positions[i*3+2] += sparkVel[i].z * currentState.sparkIntensity;

          // Reset spark if it goes too high or fades
          if (positions[i*3+1] > 3 || Math.random() < 0.05) {
            positions[i*3] = (Math.random() - 0.5) * 0.5;
            positions[i*3+1] = 2;
            positions[i*3+2] = (Math.random() - 0.5) * 0.5;
          }
        }
        sparkGeo.attributes.position.needsUpdate = true;
      } else {
        sparks.visible = false;
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
