import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FilterState } from './three-types';

interface ThreeSceneProps {
  state: FilterState;
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
    scene.background = new THREE.Color(0x020617); // slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(10, 8, 15);

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
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 2, 20); // blue-500
    pointLight.position.set(-5, 5, 0);
    scene.add(pointLight);

    // --- Filter Model ---
    const filterGroup = new THREE.Group();
    scene.add(filterGroup);

    // Filter Housing (Transparent)
    const housingRadius = 3.5;
    const housingHeight = 8;
    const housingGeo = new THREE.CylinderGeometry(housingRadius, housingRadius, housingHeight, 32);
    const housingMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x94a3b8, // slate-400
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.8, // Glass-like
      transparent: true,
      opacity: 0.5
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    filterGroup.add(housing);

    // Top/Bottom Caps
    const capGeo = new THREE.CylinderGeometry(housingRadius + 0.2, housingRadius + 0.2, 0.5, 32);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = housingHeight / 2 + 0.25;
    const bottomCap = new THREE.Mesh(capGeo, capMat);
    bottomCap.position.y = -housingHeight / 2 - 0.25;
    filterGroup.add(topCap);
    filterGroup.add(bottomCap);

    // Filter Element (Pleated paper/mesh inside)
    const elementRadius = 2.5;
    const elementHeight = 7.5;
    
    // Custom shader for filter element to show clogging (darkening)
    const elementMat = new THREE.ShaderMaterial({
      uniforms: {
        uClogging: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0xfef08a) }, // yellow-200 (clean)
        uCloggedColor: { value: new THREE.Color(0x1c1917) } // stone-900 (dirty/black)
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          
          vec3 pos = position;
          // Create pleats using sine wave based on angle
          float angle = atan(pos.z, pos.x);
          float pleat = sin(angle * 40.0) * 0.2;
          pos.x += normalize(pos.x) * pleat;
          pos.z += normalize(pos.z) * pleat;

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uClogging;
        uniform vec3 uBaseColor;
        uniform vec3 uCloggedColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        // Noise function for uneven clogging
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Add some noise to clogging so it looks organic
          float noise = rand(vUv * 50.0);
          float localClog = clamp(uClogging + (noise - 0.5) * 0.2, 0.0, 1.0);
          
          // Bottom clogs slightly faster
          localClog = mix(localClog, localClog * 1.2, 1.0 - vUv.y);
          localClog = clamp(localClog, 0.0, 1.0);

          vec3 color = mix(uBaseColor, uCloggedColor, localClog);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `
    });

    const elementGeo = new THREE.CylinderGeometry(elementRadius, elementRadius, elementHeight, 128);
    const element = new THREE.Mesh(elementGeo, elementMat);
    filterGroup.add(element);

    // --- Oil Particles (Flowing through) ---
    const particleCount = 300;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
       // Start outside the element, flow inwards
       const angle = Math.random() * Math.PI * 2;
       const r = elementRadius + 0.2 + Math.random() * 0.6;
       particlePos[i*3] = Math.cos(angle) * r;
       particlePos[i*3+1] = (Math.random() - 0.5) * elementHeight;
       particlePos[i*3+2] = Math.sin(angle) * r;
       
       particleSpeeds[i] = 0.02 + Math.random() * 0.03;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x3b82f6, // blue-500 (clean oil)
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particleMat);
    filterGroup.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Calculate clogging factor (0 to 1) based on pressure drop
      // Normal ~50kPa, Clogged > 250kPa
      const cloggingFactor = clamp((currentState.pressureDrop - 50) / 200, 0, 1);

      // Update Filter Shader
      elementMat.uniforms.uClogging.value = cloggingFactor;

      // Update Oil Color based on particulate count (gets darker/browner)
      const dirtyFactor = clamp(currentState.particulateCount / 1000, 0, 1);
      const cleanColor = new THREE.Color(0x3b82f6); // Blue
      const dirtyColor = new THREE.Color(0x78350f); // Amber-900
      particleMat.color.copy(cleanColor).lerp(dirtyColor, dirtyFactor);

      // Animate Oil Particles
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      
      // Flow speed decreases as pressure drop increases (clogging)
      const flowMultiplier = Math.max(0.1, 1.0 - cloggingFactor * 0.8) * (currentState.flowRate / 100);

      for(let i=0; i<particleCount; i++) {
         // Move inwards towards center
         const x = positions[i*3];
         const z = positions[i*3+2];
         const dist = Math.sqrt(x*x + z*z);
         
         if (dist > 0.5) {
            const speed = particleSpeeds[i] * flowMultiplier;
            positions[i*3] -= (x / dist) * speed;
            positions[i*3+2] -= (z / dist) * speed;
            // Swirl slightly
            positions[i*3] += (z / dist) * speed * 0.5;
            positions[i*3+2] -= (x / dist) * speed * 0.5;
         } else {
            // Reset to outside
            const angle = Math.random() * Math.PI * 2;
            const r = elementRadius + 0.2 + Math.random() * 0.6;
            positions[i*3] = Math.cos(angle) * r;
            positions[i*3+1] = (Math.random() - 0.5) * elementHeight;
            positions[i*3+2] = Math.sin(angle) * r;
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
      housingGeo.dispose();
      housingMat.dispose();
      capGeo.dispose();
      capMat.dispose();
      elementGeo.dispose();
      elementMat.dispose();
      particlesGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
