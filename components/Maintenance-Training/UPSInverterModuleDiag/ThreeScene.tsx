import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { UPSInverterState } from './three-types';

interface ThreeSceneProps {
  state: UPSInverterState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<UPSInverterState>(state);

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
    camera.position.set(0, 2, 6);
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

    // UPS Cabinet
    const cabinetGeo = new THREE.BoxGeometry(3, 4, 2);
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, transparent: true, opacity: 0.2 });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    scene.add(cabinet);

    // Inverter Module (Center focus)
    const inverterGroup = new THREE.Group();
    inverterGroup.position.set(0, 0.5, 0);
    scene.add(inverterGroup);

    const moduleGeo = new THREE.BoxGeometry(2.5, 1.5, 1.5);
    const moduleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const moduleMesh = new THREE.Mesh(moduleGeo, moduleMat);
    inverterGroup.add(moduleMesh);

    // Heatsink
    const heatsinkGeo = new THREE.BoxGeometry(2.3, 0.2, 1.3);
    const heatsinkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const heatsink = new THREE.Mesh(heatsinkGeo, heatsinkMat);
    heatsink.position.y = 0.85;
    inverterGroup.add(heatsink);

    // IGBT Modules (on heatsink)
    const igbtMats: THREE.MeshStandardMaterial[] = [];
    for (let i = 0; i < 3; i++) {
        const igbtGeo = new THREE.BoxGeometry(0.5, 0.1, 0.8);
        const igbtMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        igbtMats.push(igbtMat);
        const igbt = new THREE.Mesh(igbtGeo, igbtMat);
        igbt.position.set(-0.8 + i * 0.8, 0.95, 0);
        inverterGroup.add(igbt);
    }

    // DC Capacitors
    const capMats: THREE.MeshStandardMaterial[] = [];
    for (let i = 0; i < 4; i++) {
        const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 }); // Blue
        capMats.push(capMat);
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(-0.9 + i * 0.6, -0.4, 0.4);
        inverterGroup.add(cap);
    }

    // Power Flow Lines (Visuals)
    const createFlowLine = (points: THREE.Vector3[], color: number) => {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
        return new THREE.Line(geo, mat);
    };

    // AC Input to Rectifier (simulated)
    const acInLine = createFlowLine([new THREE.Vector3(-2, -1, 0), new THREE.Vector3(-1, -1, 0)], 0xfacc15); // Yellow
    scene.add(acInLine);

    // DC Bus to Inverter
    const dcBusLine = createFlowLine([new THREE.Vector3(-1, -1, 0), new THREE.Vector3(0, -0.5, 0)], 0xef4444); // Red
    scene.add(dcBusLine);

    // Inverter to AC Output
    const acOutLine = createFlowLine([new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(2, 1.5, 0)], 0x22c55e); // Green
    scene.add(acOutLine);

    // Bypass Line
    const bypassLine = createFlowLine([new THREE.Vector3(-2, 2.5, 0), new THREE.Vector3(2, 2.5, 0)], 0xf97316); // Orange
    scene.add(bypassLine);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update IGBT Colors based on temperature
      const tempRatio = Math.max(0, Math.min(1, (currentState.igbtTemperature - 25) / 75)); // 25 to 100C
      const r = Math.floor(tempRatio * 255);
      const colorHex = (r << 16) | 0x000000;
      
      igbtMats.forEach(mat => {
          if (currentState.inverterStatus === 'Fault' && currentState.faultCode === 'IGBT_OVERTEMP') {
              mat.color.setHex(0xff0000); // Solid red if faulted
              mat.emissive.setHex(0x550000);
          } else {
              mat.color.setHex(colorHex);
              mat.emissive.setHex(0x000000);
          }
      });

      // Update Capacitor Colors based on health
      capMats.forEach(mat => {
          if (currentState.capacitorHealth < 50) {
              mat.color.setHex(0x94a3b8); // Grey out if bad
              // Maybe add a bulge effect?
          } else {
              mat.color.setHex(0x0ea5e9); // Normal blue
          }
      });

      // Update Flow Lines visibility/animation
      const time = Date.now() * 0.005;
      
      if (currentState.isBypassMode) {
          acInLine.visible = true;
          dcBusLine.visible = false;
          acOutLine.visible = false;
          bypassLine.visible = true;
          (bypassLine.material as THREE.LineBasicMaterial).opacity = 0.5 + Math.sin(time) * 0.5;
      } else if (currentState.inverterStatus === 'Normal') {
          acInLine.visible = true;
          dcBusLine.visible = true;
          acOutLine.visible = true;
          bypassLine.visible = false;
          
          (acInLine.material as THREE.LineBasicMaterial).opacity = 0.5 + Math.sin(time) * 0.5;
          (dcBusLine.material as THREE.LineBasicMaterial).opacity = 0.5 + Math.sin(time * 1.2) * 0.5;
          (acOutLine.material as THREE.LineBasicMaterial).opacity = 0.5 + Math.sin(time * 1.5) * 0.5;
      } else {
          // Off or Fault
          acInLine.visible = true; // Input still there
          dcBusLine.visible = true; // DC bus might still be charged
          acOutLine.visible = false;
          bypassLine.visible = false;
          
          (acInLine.material as THREE.LineBasicMaterial).opacity = 0.2;
          (dcBusLine.material as THREE.LineBasicMaterial).opacity = 0.2;
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
