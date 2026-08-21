import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HVACCompressorState } from './three-types';

interface ThreeSceneProps {
  state: HVACCompressorState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

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
    scene.fog = new THREE.FogExp2(0x315268, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const compGroup = new THREE.Group();
    scene.add(compGroup);

    // Centrifugal Compressor Housing (Cutaway)
    const housingGeo = new THREE.CylinderGeometry(4, 4, 8, 32, 1, false, 0, Math.PI * 1.5); // Cutaway
    const housingMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, // slate-700
        metalness: 0.6, 
        roughness: 0.4,
        side: THREE.DoubleSide
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.rotation.z = Math.PI / 2;
    compGroup.add(housing);

    // Motor Stator (Inside housing)
    const statorGeo = new THREE.CylinderGeometry(3.8, 3.8, 4, 32, 1, false, 0, Math.PI * 1.5);
    const statorMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.5, side: THREE.DoubleSide }); // Copper color
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.rotation.z = Math.PI / 2;
    stator.position.x = -2;
    compGroup.add(stator);

    // Rotor & Impeller Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    compGroup.add(shaft);

    // Impeller
    const impellerGeo = new THREE.ConeGeometry(3, 1.5, 16);
    const impellerMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 });
    const impeller = new THREE.Mesh(impellerGeo, impellerMat);
    impeller.rotation.z = -Math.PI / 2;
    impeller.position.x = 3;
    compGroup.add(impeller);

    // Motor Heat Shader (Applied to a cylinder around the stator)
    const heatGeo = new THREE.CylinderGeometry(3.9, 3.9, 4, 32, 1, false, 0, Math.PI * 1.5);
    const heatMat = new THREE.ShaderMaterial({
        uniforms: {
            uTemp: { value: 0.0 },
            uColorNormal: { value: new THREE.Color(0x000000) },
            uColorHot: { value: new THREE.Color(0xef4444) } // red-500
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTemp;
            uniform vec3 uColorNormal;
            uniform vec3 uColorHot;
            varying vec3 vNormal;
            void main() {
                vec3 color = mix(uColorNormal, uColorHot, uTemp);
                gl_FragColor = vec4(color, uTemp * 0.8); // Alpha based on temp
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });
    const heatMesh = new THREE.Mesh(heatGeo, heatMat);
    heatMesh.rotation.z = Math.PI / 2;
    heatMesh.position.x = -2;
    compGroup.add(heatMesh);

    // Refrigerant Flow Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
        particlePos[i*3] = 2 + Math.random() * 2; // Near impeller
        particlePos[i*3+1] = (Math.random() - 0.5) * 6;
        particlePos[i*3+2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x38bdf8, // sky-400 (cool gas)
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    compGroup.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Rotation based on operation (assuming always running in this view, speed varies slightly)
      const speed = 0.2;
      shaft.rotation.x += speed;
      impeller.rotation.y += speed; // Cone geometry rotation axis

      // Vibration
      const vib = currentState.vibration * 0.01;
      compGroup.position.y = Math.sin(time * 20) * vib;
      compGroup.position.z = Math.cos(time * 20) * vib;

      // Heat Shader Update
      // Normal temp ~60C, critical > 100C
      const tempRatio = Math.max(0, Math.min(1, (currentState.motorTemperature - 50) / 60));
      heatMat.uniforms.uTemp.value = tempRatio;

      // Particle Flow (Refrigerant)
      // Color based on discharge pressure (high pressure = hotter/redder)
      if (currentState.dischargePressure > 1.8) {
          particleMat.color.setHex(0xf87171); // red
      } else if (currentState.dischargePressure > 1.4) {
          particleMat.color.setHex(0xfacc15); // yellow
      } else {
          particleMat.color.setHex(0x38bdf8); // blue
      }

      const pPos = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
          // Centrifugal movement
          const x = pPos[i*3];
          const y = pPos[i*3+1];
          const z = pPos[i*3+2];
          
          // Move outwards from center
          const dist = Math.sqrt(y*y + z*z);
          if (dist > 0) {
              pPos[i*3+1] += (y/dist) * 0.1;
              pPos[i*3+2] += (z/dist) * 0.1;
          }
          
          // Move along X axis (discharge)
          pPos[i*3] += 0.05;

          // Reset if too far
          if (dist > 4 || pPos[i*3] > 5) {
              pPos[i*3] = 2 + Math.random(); // Back to impeller inlet
              const angle = Math.random() * Math.PI * 2;
              const r = Math.random() * 1.5;
              pPos[i*3+1] = Math.cos(angle) * r;
              pPos[i*3+2] = Math.sin(angle) * r;
          }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      controls.update();
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      housingGeo.dispose();
      housingMat.dispose();
      statorGeo.dispose();
      statorMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      impellerGeo.dispose();
      impellerMat.dispose();
      heatGeo.dispose();
      heatMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
