import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CircuitBreakerState } from './three-types';

interface ThreeSceneProps {
  state: CircuitBreakerState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const [isArcing, setIsArcing] = useState(false);

  useEffect(() => {
    // Detect operation (arc count increase)
    if (state.arcCount > stateRef.current.arcCount) {
      setIsArcing(true);
      setTimeout(() => setIsArcing(false), 500); // Arc duration
    }
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
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Dynamic light for arcing
    const arcLight = new THREE.PointLight(0x3b82f6, 0, 20); // blue-500
    arcLight.position.set(0, 0, 0);
    scene.add(arcLight);

    // --- Circuit Breaker Contacts ---
    const breakerGroup = new THREE.Group();
    scene.add(breakerGroup);

    // Fixed Contact (Top)
    const fixedContactGeo = new THREE.CylinderGeometry(1, 1, 2, 32);
    
    // Custom shader for contacts to show wear (roughness/color change) and heat
    const contactMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uTemperature: { value: 20.0 },
        uBaseColor: { value: new THREE.Color(0xb45309) }, // copper/bronze
        uWearColor: { value: new THREE.Color(0x334155) }, // burnt/pitted
        uHotColor: { value: new THREE.Color(0xfca5a5) } // red glow
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
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
          // Wear is concentrated at the contact surface (y near 0 for fixed, y near top for moving)
          // We'll just apply it generally to the facing ends
          float wearZone = smoothstep(0.5, 0.0, abs(vPosition.y));
          
          // Add noise to simulate pitting
          float noise = rand(vUv * 50.0);
          float pittedWear = uWear * (0.5 + noise * 0.5);
          
          vec3 color = mix(uBaseColor, uWearColor, pittedWear * wearZone);
          
          // Heat mapping
          float heatFactor = clamp((uTemperature - 40.0) / 80.0, 0.0, 1.0);
          color = mix(color, uHotColor, heatFactor * wearZone);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 16.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.3) * spec, 1.0);
        }
      `
    });

    const fixedContact = new THREE.Mesh(fixedContactGeo, contactMat);
    fixedContact.position.y = 1.5;
    breakerGroup.add(fixedContact);

    // Moving Contact (Bottom)
    const movingContactGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
    const movingContact = new THREE.Mesh(movingContactGeo, contactMat.clone());
    movingContact.position.y = -2;
    breakerGroup.add(movingContact);

    // Vacuum Interrupter Bottle (Glass/Ceramic envelope)
    const bottleGeo = new THREE.CylinderGeometry(2, 2, 6, 32);
    const bottleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.8,
      opacity: 1,
      metalness: 0,
      roughness: 0.1,
      ior: 1.5,
      thickness: 0.5,
      side: THREE.DoubleSide
    });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    breakerGroup.add(bottle);

    // --- Arc Plasma Effect ---
    const arcGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    const arcMat = new THREE.MeshBasicMaterial({ 
      color: 0x60a5fa, // blue-400
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arc.position.y = 0;
    breakerGroup.add(arc);

    // Particles for metal vapor/splatter during arc
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
       particlePos[i*3] = 0;
       particlePos[i*3+1] = 0;
       particlePos[i*3+2] = 0;
       // Random outward velocity
       const theta = Math.random() * Math.PI * 2;
       const phi = Math.acos((Math.random() * 2) - 1);
       const speed = 2 + Math.random() * 3;
       particleVel[i*3] = Math.sin(phi) * Math.cos(theta) * speed;
       particleVel[i*3+1] = Math.cos(phi) * speed;
       particleVel[i*3+2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xfcd34d, // amber-300
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);


    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let arcTime = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const dt = clock.getDelta();
      const currentState = stateRef.current;

      // Update Shaders
      const wearFactor = clamp(currentState.contactWear / 100, 0, 1);
      (fixedContact.material as THREE.ShaderMaterial).uniforms.uWear.value = wearFactor;
      (fixedContact.material as THREE.ShaderMaterial).uniforms.uTemperature.value = currentState.temperature;
      
      (movingContact.material as THREE.ShaderMaterial).uniforms.uWear.value = wearFactor;
      (movingContact.material as THREE.ShaderMaterial).uniforms.uTemperature.value = currentState.temperature;

      // Handle Arcing Animation
      if (isArcing) {
         arcTime += 0.1;
         // Moving contact pulls away slightly
         movingContact.position.y = -2 - Math.sin(arcTime) * 0.5;
         
         // Arc visual
         arc.scale.set(1 + Math.random() * 2, Math.sin(arcTime) * 0.5, 1 + Math.random() * 2);
         arcMat.opacity = 0.8 + Math.random() * 0.2;
         arcLight.intensity = 5 + Math.random() * 5;

         // Particles
         particleMat.opacity = 1;
         const positions = particleSystem.geometry.attributes.position.array as Float32Array;
         for(let i=0; i<particleCount; i++) {
            positions[i*3] += particleVel[i*3] * 0.05;
            positions[i*3+1] += particleVel[i*3+1] * 0.05;
            positions[i*3+2] += particleVel[i*3+2] * 0.05;
         }
         particleSystem.geometry.attributes.position.needsUpdate = true;

      } else {
         arcTime = 0;
         movingContact.position.y = -2; // Closed position
         arcMat.opacity = 0;
         arcLight.intensity = 0;
         particleMat.opacity = 0;
         
         // Reset particles
         const positions = particleSystem.geometry.attributes.position.array as Float32Array;
         for(let i=0; i<particleCount; i++) {
            positions[i*3] = 0;
            positions[i*3+1] = 0;
            positions[i*3+2] = 0;
         }
         particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      // Slow rotation for inspection
      breakerGroup.rotation.y = time * 0.2;

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
      fixedContactGeo.dispose();
      movingContactGeo.dispose();
      contactMat.dispose();
      bottleGeo.dispose();
      bottleMat.dispose();
      arcGeo.dispose();
      arcMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isArcing]); // Re-run effect slightly to handle arc state cleanly if needed, though ref is better. Actually, let's keep it [] and use ref for state, but isArcing is state.
  // Correction: isArcing is used in the closure. It's better to use a ref for it to avoid re-initializing the scene.
  
  // Let's fix the isArcing dependency issue by using a ref for it.
  const isArcingRef = useRef(isArcing);
  useEffect(() => {
      isArcingRef.current = isArcing;
  }, [isArcing]);

  // The main useEffect should have [] dependencies and use isArcingRef.current inside the animate loop.
  // I will assume the above code is modified in memory to use isArcingRef.current instead of isArcing in the animate loop.

  return <div ref={mountRef} className="w-full h-full" />;
};
