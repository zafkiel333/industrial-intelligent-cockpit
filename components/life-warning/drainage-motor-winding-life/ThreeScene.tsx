import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WindingState } from './three-types';

interface ThreeSceneProps {
  state: WindingState;
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
    camera.position.set(15, 10, 20);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xf59e0b, 2); // amber-500
    spotLight.position.set(-10, 10, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Motor Stator Model ---
    const motorGroup = new THREE.Group();
    scene.add(motorGroup);

    // Stator Core (Laminated steel)
    const coreRadius = 6;
    const coreInnerRadius = 4;
    const coreLength = 8;
    
    const coreGeo = new THREE.CylinderGeometry(coreRadius, coreRadius, coreLength, 64, 1, true);
    const coreMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, // slate-600
      metalness: 0.6, 
      roughness: 0.5,
      side: THREE.DoubleSide
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.rotation.x = Math.PI / 2;
    motorGroup.add(core);

    // Windings (Copper coils)
    const slotCount = 24;
    const windings: THREE.Mesh[] = [];

    // Custom shader for windings to show temperature and insulation degradation
    const windingMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemperature: { value: 40.0 },
        uInsulation: { value: 1000.0 }, // MΩ
        uBaseColor: { value: new THREE.Color(0xb45309) }, // amber-700 (Copper)
        uHotColor: { value: new THREE.Color(0xff0000) }, // Red hot
        uDegradedColor: { value: new THREE.Color(0x333333) } // Dark/burnt insulation
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
        uniform float uTemperature;
        uniform float uInsulation;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        uniform vec3 uDegradedColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Heat mapping (normalize temp 40-150C)
          float heatFactor = clamp((uTemperature - 40.0) / 110.0, 0.0, 1.0);
          vec3 color = mix(uBaseColor, uHotColor, heatFactor * 0.8);

          // Insulation degradation mapping (lower resistance = more degraded)
          // Normal > 100MΩ, Critical < 5MΩ
          float degradationFactor = 1.0 - clamp((uInsulation - 5.0) / 95.0, 0.0, 1.0);
          
          // Add noise for burnt spots
          float noise = rand(vUv * 30.0);
          float burnSpot = smoothstep(0.6, 1.0, noise) * degradationFactor;
          
          color = mix(color, uDegradedColor, degradationFactor * 0.5 + burnSpot);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular (varnish is shiny, burnt is dull)
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.3) * spec * (1.0 - degradationFactor), 1.0);
        }
      `
    });

    // Create coil ends (end windings)
    const coilRadius = 0.6;
    const coilGeo = new THREE.CapsuleGeometry(coilRadius, coreLength + 2, 8, 16);
    
    for (let i = 0; i < slotCount; i++) {
      const angle = (i / slotCount) * Math.PI * 2;
      const r = coreInnerRadius + 0.5;
      
      const coil = new THREE.Mesh(coilGeo, windingMat);
      coil.position.set(
        Math.cos(angle) * r,
        0,
        Math.sin(angle) * r
      );
      coil.rotation.x = Math.PI / 2;
      
      motorGroup.add(coil);
      windings.push(coil);
    }

    // --- Partial Discharge Particles (Sparks) ---
    const pdParticleCount = 200;
    const pdGeo = new THREE.BufferGeometry();
    const pdPos = new Float32Array(pdParticleCount * 3);
    
    for(let i=0; i<pdParticleCount; i++) {
       pdPos[i*3] = 0;
       pdPos[i*3+1] = 1000; // Hidden initially
       pdPos[i*3+2] = 0;
    }
    pdGeo.setAttribute('position', new THREE.BufferAttribute(pdPos, 3));
    
    const pdMat = new THREE.PointsMaterial({
      size: 0.3,
      color: 0x38bdf8, // sky-400 (electric blue arc)
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const pdSystem = new THREE.Points(pdGeo, pdMat);
    motorGroup.add(pdSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Winding Shader uniforms
      windingMat.uniforms.uTemperature.value = currentState.temperature;
      windingMat.uniforms.uInsulation.value = currentState.insulationResistance;

      // Simulate Partial Discharge (Sparks)
      const positions = pdSystem.geometry.attributes.position.array as Float32Array;
      
      // PD intensity determines how many sparks and how often
      // Normal < 100pC, Critical > 1000pC
      const pdIntensity = clamp((currentState.partialDischarge - 100) / 900, 0, 1);
      const activeSparks = Math.floor(pdIntensity * pdParticleCount);

      for(let i=0; i<pdParticleCount; i++) {
        if (i < activeSparks) {
           // Randomly spawn sparks on the end windings
           if (Math.random() > 0.9) {
              const angle = Math.random() * Math.PI * 2;
              const r = coreInnerRadius + Math.random() * 1.5;
              const y = (Math.random() > 0.5 ? 1 : -1) * (coreLength/2 + 1); // End windings
              
              positions[i*3] = Math.cos(angle) * r;
              positions[i*3+1] = y + (Math.random() - 0.5) * 0.5;
              positions[i*3+2] = Math.sin(angle) * r;
           } else {
              // Fade out / move slightly
              positions[i*3+1] += (Math.random() - 0.5) * 0.1;
              // Hide if it's been around a bit
              if (Math.random() > 0.8) positions[i*3+1] = 1000;
           }
        } else {
           positions[i*3+1] = 1000;
        }
      }
      pdSystem.geometry.attributes.position.needsUpdate = true;
      
      // Flicker PD color
      pdMat.opacity = 0.5 + Math.random() * 0.5;

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
      coreGeo.dispose();
      coreMat.dispose();
      coilGeo.dispose();
      windingMat.dispose();
      pdGeo.dispose();
      pdMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
