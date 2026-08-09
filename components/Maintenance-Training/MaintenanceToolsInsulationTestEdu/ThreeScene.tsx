import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { InsulationState } from './three-types';

interface ThreeSceneProps {
  state: InsulationState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<InsulationState>(state);
  
  const toolGroupRef = useRef<THREE.Group | null>(null);
  const waterRef = useRef<THREE.Mesh | null>(null);
  const sparksRef = useRef<THREE.Points | null>(null);

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
    camera.position.set(0, 3, 6);
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

    // Test Tank (Glass)
    const tankGeo = new THREE.BoxGeometry(3, 2, 2);
    const tankMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x94a3b8, 
        transparent: true, 
        opacity: 0.2,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.1
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, 0, 0);
    scene.add(tank);

    // Water in Tank
    const waterGeo = new THREE.BoxGeometry(2.9, 1.9, 1.9);
    const waterMat = new THREE.MeshPhysicalMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        transmission: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, -0.05, 0); // Slightly smaller and lower
    scene.add(water);
    waterRef.current = water;

    // High Voltage Electrode (Top)
    const hvElectrodeGeo = new THREE.CylinderGeometry(0.05, 0.05, 2);
    const hvElectrodeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
    const hvElectrode = new THREE.Mesh(hvElectrodeGeo, hvElectrodeMat);
    hvElectrode.position.set(0, 1.5, 0);
    scene.add(hvElectrode);

    // Ground Electrode (Bottom of tank)
    const gndElectrodeGeo = new THREE.PlaneGeometry(2.8, 1.8);
    const gndElectrodeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.8, side: THREE.DoubleSide });
    const gndElectrode = new THREE.Mesh(gndElectrodeGeo, gndElectrodeMat);
    gndElectrode.rotation.x = -Math.PI / 2;
    gndElectrode.position.set(0, -0.95, 0);
    scene.add(gndElectrode);

    // Tool Group (Gloves/Boots)
    const toolGroup = new THREE.Group();
    scene.add(toolGroup);
    toolGroupRef.current = toolGroup;

    // Create Tool Geometry based on type
    const createTool = (type: string) => {
        while(toolGroup.children.length > 0){ 
            toolGroup.remove(toolGroup.children[0]); 
        }

        const toolMat = new THREE.MeshStandardMaterial({ 
            color: 0xf59e0b, // Orange rubber
            roughness: 0.8,
            metalness: 0.1
        });

        if (type === 'Gloves') {
            // Simplified Glove (Cylinder with rounded bottom)
            const gloveGeo = new THREE.CylinderGeometry(0.3, 0.2, 1.2, 16);
            const glove = new THREE.Mesh(gloveGeo, toolMat);
            glove.position.set(0, 0.2, 0);
            
            // Fill glove with water (inner electrode)
            const innerWaterGeo = new THREE.CylinderGeometry(0.25, 0.15, 1.1, 16);
            const innerWater = new THREE.Mesh(innerWaterGeo, waterMat);
            innerWater.position.set(0, 0.2, 0);
            
            toolGroup.add(glove);
            toolGroup.add(innerWater);
            
            // Connect HV to inner water
            hvElectrode.position.set(0, 1.2, 0);
            hvElectrode.scale.set(1, 0.5, 1);

        } else if (type === 'Boots') {
            // Simplified Boot
            const bootLegGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
            const bootLeg = new THREE.Mesh(bootLegGeo, toolMat);
            bootLeg.position.set(0, 0.3, 0);
            
            const bootFootGeo = new THREE.BoxGeometry(0.6, 0.3, 0.8);
            const bootFoot = new THREE.Mesh(bootFootGeo, toolMat);
            bootFoot.position.set(0, -0.3, 0.2);
            
            toolGroup.add(bootLeg);
            toolGroup.add(bootFoot);

            hvElectrode.position.set(0, 1.2, 0);
            hvElectrode.scale.set(1, 0.5, 1);

        } else if (type === 'Mat') {
            // Insulation Mat (Flat)
            const matGeo = new THREE.BoxGeometry(2, 0.1, 1.5);
            const matMesh = new THREE.Mesh(matGeo, toolMat);
            matMesh.position.set(0, 0, 0);
            toolGroup.add(matMesh);

            // For mat, tank water is usually not used, placed between flat electrodes
            water.visible = false;
            hvElectrode.position.set(0, 0.5, 0);
            hvElectrode.scale.set(1, 0.5, 1);
            
            // Add top flat electrode
            const topElecGeo = new THREE.BoxGeometry(1.5, 0.05, 1);
            const topElec = new THREE.Mesh(topElecGeo, hvElectrodeMat);
            topElec.position.set(0, 0.075, 0);
            toolGroup.add(topElec);
        }
    };

    // Initial tool creation
    createTool(state.toolType);

    // Sparks (Breakdown visualization)
    const sparkCount = 50;
    const sparksGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(sparkCount * 3);
    sparksGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const sparksMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.1, transparent: true, opacity: 0.8 });
    const sparks = new THREE.Points(sparksGeo, sparksMat);
    sparks.visible = false;
    scene.add(sparks);
    sparksRef.current = sparks;

    let animationFrameId: number;
    let lastToolType = state.toolType;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Recreate tool if type changed
      if (currentState.toolType !== lastToolType) {
          createTool(currentState.toolType);
          lastToolType = currentState.toolType;
      }

      // Update Water Level (for Gloves/Boots)
      if (waterRef.current && currentState.toolType !== 'Mat') {
          waterRef.current.visible = true;
          const level = currentState.waterLevel / 100;
          // Scale Y from 0.1 to 1.9
          waterRef.current.scale.y = Math.max(0.01, level);
          // Adjust position so bottom stays fixed
          waterRef.current.position.y = -0.95 + (1.9 * level) / 2;
      }

      // Animate Sparks if testing and high defect
      if (sparksRef.current) {
          if (currentState.isTesting && currentState.defectLevel > 80 && currentState.testVoltage > 5) {
              sparksRef.current.visible = true;
              const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
              for(let i=0; i<sparkCount; i++) {
                  // Randomize spark positions around the tool
                  positions[i*3] = (Math.random() - 0.5) * 0.8;
                  positions[i*3+1] = (Math.random() - 0.5) * 1.5;
                  positions[i*3+2] = (Math.random() - 0.5) * 0.8;
              }
              sparksRef.current.geometry.attributes.position.needsUpdate = true;
              
              // Flash effect
              sparksMat.opacity = Math.random() > 0.5 ? 0.8 : 0.2;
          } else {
              sparksRef.current.visible = false;
          }
      }

      // Jitter tool slightly if high leakage
      if (toolGroupRef.current && currentState.isTesting && currentState.leakageCurrent > 5) {
          toolGroupRef.current.position.x = (Math.random() - 0.5) * 0.02;
      } else if (toolGroupRef.current) {
          toolGroupRef.current.position.x = 0;
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
