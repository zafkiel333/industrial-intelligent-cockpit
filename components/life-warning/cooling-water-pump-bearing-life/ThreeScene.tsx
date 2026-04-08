import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PumpBearingState } from './three-types';

interface ThreeSceneProps {
  state: PumpBearingState;
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
    camera.position.set(0, 10, 20);

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

    const spotLight = new THREE.SpotLight(0x06b6d4, 2); // cyan-500
    spotLight.position.set(0, -10, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Pump Bearing Housing Model ---
    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 16, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    pumpGroup.add(shaft);

    // Bearing Housing (Cutaway view)
    const housingGeo = new THREE.CylinderGeometry(3, 3, 6, 32, 1, false, 0, Math.PI * 1.5); // Cutaway
    
    // Custom shader for housing to show heat
    const housingMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemperature: { value: 40.0 },
        uBaseColor: { value: new THREE.Color(0x1e293b) }, // slate-800
        uHotColor: { value: new THREE.Color(0xef4444) } // red-500
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTemperature;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // Heat mapping (normalize temp 40-100C)
          float heatFactor = clamp((uTemperature - 40.0) / 60.0, 0.0, 1.0);
          vec3 color = mix(uBaseColor, uHotColor, heatFactor * 0.8);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.rotation.z = Math.PI / 2;
    housing.rotation.y = Math.PI / 4; // Orient cutaway towards camera
    pumpGroup.add(housing);

    // Bearing Inner Ring
    const innerRingGeo = new THREE.TorusGeometry(1.5, 0.3, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.1 });
    const innerRing = new THREE.Mesh(innerRingGeo, ringMat);
    innerRing.rotation.y = Math.PI / 2;
    pumpGroup.add(innerRing);

    // Bearing Outer Ring
    const outerRingGeo = new THREE.TorusGeometry(2.5, 0.3, 16, 64);
    const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
    outerRing.rotation.y = Math.PI / 2;
    pumpGroup.add(outerRing);

    // Rolling Elements (Balls)
    const ballCount = 12;
    const ballGeo = new THREE.SphereGeometry(0.4, 32, 32);
    
    // Custom shader for balls to show damage/spalling
    const ballMat = new THREE.ShaderMaterial({
      uniforms: {
        uDamage: { value: 0.0 }, // 0 to 1 based on high freq vibration
        uBaseColor: { value: new THREE.Color(0xf8fafc) }, // slate-50 (shiny steel)
        uDamageColor: { value: new THREE.Color(0x450a0a) } // red-950 (dark pits)
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
        uniform float uDamage;
        uniform vec3 uBaseColor;
        uniform vec3 uDamageColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          float noise = rand(vUv * 50.0);
          float damageFactor = 0.0;
          
          // Create pits if noise < damage threshold
          if (noise < uDamage * 0.2) {
             damageFactor = 1.0;
          }

          vec3 color = mix(uBaseColor, uDamageColor, damageFactor);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular (pits are not shiny)
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
          if (damageFactor > 0.5) spec = 0.0;
          
          gl_FragColor = vec4(color * diff + vec3(0.8) * spec, 1.0);
        }
      `
    });

    const ballsGroup = new THREE.Group();
    pumpGroup.add(ballsGroup);

    for (let i = 0; i < ballCount; i++) {
       const angle = (i / ballCount) * Math.PI * 2;
       const ball = new THREE.Mesh(ballGeo, ballMat);
       ball.position.set(0, Math.sin(angle) * 2, Math.cos(angle) * 2);
       ballsGroup.add(ball);
    }

    // --- Acoustic Emission Visualization (High Freq Waves) ---
    const waveCount = 5;
    const waveGeo = new THREE.TorusGeometry(3, 0.05, 8, 64);
    const waveMat = new THREE.MeshBasicMaterial({ 
       color: 0xef4444, // red-500
       transparent: true, 
       opacity: 0.0,
       blending: THREE.AdditiveBlending
    });
    
    const waves: { mesh: THREE.Mesh, scale: number, opacity: number }[] = [];
    for(let i=0; i<waveCount; i++) {
       const wave = new THREE.Mesh(waveGeo, waveMat.clone());
       wave.rotation.y = Math.PI / 2;
       pumpGroup.add(wave);
       waves.push({ mesh: wave, scale: 1 + i*0.2, opacity: 0 });
    }

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Housing Shader (Heat)
      housingMat.uniforms.uTemperature.value = currentState.temperature;

      // Update Ball Shader (Damage/Spalling based on Acceleration G)
      // Normal is < 1G. Damage starts showing > 2G. Max 10G.
      const damageFactor = clamp((currentState.vibrationAcceleration - 1) / 9, 0, 1);
      ballMat.uniforms.uDamage.value = damageFactor;

      // Rotate Shaft and Inner Ring
      // Speed based on load (visual only)
      const rps = 15 + (currentState.load / 10);
      const radPerFrame = rps * 0.016;
      shaft.rotation.x += radPerFrame;
      innerRing.rotation.x += radPerFrame;

      // Rotate Balls (Cage speed is roughly half shaft speed)
      ballsGroup.rotation.x += radPerFrame * 0.5;
      
      // Individual ball rotation (rolling)
      ballsGroup.children.forEach(ball => {
         ball.rotation.x -= radPerFrame * 1.5; // Spin relative to cage
      });

      // Apply Low Freq Vibration (Velocity mm/s) to whole housing
      if (currentState.vibrationVelocity > 2.8) {
         const jitterX = (Math.random() - 0.5) * (currentState.vibrationVelocity * 0.02);
         const jitterY = (Math.random() - 0.5) * (currentState.vibrationVelocity * 0.02);
         pumpGroup.position.set(jitterX, jitterY, 0);
      } else {
         pumpGroup.position.set(0, 0, 0);
      }

      // Animate Acoustic Emission Waves (High Freq Acceleration G)
      // Only show if acceleration is high (metal-to-metal contact/spalling)
      if (currentState.vibrationAcceleration > 3.0) {
         const intensity = clamp((currentState.vibrationAcceleration - 3) / 7, 0, 1);
         
         waves.forEach((w, index) => {
            w.scale += 0.05;
            if (w.scale > 2.5) {
               w.scale = 1.0; // Reset
               w.opacity = intensity * 0.8;
            } else {
               w.opacity -= 0.02; // Fade out
            }
            
            w.mesh.scale.set(w.scale, w.scale, w.scale);
            (w.mesh.material as THREE.Material).opacity = Math.max(0, w.opacity);
         });
      } else {
         waves.forEach(w => (w.mesh.material as THREE.Material).opacity = 0);
      }

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
      shaftGeo.dispose();
      shaftMat.dispose();
      housingGeo.dispose();
      housingMat.dispose();
      innerRingGeo.dispose();
      outerRingGeo.dispose();
      ringMat.dispose();
      ballGeo.dispose();
      ballMat.dispose();
      waveGeo.dispose();
      waveMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
