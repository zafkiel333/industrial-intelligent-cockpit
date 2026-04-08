import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VentilatorState } from './three-types';

interface ThreeSceneProps {
  state: VentilatorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<VentilatorState>(state);

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
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 10);
    scene.add(dirLight);

    // Fan Casing (Transparent)
    const casingGeo = new THREE.CylinderGeometry(6, 6, 4, 32, 1, true);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.rotation.x = Math.PI / 2;
    scene.add(casing);

    // Rotor Hub
    const rotorGroup = new THREE.Group();
    
    const hubGeo = new THREE.CylinderGeometry(2, 2, 2, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    rotorGroup.add(hub);

    // Blades
    const bladeCount = 8;
    const blades: THREE.Mesh[] = [];
    
    // Create a custom blade shape
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, -0.5);
    bladeShape.lineTo(4, -1);
    bladeShape.lineTo(4, 1);
    bladeShape.lineTo(0, 0.5);
    bladeShape.lineTo(0, -0.5);
    
    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.5 }); // Blue blades

    for (let i = 0; i < bladeCount; i++) {
      const bladePivot = new THREE.Group();
      
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      // Center the geometry
      blade.geometry.computeBoundingBox();
      const centerOffset = -0.5 * (blade.geometry.boundingBox!.max.z - blade.geometry.boundingBox!.min.z);
      blade.position.z = centerOffset;
      
      // Position blade on hub
      blade.position.x = 2; 
      
      bladePivot.add(blade);
      
      // Rotate pivot around hub
      bladePivot.rotation.z = (i / bladeCount) * Math.PI * 2;
      
      rotorGroup.add(bladePivot);
      blades.push(blade); // Store mesh to rotate it along its own axis later
    }
    
    scene.add(rotorGroup);

    // Airflow Particles
    const flowGeo = new THREE.BufferGeometry();
    const flowCount = 200;
    const flowPos = new Float32Array(flowCount * 3);
    for (let i = 0; i < flowCount * 3; i++) {
      flowPos[i] = (Math.random() - 0.5) * 10;
      flowPos[i + 1] = (Math.random() - 0.5) * 10;
      flowPos[i + 2] = (Math.random() - 0.5) * 10;
    }
    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
    const flowMat = new THREE.PointsMaterial({ color: 0xf8fafc, size: 0.1, transparent: true, opacity: 0.6 });
    const airflow = new THREE.Points(flowGeo, flowMat);
    scene.add(airflow);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update blade angles
      // Convert -15 to 15 degrees to radians and apply an initial pitch
      const basePitch = Math.PI / 6; // 30 degrees default pitch
      const angleRad = (currentState.bladeAngle * Math.PI) / 180;
      
      blades.forEach(blade => {
        // Rotate blade along its X axis (which points radially outward due to pivot rotation)
        blade.rotation.x = basePitch + angleRad;
      });

      // Rotor Rotation
      if (currentState.isRunning) {
        rotorGroup.rotation.z -= 0.2; // Fast rotation
        
        // Airflow Animation
        airflow.visible = true;
        const positions = flowGeo.attributes.position.array as Float32Array;
        // Speed depends on angle (more angle = more flow, up to a point)
        const flowSpeed = 0.2 + (currentState.bladeAngle + 15) * 0.01;
        
        for (let i = 0; i < flowCount; i++) {
          positions[i * 3 + 2] += flowSpeed; // Move along Z axis
          if (positions[i * 3 + 2] > 5) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = -5;
          }
        }
        flowGeo.attributes.position.needsUpdate = true;
      } else {
        airflow.visible = false;
      }

      // Slowly rotate scene slightly for 3D effect
      scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;
      scene.rotation.x = Math.sin(Date.now() * 0.0007) * 0.1;

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
