import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GearboxState } from './three-types';

interface ThreeSceneProps {
  state: GearboxState;
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
    scene.fog = new THREE.FogExp2(0x315268, 0.03);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xec4899, 2); // pink-500
    spotLight.position.set(0, 10, 15);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Gearbox Model ---
    const gearboxGroup = new THREE.Group();
    scene.add(gearboxGroup);

    // Helper to create a gear
    const createGear = (radius: number, teeth: number, color: number) => {
      const shape = new THREE.Shape();
      const innerRadius = radius * 0.8;
      const outerRadius = radius;
      
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        if (i === 0) shape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      shape.closePath();

      const extrudeSettings = {
        depth: 2,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
      };

      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.center(); // Center the geometry
      
      // Custom shader for gears to show wear, heat, and stress
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uWear: { value: 0.0 }, // 0 to 1
          uTemp: { value: 40.0 }, // Celsius
          uStress: { value: 0.0 }, // 0 to 1
          uBaseColor: { value: new THREE.Color(color) },
          uWearColor: { value: new THREE.Color(0xfcd34d) }, // amber-300 (shiny worn metal)
          uHotColor: { value: new THREE.Color(0xef4444) } // red-500
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
          uniform float uTemp;
          uniform float uStress;
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
            vec3 color = uBaseColor;
            
            // Wear is concentrated on the teeth faces (where normal is roughly perpendicular to Z)
            float isToothFace = 1.0 - abs(vNormal.z);
            
            // Add noise to wear pattern
            float wearNoise = rand(vPosition.xy * 10.0);
            float wearAmount = uWear * isToothFace * (0.5 + wearNoise * 0.5);
            
            color = mix(color, uWearColor, wearAmount);

            // Heat mapping (overall glow)
            float heatFactor = clamp((uTemp - 60.0) / 60.0, 0.0, 1.0);
            color = mix(color, uHotColor, heatFactor * 0.8);
            
            // Stress (flashes on tooth faces)
            color = mix(color, vec3(1.0, 0.5, 0.0), uStress * isToothFace * 0.5);

            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            float diff = max(dot(vNormal, lightDir), 0.2);
            
            // Specular highlight
            vec3 viewDir = normalize(-vPosition);
            vec3 halfDir = normalize(lightDir + viewDir);
            float specPower = mix(32.0, 128.0, wearAmount); // Worn areas are shinier
            float spec = pow(max(dot(vNormal, halfDir), 0.0), specPower);
            
            gl_FragColor = vec4(color * diff + vec3(0.5) * spec, 1.0);
          }
        `
      });

      return new THREE.Mesh(geo, mat);
    };

    // Gear 1 (Input)
    const gear1 = createGear(4, 16, 0x475569);
    gear1.position.set(-5, 0, 0);
    gearboxGroup.add(gear1);

    // Gear 2 (Output)
    const gear2 = createGear(6, 24, 0x334155);
    gear2.position.set(5, 0, 0);
    // Offset rotation so teeth mesh
    gear2.rotation.z = Math.PI / 24; 
    gearboxGroup.add(gear2);

    // Shafts
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 10, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    
    const shaft1 = new THREE.Mesh(shaftGeo, shaftMat);
    shaft1.rotation.x = Math.PI / 2;
    shaft1.position.set(-5, 0, 0);
    gearboxGroup.add(shaft1);

    const shaft2 = new THREE.Mesh(shaftGeo, shaftMat);
    shaft2.rotation.x = Math.PI / 2;
    shaft2.position.set(5, 0, 0);
    gearboxGroup.add(shaft2);

    // --- Oil Particles (Lubrication and Heat) ---
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
       particlePos[i*3] = (Math.random() - 0.5) * 15;
       particlePos[i*3+1] = -8 + Math.random() * 4; // Pool at bottom
       particlePos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.3,
      color: 0xf59e0b, // amber-500 (oil)
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Gear Shaders
      const wearFactor = clamp(currentState.gearWear / 200, 0, 1);
      const stressFactor = clamp(currentState.torque / 2000, 0, 1);
      
      [gear1, gear2].forEach(gear => {
         const mat = gear.material as THREE.ShaderMaterial;
         mat.uniforms.uWear.value = wearFactor;
         mat.uniforms.uTemp.value = currentState.oilTemperature;
         mat.uniforms.uStress.value = stressFactor;
      });

      // Rotate Gears (Gear ratio 16:24 = 2:3)
      // Speed depends on torque (simplified load simulation)
      const baseSpeed = 2.0;
      gear1.rotation.z -= baseSpeed * 0.016;
      gear2.rotation.z += (baseSpeed * (16/24)) * 0.016;

      // Vibration
      const vibIntensity = currentState.vibration * 0.02;
      if (vibIntensity > 0.1) {
         gearboxGroup.position.x = (Math.random() - 0.5) * vibIntensity;
         gearboxGroup.position.y = (Math.random() - 0.5) * vibIntensity;
      } else {
         gearboxGroup.position.set(0, 0, 0);
      }

      // Oil Particles (Splashing)
      // Color changes with temperature
      if (currentState.oilTemperature > 90) {
          particleMat.color.setHex(0xef4444); // red (overheating)
      } else if (currentState.oilTemperature > 70) {
          particleMat.color.setHex(0xd97706); // amber-600
      } else {
          particleMat.color.setHex(0xf59e0b); // amber-500
      }

      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
         // Some particles get caught in gears and splash up
         if (Math.random() > 0.95 && positions[i*3+1] < -4) {
             positions[i*3+1] = Math.random() * 8; // Splash up
             positions[i*3] = (Math.random() - 0.5) * 10;
         } else {
             positions[i*3+1] -= 0.2; // Fall back down
             if (positions[i*3+1] < -8) {
                 positions[i*3+1] = -8 + Math.random() * 2;
             }
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
      gear1.geometry.dispose();
      (gear1.material as THREE.Material).dispose();
      gear2.geometry.dispose();
      (gear2.material as THREE.Material).dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
