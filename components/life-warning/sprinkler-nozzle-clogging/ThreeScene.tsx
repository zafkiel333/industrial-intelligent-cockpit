import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { NozzleState } from './three-types';

interface ThreeSceneProps {
  state: NozzleState;
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x38bdf8, 2); // sky-400
    spotLight.position.set(0, 10, 0);
    spotLight.angle = Math.PI / 2;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const nozzleGroup = new THREE.Group();
    scene.add(nozzleGroup);

    // Nozzle Body
    const bodyGeo = new THREE.CylinderGeometry(1.5, 2, 4, 32);
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0xe2e8f0, // slate-200 (stainless steel)
      metalness: 0.8, 
      roughness: 0.3 
    });
    const body = new THREE.Mesh(bodyGeo, metalMat);
    body.position.y = 2;
    nozzleGroup.add(body);

    // Nozzle Tip (where clogging happens)
    const tipGeo = new THREE.ConeGeometry(1.5, 2, 32);
    
    // Shader to show clogging (mineral deposits/rust)
    const tipMat = new THREE.ShaderMaterial({
      uniforms: {
        uClogging: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0xe2e8f0) },
        uScaleColor: { value: new THREE.Color(0xd97706) } // amber-600 (calcium/rust scale)
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
        uniform float uClogging;
        uniform vec3 uBaseColor;
        uniform vec3 uScaleColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec3 color = uBaseColor;
          
          // Scale builds up near the tip (vUv.y approaches 1)
          float tipArea = smoothstep(0.0, 1.0, vUv.y);
          float noise = rand(vUv * 20.0);
          
          float scaleFactor = smoothstep(0.5, 1.0, uClogging * tipArea * (0.5 + noise * 0.5) * 2.0);
          color = mix(color, uScaleColor, clamp(scaleFactor, 0.0, 1.0));

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), mix(64.0, 8.0, scaleFactor));
          
          gl_FragColor = vec4(color * diff + vec3(0.3) * spec, 1.0);
        }
      `
    });

    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = -1;
    tip.rotation.x = Math.PI; // point down
    nozzleGroup.add(tip);

    // Water Spray Particles
    const particleCount = 3000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);
    
    for(let i=0; i<particleCount; i++) {
       particlePos[i*3] = 0;
       particlePos[i*3+1] = -2; // Start at tip
       particlePos[i*3+2] = 0;
       
       particleVel[i*3] = 0;
       particleVel[i*3+1] = 0;
       particleVel[i*3+2] = 0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x38bdf8, // sky-400
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Nozzle Shader
      const clogFactor = clamp(currentState.cloggingRate / 100, 0, 1);
      tipMat.uniforms.uClogging.value = clogFactor;

      // Spray Physics
      // As clogging increases, spray angle decreases (becomes a jet) and flow rate drops
      const baseAngle = Math.PI / 3; // 60 degrees
      const currentAngle = baseAngle * (1.0 - clogFactor * 0.8); // Narrows as it clogs
      
      const activeParticles = Math.floor((currentState.flowRate / 100) * particleCount);
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;

      // Pressure increases velocity
      const velocityMag = currentState.waterPressure * 0.5;

      for(let i=0; i<particleCount; i++) {
         if (i > activeParticles) {
             positions[i*3+1] = 100; // Hide
             continue;
         }

         let x = positions[i*3];
         let y = positions[i*3+1];
         let z = positions[i*3+2];

         // If particle is reset or hidden, spawn it at the nozzle
         if (y > 0 || y < -15) {
             x = (Math.random() - 0.5) * 0.5;
             y = -2;
             z = (Math.random() - 0.5) * 0.5;
             
             // Random direction within the cone
             const theta = Math.random() * Math.PI * 2;
             const phi = Math.random() * currentAngle;
             
             // Add some irregularity if clogged
             let irregularPhi = phi;
             if (clogFactor > 0.5 && Math.random() > 0.8) {
                 irregularPhi = phi * 2.0; // Strays
             }

             particleVel[i*3] = Math.sin(irregularPhi) * Math.cos(theta) * velocityMag;
             particleVel[i*3+1] = -Math.cos(irregularPhi) * velocityMag;
             particleVel[i*3+2] = Math.sin(irregularPhi) * Math.sin(theta) * velocityMag;
         }

         // Gravity
         particleVel[i*3+1] -= 0.01;

         x += particleVel[i*3];
         y += particleVel[i*3+1];
         z += particleVel[i*3+2];

         positions[i*3] = x;
         positions[i*3+1] = y;
         positions[i*3+2] = z;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Color based on turbidity
      if (currentState.waterTurbidity > 50) {
          particleMat.color.setHex(0x94a3b8); // slate-400 (dirty water)
      } else {
          particleMat.color.setHex(0x38bdf8); // sky-400 (clean)
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
      bodyGeo.dispose();
      metalMat.dispose();
      tipGeo.dispose();
      tipMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
