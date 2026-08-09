import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PumpPartsState } from './three-types';

interface ThreeSceneProps {
  state: PumpPartsState;
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
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 0, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x06b6d4, 2); // cyan-500
    spotLight.position.set(0, 0, 15);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Pump Volute Liner Model ---
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Volute shape (spiral)
    const voluteShape = new THREE.Shape();
    const points = 64;
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Spiral radius increases
        const radius = 5 + (angle / (Math.PI * 2)) * 2;
        if (i === 0) voluteShape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        else voluteShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    // Inner hole
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, 3, 0, Math.PI * 2, false);
    voluteShape.holes.push(holePath);

    const extrudeSettings = {
        depth: 3,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.2,
        bevelThickness: 0.2
    };

    const voluteGeo = new THREE.ExtrudeGeometry(voluteShape, extrudeSettings);
    voluteGeo.center();

    // Custom shader for volute liner to show wear (thinning) and impact areas
    const voluteMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uImpact: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x1e293b) }, // dark rubber/metal
        uWearColor: { value: new THREE.Color(0x94a3b8) }, // lighter worn area
        uImpactColor: { value: new THREE.Color(0xef4444) } // red-500
      },
      vertexShader: `
        uniform float uWear;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Wear deformation: inner surface expands outward (liner gets thinner)
          // We approximate this by pushing vertices outward if they are near the inner hole
          float distFromCenter = length(pos.xy);
          if (distFromCenter > 2.0 && distFromCenter < 4.0) {
              // Push outward radially
              vec2 dir = normalize(pos.xy);
              pos.xy += dir * uWear * 0.5;
          }

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform float uImpact;
        uniform vec3 uBaseColor;
        uniform vec3 uWearColor;
        uniform vec3 uImpactColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec3 color = uBaseColor;
          
          // Wear is highest at the "cutwater" area (where radius is smallest/largest transition)
          // Rough approximation based on position
          float angle = atan(vPosition.y, vPosition.x);
          float cutwaterArea = smoothstep(0.8, 1.0, cos(angle - 1.0)); // Arbitrary angle for cutwater
          
          // Add noise to wear
          float wearNoise = rand(vPosition.xy * 5.0);
          float localWear = uWear * (0.5 + wearNoise * 0.5) * (0.5 + cutwaterArea * 1.5);
          
          color = mix(color, uWearColor, clamp(localWear, 0.0, 1.0));
          
          // Impact glow (high concentration)
          color = mix(color, uImpactColor, uImpact * cutwaterArea * wearNoise);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `
    });

    const volute = new THREE.Mesh(voluteGeo, voluteMat);
    pumpGroup.add(volute);

    // Impeller (simplified, inside volute)
    const impellerGeo = new THREE.CylinderGeometry(2.8, 2.8, 1, 16);
    const impellerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.6 });
    const impeller = new THREE.Mesh(impellerGeo, impellerMat);
    impeller.rotation.x = Math.PI / 2;
    pumpGroup.add(impeller);

    // --- Slurry Particles ---
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleAngles = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
       const angle = Math.random() * Math.PI * 2;
       const radius = 3 + Math.random() * 2; // Between impeller and volute wall
       particlePos[i*3] = Math.cos(angle) * radius;
       particlePos[i*3+1] = Math.sin(angle) * radius;
       particlePos[i*3+2] = (Math.random() - 0.5) * 2;
       
       particleAngles[i] = angle;
       particleRadii[i] = radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x64748b, // slate-500 (tailings)
      transparent: true,
      opacity: 0.8,
      blending: THREE.NormalBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Volute Shader
      const wearFactor = clamp(currentState.linerWear / 30, 0, 1);
      const impactFactor = clamp(currentState.slurryConcentration / 60, 0, 1);
      
      voluteMat.uniforms.uWear.value = wearFactor;
      voluteMat.uniforms.uImpact.value = impactFactor;

      // Rotate Impeller
      // Speed proportional to flow rate (simplified)
      const speed = (currentState.flowRate / 1000) * 10; 
      impeller.rotation.y -= speed * 0.016;

      // Vibration
      const vibIntensity = currentState.vibration * 0.05;
      if (vibIntensity > 0.1) {
         pumpGroup.position.x = (Math.random() - 0.5) * vibIntensity;
         pumpGroup.position.y = (Math.random() - 0.5) * vibIntensity;
      } else {
         pumpGroup.position.set(0, 0, 0);
      }

      // Update Particles (Slurry flow)
      // Color depends on concentration
      if (currentState.slurryConcentration > 50) {
          particleMat.color.setHex(0x475569); // darker, thicker
      } else {
          particleMat.color.setHex(0x94a3b8); // lighter
      }

      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
         // Move particles in a spiral
         particleAngles[i] -= speed * 0.02;
         
         // Centrifugal force pushes them out
         particleRadii[i] += speed * 0.005;
         
         // If they hit the volute wall, they follow it and exit
         const maxRadius = 5 + (particleAngles[i] / (Math.PI * 2)) * 2;
         
         if (particleRadii[i] > maxRadius) {
             // Exit the pump (simplified, just reset)
             particleAngles[i] = Math.random() * Math.PI * 2;
             particleRadii[i] = 3 + Math.random() * 0.5; // Back near impeller
         }

         positions[i*3] = Math.cos(particleAngles[i]) * particleRadii[i];
         positions[i*3+1] = Math.sin(particleAngles[i]) * particleRadii[i];
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
      voluteGeo.dispose();
      voluteMat.dispose();
      impellerGeo.dispose();
      impellerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
