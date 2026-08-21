import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { InsulationState } from './three-types';

interface ThreeSceneProps {
  state: InsulationState;
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
    
    // Enable shadow mapping
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x4488ff, 500);
    spotLight.position.set(0, 20, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    const redLight = new THREE.PointLight(0xff0000, 0, 10);
    redLight.position.set(0, 2, 0);
    scene.add(redLight);

    // --- Stator Bar Model ---
    const statorGroup = new THREE.Group();
    scene.add(statorGroup);

    // Copper Conductor
    const conductorGeometry = new THREE.BoxGeometry(2, 4, 20);
    const conductorMaterial = new THREE.MeshStandardMaterial({
      color: 0xb87333, // Copper color
      metalness: 0.9,
      roughness: 0.2,
    });
    const conductor = new THREE.Mesh(conductorGeometry, conductorMaterial);
    conductor.castShadow = true;
    statorGroup.add(conductor);

    // Main Insulation (Mica/Epoxy)
    const insulationGeometry = new THREE.BoxGeometry(2.4, 4.4, 19.8);
    
    // Custom shader for insulation to show aging and PD
    const insulationMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uAgingFactor: { value: 0.0 },
        uTime: { value: 0.0 },
        uColorHealthy: { value: new THREE.Color(0x22aa55) }, // Greenish
        uColorAged: { value: new THREE.Color(0xaa5522) },   // Brownish/Burnt
        uPDIntensity: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uAgingFactor;
        uniform float uTime;
        uniform vec3 uColorHealthy;
        uniform vec3 uColorAged;
        uniform float uPDIntensity;
        
        varying vec2 vUv;
        varying vec3 vPosition;

        // Simple noise
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Base color mix based on aging
          vec3 baseColor = mix(uColorHealthy, uColorAged, uAgingFactor);
          
          // Add noise texture for aged look
          float noise = rand(vPosition.xy * 5.0 + vPosition.z * 2.0);
          baseColor *= mix(1.0, noise * 0.8 + 0.2, uAgingFactor);

          // Partial Discharge (PD) flashes
          // Create localized flashes based on position, time, and intensity
          float pdFlash = 0.0;
          if (uPDIntensity > 0.0) {
            float flashNoise = rand(floor(vPosition.xz * 2.0) + floor(uTime * 10.0));
            if (flashNoise > 0.95 - (uPDIntensity * 0.2)) {
               pdFlash = 1.0;
            }
          }
          
          vec3 finalColor = baseColor + vec3(0.8, 0.8, 1.0) * pdFlash * uPDIntensity;
          
          // Add some transparency to see conductor slightly
          gl_FragColor = vec4(finalColor, 0.85);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const insulation = new THREE.Mesh(insulationGeometry, insulationMaterial);
    statorGroup.add(insulation);

    // Corona Shielding (Outer layer)
    const shieldGeometry = new THREE.BoxGeometry(2.5, 4.5, 15);
    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.7
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    statorGroup.add(shield);

    // --- Partial Discharge Particles ---
    const pdParticleCount = 500;
    const pdGeometry = new THREE.BufferGeometry();
    const pdPositions = new Float32Array(pdParticleCount * 3);
    const pdLifetimes = new Float32Array(pdParticleCount);

    for (let i = 0; i < pdParticleCount; i++) {
      pdPositions[i * 3] = (Math.random() - 0.5) * 2.6;
      pdPositions[i * 3 + 1] = (Math.random() - 0.5) * 4.6;
      pdPositions[i * 3 + 2] = (Math.random() - 0.5) * 19.8;
      pdLifetimes[i] = Math.random();
    }

    pdGeometry.setAttribute('position', new THREE.BufferAttribute(pdPositions, 3));
    pdGeometry.setAttribute('lifetime', new THREE.BufferAttribute(pdLifetimes, 1));

    const pdMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0 }
      },
      vertexShader: `
        attribute float lifetime;
        varying float vLifetime;
        uniform float uTime;
        void main() {
          vLifetime = mod(lifetime + uTime * 2.0, 1.0);
          vec3 pos = position;
          // Jitter position slightly
          pos.x += sin(uTime * 10.0 + position.y) * 0.1;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (1.0 - vLifetime) * 8.0 * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vLifetime;
        uniform float uIntensity;
        void main() {
          if (uIntensity < 0.01) discard;
          
          // Create a soft circle
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if (ll > 0.5) discard;
          
          // Blue/White spark color
          vec3 color = mix(vec3(1.0, 1.0, 1.0), vec3(0.2, 0.5, 1.0), vLifetime);
          float alpha = (1.0 - vLifetime) * uIntensity * (1.0 - ll * 2.0);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const pdSystem = new THREE.Points(pdGeometry, pdMaterial);
    statorGroup.add(pdSystem);

    // Add a grid helper for scale
    const grid = new THREE.GridHelper(40, 40, 0x222222, 0x111111);
    grid.position.y = -5;
    scene.add(grid);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Insulation Shader
      insulationMaterial.uniforms.uAgingFactor.value = currentState.agingFactor;
      insulationMaterial.uniforms.uTime.value = time;
      
      // Normalize PD for visual intensity (assuming max ~5000 pC for visual scale)
      const normalizedPD = Math.min(1.0, currentState.partialDischarge / 2000);
      insulationMaterial.uniforms.uPDIntensity.value = normalizedPD;

      // Update PD Particles
      pdMaterial.uniforms.uTime.value = time;
      pdMaterial.uniforms.uIntensity.value = normalizedPD;

      // Dynamic Lighting based on PD and Temperature
      if (normalizedPD > 0.5) {
        redLight.intensity = (Math.sin(time * 20) * 0.5 + 0.5) * normalizedPD * 50;
      } else {
        redLight.intensity = 0;
      }
      
      // Color shift based on temperature (hotter = more red ambient)
      const tempFactor = Math.max(0, (currentState.temperature - 60) / 60); // Scale 60-120C
      ambientLight.color.setRGB(0.5 + tempFactor * 0.5, 0.5 - tempFactor * 0.2, 0.5 - tempFactor * 0.2);

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
      conductorGeometry.dispose();
      conductorMaterial.dispose();
      insulationGeometry.dispose();
      insulationMaterial.dispose();
      shieldGeometry.dispose();
      shieldMaterial.dispose();
      pdGeometry.dispose();
      pdMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
