import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TireState } from './three-types';

interface ThreeSceneProps {
  state: TireState;
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
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x8b5cf6, 2); // violet-500
    spotLight.position.set(0, -10, 10);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Tire Model ---
    const tireGroup = new THREE.Group();
    scene.add(tireGroup);

    // Rim
    const rimGeo = new THREE.CylinderGeometry(3, 3, 4, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    tireGroup.add(rim);

    // Tire Rubber
    const tireGeo = new THREE.TorusGeometry(5, 2, 32, 64);
    
    // Custom shader for tire to show heat, wear, and pressure deformation
    const tireMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemperature: { value: 40.0 },
        uWear: { value: 0.0 }, // 0 to 1
        uPressureDeficit: { value: 0.0 }, // 0 to 1 (bulge at bottom)
        uBaseColor: { value: new THREE.Color(0x1e293b) }, // slate-800
        uHotColor: { value: new THREE.Color(0xef4444) }, // red-500
        uWearColor: { value: new THREE.Color(0x475569) } // slate-600 (worn rubber)
      },
      vertexShader: `
        uniform float uPressureDeficit;
        uniform float uWear;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          
          vec3 pos = position;
          
          // Deflation bulge at the bottom (y < 0)
          if (pos.y < 0.0) {
             // Bulge outwards in X and Z based on how low Y is
             float bulge = pow(abs(pos.y) / 7.0, 2.0) * uPressureDeficit * 2.0;
             pos.x += sign(pos.x) * bulge;
             pos.z += sign(pos.z) * bulge;
             // Flatten the bottom slightly
             pos.y += bulge * 0.5;
          }

          // Wear (shrink the outer radius slightly)
          // Torus radius is 5, tube is 2. Outer edge is where length(pos.xy) is max
          float distFromCenter = length(pos.xy);
          if (distFromCenter > 6.0) {
             pos.xy *= (1.0 - uWear * 0.05);
          }

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTemperature;
        uniform float uWear;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        uniform vec3 uWearColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // Heat mapping (normalize temp 40-120C)
          float heatFactor = clamp((uTemperature - 40.0) / 80.0, 0.0, 1.0);
          
          // Wear color mixing
          vec3 base = mix(uBaseColor, uWearColor, uWear);
          
          // Apply heat color
          vec3 color = mix(base, uHotColor, heatFactor * 0.7);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.1);
          
          // Rubber has low specular
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 8.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.1) * spec, 1.0);
        }
      `
    });

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tireGroup.add(tire);

    // --- Ground/Dust ---
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 1.0 }); // amber-950
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -7; // Below tire
    scene.add(ground);

    // Dust particles
    const dustCount = 500;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for(let i=0; i<dustCount; i++) {
       dustPos[i*3] = (Math.random() - 0.5) * 20;
       dustPos[i*3+1] = -7 + Math.random() * 5;
       dustPos[i*3+2] = (Math.random() - 0.5) * 20;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x78350f, // amber-900
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const dustSystem = new THREE.Points(dustGeo, dustMat);
    scene.add(dustSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Tire Shader
      // Normal pressure ~100 psi. Deficit is when it drops below 90
      const pressureDeficit = clamp((100 - currentState.pressure) / 40, 0, 1);
      tireMat.uniforms.uPressureDeficit.value = pressureDeficit;
      
      // Max tread depth ~100mm. Wear is 0 to 1
      const wearFactor = clamp((100 - currentState.treadDepth) / 100, 0, 1);
      tireMat.uniforms.uWear.value = wearFactor;
      
      tireMat.uniforms.uTemperature.value = currentState.temperature;

      // Rotate Tire (Speed based on TKPH roughly)
      const speed = 0.02 + (currentState.tkph / 1000) * 0.05;
      tireGroup.rotation.z -= speed;

      // Animate Dust
      const positions = dustSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<dustCount; i++) {
         positions[i*3+2] += speed * 5; // Move dust backwards
         if (positions[i*3+2] > 10) {
            positions[i*3+2] = -10;
            positions[i*3+1] = -7 + Math.random() * 2;
         }
      }
      dustSystem.geometry.attributes.position.needsUpdate = true;

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
      rimGeo.dispose();
      rimMat.dispose();
      tireGeo.dispose();
      tireMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
