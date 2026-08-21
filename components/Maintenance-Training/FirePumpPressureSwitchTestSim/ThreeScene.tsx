import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PressureSwitchState } from './three-types';

interface ThreeSceneProps {
  state: PressureSwitchState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<PressureSwitchState>(state);

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
    camera.position.set(0, 2, 8);
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

    // Main Pipe
    const pipeGeo = new THREE.CylinderGeometry(0.5, 0.5, 6, 32);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.4 }); // Red for fire pipe
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    scene.add(pipe);

    // Pressure Switch Assembly
    const switchGroup = new THREE.Group();
    switchGroup.position.set(0, 0.5, 0);
    scene.add(switchGroup);

    // Connection tube
    const tubeGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.y = 0.5;
    switchGroup.add(tube);

    // Switch Body
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.2, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.6;
    switchGroup.add(body);

    // Switch Dial/Face
    const dialGeo = new THREE.PlaneGeometry(0.6, 1);
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.set(0, 1.6, 0.31);
    switchGroup.add(dial);

    // Indicator Light
    const lightGeo = new THREE.CircleGeometry(0.1, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Green initially
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(0, 2.3, 0.31);
    switchGroup.add(light);

    // Test Valve
    const testValveGroup = new THREE.Group();
    testValveGroup.position.set(2, 0, 0);
    scene.add(testValveGroup);

    const tvPipeGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 16);
    const tvPipe = new THREE.Mesh(tvPipeGeo, pipeMat);
    tvPipe.position.y = -0.75;
    testValveGroup.add(tvPipe);

    const tvHandleGeo = new THREE.BoxGeometry(0.6, 0.1, 0.1);
    const tvHandleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5 });
    const tvHandle = new THREE.Mesh(tvHandleGeo, tvHandleMat);
    tvHandle.position.set(0, -0.5, 0.2);
    testValveGroup.add(tvHandle);

    // Water particles for test valve
    const particleCount = 100;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 0.2; // x
        posArray[i+1] = -1.5 - Math.random() * 2; // y
        posArray[i+2] = (Math.random() - 0.5) * 0.2; // z
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6
    });
    const waterParticles = new THREE.Points(particlesGeo, particlesMat);
    waterParticles.position.set(2, 0, 0);
    scene.add(waterParticles);

    // Pressure Gauge (Visual representation)
    const gaugeGroup = new THREE.Group();
    gaugeGroup.position.set(-2, 0.5, 0);
    scene.add(gaugeGroup);

    const gTube = new THREE.Mesh(tubeGeo, tubeMat);
    gTube.position.y = 0.5;
    gaugeGroup.add(gTube);

    const gFaceGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
    gFaceGeo.rotateX(Math.PI / 2);
    const gFaceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1 });
    const gFace = new THREE.Mesh(gFaceGeo, gFaceMat);
    gFace.position.set(0, 1, 0.1);
    gaugeGroup.add(gFace);

    const needleGeo = new THREE.BoxGeometry(0.02, 0.4, 0.02);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.set(0, 1, 0.16);
    // Move pivot to bottom of needle
    needle.geometry.translate(0, 0.2, 0);
    gaugeGroup.add(needle);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Switch Light
      if (currentState.switchState === 'ON') {
        lightMat.color.setHex(0x22c55e); // Green (Pump running signal)
      } else {
        lightMat.color.setHex(0x94a3b8); // Grey (Off)
      }

      // Update Gauge Needle (0 to 1.6 MPa mapped to angle)
      // Let's say 0 MPa is -135 deg, 1.6 MPa is 135 deg
      const maxPressure = 1.6;
      const angleRange = 270 * (Math.PI / 180);
      const startAngle = -135 * (Math.PI / 180);
      const pressureRatio = Math.min(1, Math.max(0, currentState.pressure / maxPressure));
      needle.rotation.z = -(startAngle + pressureRatio * angleRange);

      // Update Test Valve Handle
      tvHandle.rotation.z = currentState.testValveOpen ? Math.PI / 2 : 0;

      // Update Water Particles
      waterParticles.visible = currentState.testValveOpen && currentState.pressure > 0;
      if (waterParticles.visible) {
        const positions = waterParticles.geometry.attributes.position.array as Float32Array;
        const speed = (currentState.pressure / maxPressure) * 0.2 + 0.05;
        for(let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3+1] -= speed; // Move down
            
            // Reset to top of valve outlet
            if (positions[i3+1] < -3.5) {
                positions[i3+1] = -1.5;
                // Spread out slightly based on pressure
                positions[i3] = (Math.random() - 0.5) * (speed * 2);
                positions[i3+2] = (Math.random() - 0.5) * (speed * 2);
            }
        }
        waterParticles.geometry.attributes.position.needsUpdate = true;
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
