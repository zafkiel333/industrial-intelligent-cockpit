import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BatteryState } from './three-types';

interface ThreeSceneProps {
  state: BatteryState;
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

    const pointLight = new THREE.PointLight(0x22d3ee, 2, 20); // cyan-400
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    // --- Sensor Node Model ---
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    // Concrete Dam Environment (Cutaway)
    const concreteGeo = new THREE.BoxGeometry(12, 8, 12);
    const concreteMat = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, // slate-500
      roughness: 0.9,
      transparent: true,
      opacity: 0.2, // Very transparent to see inside
      wireframe: true
    });
    const concrete = new THREE.Mesh(concreteGeo, concreteMat);
    concrete.position.y = -2;
    nodeGroup.add(concrete);

    // Sensor Casing
    const casingGeo = new THREE.CylinderGeometry(2, 2, 6, 32);
    const casingMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, // slate-700
      metalness: 0.5,
      roughness: 0.5,
      transparent: true,
      opacity: 0.4 // Semi-transparent to see battery
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    nodeGroup.add(casing);

    // Antenna
    const antennaGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.y = 4.5;
    nodeGroup.add(antenna);

    // Battery Pack (Lithium Thionyl Chloride typically used)
    const batteryRadius = 1.2;
    const batteryHeight = 3.5;
    const batteryGeo = new THREE.CylinderGeometry(batteryRadius, batteryRadius, batteryHeight, 32);
    
    // Custom shader for battery to show capacity and internal resistance (heat)
    const batteryMat = new THREE.ShaderMaterial({
      uniforms: {
        uCapacity: { value: 100.0 }, // %
        uTemperature: { value: 20.0 },
        uColorFull: { value: new THREE.Color(0x10b981) }, // emerald-500
        uColorEmpty: { value: new THREE.Color(0xef4444) }, // red-500
        uColorHot: { value: new THREE.Color(0xf97316) } // orange-500
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
        uniform float uCapacity;
        uniform float uTemperature;
        uniform vec3 uColorFull;
        uniform vec3 uColorEmpty;
        uniform vec3 uColorHot;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // Capacity level (fill from bottom up)
          float fillLevel = uCapacity / 100.0;
          vec3 baseColor = mix(uColorEmpty, uColorFull, fillLevel);
          
          // If above fill level, make it look empty/dark
          if (vUv.y > fillLevel) {
             baseColor = vec3(0.2); // Dark gray
          }

          // Heat mapping (internal resistance causes heat during transmission)
          float heatFactor = clamp((uTemperature - 20.0) / 40.0, 0.0, 1.0);
          vec3 finalColor = mix(baseColor, uColorHot, heatFactor * 0.6);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(finalColor * diff + vec3(0.3) * spec, 1.0);
        }
      `
    });
    
    const battery = new THREE.Mesh(batteryGeo, batteryMat);
    battery.position.y = -0.5;
    nodeGroup.add(battery);

    // --- Transmission Waves (Radio signals) ---
    const waveCount = 3;
    const waves: THREE.Mesh[] = [];
    const waveGeo = new THREE.TorusGeometry(1, 0.05, 16, 64);
    const waveMat = new THREE.MeshBasicMaterial({ 
      color: 0x22d3ee, // cyan-400
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < waveCount; i++) {
      const wave = new THREE.Mesh(waveGeo, waveMat.clone());
      wave.position.y = 5.5; // Top of antenna
      wave.rotation.x = Math.PI / 2;
      nodeGroup.add(wave);
      waves.push(wave);
    }

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let lastTransmitTime = 0;
    let isTransmitting = false;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Battery Shader
      batteryMat.uniforms.uCapacity.value = currentState.capacity;
      batteryMat.uniforms.uTemperature.value = currentState.temperature;

      // Simulate Transmission based on frequency
      // frequency is times/day, we scale it for visual effect
      const transmitInterval = Math.max(0.5, 10 / currentState.transmissionFrequency);
      
      if (time - lastTransmitTime > transmitInterval) {
         isTransmitting = true;
         lastTransmitTime = time;
         
         // Reset waves
         waves.forEach((wave, index) => {
            wave.scale.set(0.1, 0.1, 0.1);
            (wave.material as THREE.MeshBasicMaterial).opacity = 1.0;
            // Stagger wave start times slightly
            (wave as any).delay = index * 0.2; 
         });
      }

      // Animate Waves
      if (isTransmitting) {
         let allFaded = true;
         waves.forEach(wave => {
            const delay = (wave as any).delay;
            if (time - lastTransmitTime > delay) {
               const scale = wave.scale.x + 0.1;
               wave.scale.set(scale, scale, scale);
               
               const mat = wave.material as THREE.MeshBasicMaterial;
               mat.opacity = Math.max(0, 1.0 - (scale / 5.0)); // Fade out as it expands
               
               if (mat.opacity > 0) allFaded = false;
            } else {
               allFaded = false;
            }
         });
         
         if (allFaded) isTransmitting = false;
      }

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
      concreteGeo.dispose();
      concreteMat.dispose();
      casingGeo.dispose();
      casingMat.dispose();
      antennaGeo.dispose();
      antennaMat.dispose();
      batteryGeo.dispose();
      batteryMat.dispose();
      waveGeo.dispose();
      waveMat.dispose();
      waves.forEach(w => (w.material as THREE.Material).dispose());
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
