import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ICCPState } from './three-types';

interface ThreeSceneProps {
  state: ICCPState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ICCPState>(state);

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
    camera.position.set(0, 0, 15); // Looking straight at hull
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 10);
    scene.add(dirLight);

    // Ship Hull (Background plane)
    const hullGeo = new THREE.PlaneGeometry(20, 10);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 }); // Dark grey steel
    const hull = new THREE.Mesh(hullGeo, hullMat);
    scene.add(hull);

    // ICCP Anode (Large rectangular plate)
    const anodeGeo = new THREE.BoxGeometry(4, 1, 0.2);
    const anodeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }); // Platinum/Titanium look
    const anode = new THREE.Mesh(anodeGeo, anodeMat);
    anode.position.set(-3, 0, 0.1);
    scene.add(anode);

    // Dielectric Shield (Around anode)
    const shieldGeo = new THREE.PlaneGeometry(6, 3);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 }); // Black epoxy
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-3, 0, 0.05);
    scene.add(shield);

    // Reference Electrode (Small circular sensor)
    const refGroup = new THREE.Group();
    refGroup.position.set(4, 0, 0.1);
    scene.add(refGroup);

    const refBaseGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const refBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const refBase = new THREE.Mesh(refBaseGeo, refBaseMat);
    refBase.rotation.x = Math.PI / 2;
    refGroup.add(refBase);

    const refSensorGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 32);
    const refSensorMatClean = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.5 }); // Zinc/Silver look
    const refSensorMatDirty = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 1 }); // Brown/Barnacles
    const refSensor = new THREE.Mesh(refSensorGeo, refSensorMatClean);
    refSensor.rotation.x = Math.PI / 2;
    refSensor.position.z = 0.1;
    refGroup.add(refSensor);

    // Protection Field Visualization (Particles flowing from anode to hull)
    const fieldGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i+=3) {
        posArray[i] = -3 + (Math.random() - 0.5) * 4; // Start near anode X
        posArray[i+1] = (Math.random() - 0.5) * 1;    // Start near anode Y
        posArray[i+2] = 0.2 + Math.random() * 2;      // Start slightly off hull Z
    }
    fieldGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const fieldMat = new THREE.PointsMaterial({ size: 0.1, color: 0x3b82f6, transparent: true, opacity: 0.6 }); // Blue electrons
    const fieldParticles = new THREE.Points(fieldGeo, fieldMat);
    scene.add(fieldParticles);

    // Corrosion Visualization (Red spots on hull if under-protected)
    const corrosionGeo = new THREE.BufferGeometry();
    const corrCount = 50;
    const corrArray = new Float32Array(corrCount * 3);
    for(let i=0; i<corrCount*3; i+=3) {
        corrArray[i] = (Math.random() - 0.5) * 18;
        corrArray[i+1] = (Math.random() - 0.5) * 8;
        corrArray[i+2] = 0.01;
    }
    corrosionGeo.setAttribute('position', new THREE.BufferAttribute(corrArray, 3));
    const corrMat = new THREE.PointsMaterial({ size: 0.3, color: 0xef4444, transparent: true, opacity: 0 }); // Red rust
    const corrosionParticles = new THREE.Points(corrosionGeo, corrMat);
    scene.add(corrosionParticles);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Reference Electrode Appearance
      refSensor.material = currentState.referenceElectrodeFault ? refSensorMatDirty : refSensorMatClean;

      // Animate Protection Field
      if (currentState.powerSupply && currentState.anodeCurrent > 0) {
        fieldParticles.visible = true;
        const positions = fieldParticles.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<particleCount*3; i+=3) {
            // Particles move from anode outwards and towards hull
            positions[i] += (Math.random() - 0.5) * 0.1; // Spread X
            positions[i+1] += (Math.random() - 0.5) * 0.1; // Spread Y
            positions[i+2] -= 0.05; // Move towards hull (-Z)

            // Reset if they hit hull or go too far
            if (positions[i+2] <= 0 || Math.abs(positions[i] - (-3)) > 8) {
                positions[i] = -3 + (Math.random() - 0.5) * 4;
                positions[i+1] = (Math.random() - 0.5) * 1;
                positions[i+2] = 0.2 + Math.random() * 2;
            }
        }
        fieldParticles.geometry.attributes.position.needsUpdate = true;
        
        // Intensity based on current
        (fieldParticles.material as THREE.PointsMaterial).opacity = Math.min(0.8, currentState.anodeCurrent / 50);
      } else {
        fieldParticles.visible = false;
      }

      // Animate Corrosion based on hull potential
      // Target is -800mV. If it gets less negative (e.g., -600mV), corrosion starts.
      if (currentState.hullPotential > -750) {
         const severity = Math.min(1, (currentState.hullPotential + 750) / 200); // 0 at -750, 1 at -550
         (corrosionParticles.material as THREE.PointsMaterial).opacity = severity;
      } else {
         (corrosionParticles.material as THREE.PointsMaterial).opacity = 0;
      }

      // Slowly pan camera slightly for underwater feel
      camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
      camera.position.y = Math.cos(Date.now() * 0.0004) * 0.5;
      camera.lookAt(0, 0, 0);

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
