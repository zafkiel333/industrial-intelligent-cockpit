import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RotorClearanceState } from './three-types';

interface ThreeSceneProps {
  state: RotorClearanceState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<RotorClearanceState>(state);

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
    camera.position.set(0, 0, 10); // Looking straight down the rotors
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

    // Casing (Cutaway view)
    const casingGeo = new THREE.BoxGeometry(7, 4, 1);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, transparent: true, opacity: 0.3 });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.position.z = -1;
    scene.add(casing);

    // Male Rotor (Left) - Simplified as a gear/star shape
    const createRotorShape = (lobes: number, radius: number, innerRadius: number) => {
      const shape = new THREE.Shape();
      const steps = lobes * 4;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const r = i % 4 === 0 ? radius : (i % 2 === 0 ? innerRadius : (radius + innerRadius) / 2);
        if (i === 0) shape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      shape.closePath();
      return shape;
    };

    const maleShape = createRotorShape(4, 1.5, 0.8); // 4 lobes
    const extrudeSettings = { depth: 2, bevelEnabled: false, curveSegments: 32 };
    const maleGeo = new THREE.ExtrudeGeometry(maleShape, extrudeSettings);
    // Center geometry
    maleGeo.computeBoundingBox();
    const maleCenterOffset = -0.5 * (maleGeo.boundingBox!.max.z - maleGeo.boundingBox!.min.z);
    maleGeo.translate(0, 0, maleCenterOffset);

    const maleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 }); // Silver
    const maleRotor = new THREE.Mesh(maleGeo, maleMat);
    maleRotor.position.set(-1.6, 0, 0);
    scene.add(maleRotor);

    // Female Rotor (Right)
    const femaleShape = createRotorShape(6, 1.5, 1.0); // 6 lobes (simplified matching)
    const femaleGeo = new THREE.ExtrudeGeometry(femaleShape, extrudeSettings);
    femaleGeo.computeBoundingBox();
    const femaleCenterOffset = -0.5 * (femaleGeo.boundingBox!.max.z - femaleGeo.boundingBox!.min.z);
    femaleGeo.translate(0, 0, femaleCenterOffset);

    const femaleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 }); // Darker silver
    const femaleRotor = new THREE.Mesh(femaleGeo, femaleMat);
    femaleRotor.position.set(1.6, 0, 0);
    scene.add(femaleRotor);

    // Feeler Gauge (Visual representation)
    const gaugeGeo = new THREE.BoxGeometry(0.1, 2, 0.5);
    const gaugeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 }); // Brass/Gold color
    const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
    gauge.position.set(0, 0, 1); // Between rotors, slightly forward
    scene.add(gauge);

    // Clearance Highlight (Red line showing the gap)
    const gapMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
    const gapGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, -0.5, 0)]);
    const gapLine = new THREE.Line(gapGeo, gapMat);
    gapLine.position.set(0, 0, 1.1);
    scene.add(gapLine);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotate rotors based on state angle
      // Ratio is 4:6 (or 2:3). If male turns 360, female turns 240.
      const maleAngleRad = currentState.rotorAngle * (Math.PI / 180);
      maleRotor.rotation.z = -maleAngleRad;
      femaleRotor.rotation.z = maleAngleRad * (4/6) + (Math.PI / 6); // Offset to mesh

      // Adjust distance between rotors based on clearance value (exaggerated for visual)
      // Ideal is 0.15mm. Let's say 0.15mm = 3.2 distance.
      // 0.05mm = 3.1, 0.25mm = 3.3
      const baseDistance = 3.2;
      const visualOffset = (currentState.clearanceValue - 0.15) * 2; // Exaggerate 20x
      
      maleRotor.position.x = -(baseDistance / 2) - (visualOffset / 2);
      femaleRotor.position.x = (baseDistance / 2) + (visualOffset / 2);

      // Feeler Gauge Interaction
      if (currentState.feelerGaugeInserted) {
        gauge.visible = true;
        
        // Check if gauge fits
        if (currentState.feelerGaugeThickness > currentState.clearanceValue) {
           // Gauge too thick, turns red
           gaugeMat.color.setHex(0xef4444);
           gauge.position.y = 1.5; // Can't insert fully
        } else if (currentState.feelerGaugeThickness < currentState.clearanceValue - 0.05) {
           // Gauge too thin, loose (blue)
           gaugeMat.color.setHex(0x3b82f6);
           gauge.position.y = 0; // Inserted fully
        } else {
           // Good fit (green)
           gaugeMat.color.setHex(0x22c55e);
           gauge.position.y = 0; // Inserted fully
        }
      } else {
        gauge.visible = false;
      }

      // Highlight gap if adjusting
      gapLine.visible = currentState.isAdjusting;
      if (currentState.isAdjusting) {
          // Scale gap line based on clearance
          gapLine.scale.x = Math.max(0.1, currentState.clearanceValue * 5);
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
