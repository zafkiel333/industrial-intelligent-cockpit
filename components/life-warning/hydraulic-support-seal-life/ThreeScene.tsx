import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SealState } from './three-types';

interface ThreeSceneProps {
  state: SealState;
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
    scene.fog = new THREE.FogExp2(0x315268, 0.05);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x8b5cf6, 2); // violet-500
    spotLight.position.set(0, 0, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Hydraulic Cylinder Model ---
    const cylinderGroup = new THREE.Group();
    scene.add(cylinderGroup);

    // Outer Cylinder (Cutaway)
    const barrelGeo = new THREE.CylinderGeometry(3, 3, 10, 32, 1, false, 0, Math.PI * 1.5);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    cylinderGroup.add(barrel);

    // Piston Rod
    const rodGeo = new THREE.CylinderGeometry(1.5, 1.5, 12, 32);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    cylinderGroup.add(rod);

    // Piston Head
    const pistonHeadGeo = new THREE.CylinderGeometry(2.9, 2.9, 1.5, 32);
    const pistonHeadMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.4 });
    const pistonHead = new THREE.Mesh(pistonHeadGeo, pistonHeadMat);
    cylinderGroup.add(pistonHead);

    // Seal Ring (The critical component)
    const sealGeo = new THREE.TorusGeometry(2.95, 0.2, 16, 64);
    
    // Custom shader for seal to show wear, pressure deformation, and temperature
    const sealMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uPressure: { value: 0.0 }, // 0 to 1
        uTemperature: { value: 20.0 },
        uBaseColor: { value: new THREE.Color(0x1e293b) }, // dark slate (rubber/polyurethane)
        uWearColor: { value: new THREE.Color(0x9ca3af) }, // gray (worn/scratched)
        uHotColor: { value: new THREE.Color(0xf43f5e) } // rose-500
      },
      vertexShader: `
        uniform float uPressure;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Deformation based on pressure (flattens against the cylinder wall)
          // Normal points outward, so we push it slightly outward and flatten the Z
          pos.x += normal.x * uPressure * 0.05;
          pos.y += normal.y * uPressure * 0.05;

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform float uTemperature;
        uniform vec3 uBaseColor;
        uniform vec3 uWearColor;
        uniform vec3 uHotColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Wear adds noise and changes color
          float noise = rand(vUv * 100.0);
          vec3 color = mix(uBaseColor, uWearColor, uWear * noise);
          
          // Heat mapping
          float heatFactor = clamp((uTemperature - 30.0) / 70.0, 0.0, 1.0);
          color = mix(color, uHotColor, heatFactor * 0.8);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `
    });

    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.rotation.x = Math.PI / 2;
    cylinderGroup.add(seal);

    // --- Fluid Particles (Contamination visualization) ---
    const particleCount = 500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
       particlePos[i*3] = (Math.random() - 0.5) * 5.8;
       particlePos[i*3+1] = -5 + Math.random() * 5; // Bottom half of cylinder
       particlePos[i*3+2] = (Math.random() - 0.5) * 5.8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xf59e0b, // amber-500 (contamination)
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let cyclePhase = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Seal Shader
      const wearFactor = clamp(currentState.wearDepth / 2.0, 0, 1);
      sealMat.uniforms.uWear.value = wearFactor;
      sealMat.uniforms.uPressure.value = clamp(currentState.pressure / 40, 0, 1);
      sealMat.uniforms.uTemperature.value = currentState.temperature;

      // Piston Movement (Simulating cycles)
      // Speed depends on pressure (simplified)
      const speed = 1.0 + (currentState.pressure / 40);
      cyclePhase += 0.02 * speed;
      const pistonY = Math.sin(cyclePhase) * 3; // Move between -3 and 3
      
      rod.position.y = pistonY + 1; // Rod extends further up
      pistonHead.position.y = pistonY;
      seal.position.y = pistonY;

      // Fluid Contamination Particles
      particleMat.opacity = clamp(currentState.fluidContamination / 100, 0, 0.8);
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
         // Swirl particles
         const x = positions[i*3];
         const z = positions[i*3+2];
         const angle = Math.atan2(z, x) + 0.02;
         const radius = Math.sqrt(x*x + z*z);
         
         if (radius < 2.9) {
             positions[i*3] = Math.cos(angle) * radius;
             positions[i*3+2] = Math.sin(angle) * radius;
         }

         // Keep below piston
         if (positions[i*3+1] > pistonY - 0.8) {
             positions[i*3+1] = -5;
         } else {
             positions[i*3+1] += 0.05;
         }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    function clamp(val: number, min: number, max: number) {
      return Math.max(min, Math.min(max, val));
    }

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
      barrelGeo.dispose();
      barrelMat.dispose();
      rodGeo.dispose();
      rodMat.dispose();
      pistonHeadGeo.dispose();
      pistonHeadMat.dispose();
      sealGeo.dispose();
      sealMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
