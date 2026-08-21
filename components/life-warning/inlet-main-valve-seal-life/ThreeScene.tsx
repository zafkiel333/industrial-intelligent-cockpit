import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ValveSealState } from './three-types';

interface ThreeSceneProps {
  state: ValveSealState;
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
    camera.position.set(20, 15, 25);

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

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x14b8a6, 2); // teal-500
    spotLight.position.set(-10, 10, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Valve Model ---
    const valveGroup = new THREE.Group();
    scene.add(valveGroup);

    // Valve Body (Cutaway)
    const bodyRadius = 8;
    const bodyLength = 10;
    
    // Create a half-cylinder for the body to see inside
    const bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyLength, 32, 1, false, 0, Math.PI);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, // slate-600
      metalness: 0.7, 
      roughness: 0.4,
      side: THREE.DoubleSide
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    valveGroup.add(body);

    // Valve Disc (Butterfly type)
    const discGeo = new THREE.CylinderGeometry(bodyRadius - 0.5, bodyRadius - 0.5, 1.5, 32);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = Math.PI / 2;
    valveGroup.add(disc);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, bodyRadius * 2.5, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    valveGroup.add(shaft);

    // Seal Ring (Rubber/Teflon on the edge of the disc)
    const sealRadius = bodyRadius - 0.5;
    const sealTube = 0.3;
    const sealGeo = new THREE.TorusGeometry(sealRadius, sealTube, 16, 64);
    
    // Custom shader for seal to show aging and stress
    const sealMat = new THREE.ShaderMaterial({
      uniforms: {
        uAging: { value: 0.0 },
        uPressure: { value: 0.0 },
        uColorNew: { value: new THREE.Color(0x111111) }, // Black rubber
        uColorAged: { value: new THREE.Color(0x555555) }, // Grayish aged rubber
        uColorStress: { value: new THREE.Color(0xf43f5e) } // rose-500 for high pressure areas
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
        uniform float uAging;
        uniform float uPressure;
        uniform vec3 uColorNew;
        uniform vec3 uColorAged;
        uniform vec3 uColorStress;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Base color based on aging
          vec3 color = mix(uColorNew, uColorAged, uAging);
          
          // Add cracks/texture based on aging
          float noise = rand(vUv * 50.0);
          float crack = smoothstep(0.8, 1.0, noise) * uAging;
          color = mix(color, vec3(0.0), crack);

          // Add stress color based on pressure (concentrated at the contact points)
          // Assume contact points are at top and bottom (y ~ +/- radius)
          float stressZone = abs(sin(vUv.x * 3.14159 * 2.0)); // simplified stress distribution
          float stressIntensity = clamp((uPressure - 2.0) / 3.0, 0.0, 1.0) * stressZone;
          color = mix(color, uColorStress, stressIntensity * 0.8);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular (rubber loses shine as it ages)
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 16.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.2) * spec * (1.0 - uAging), 1.0);
        }
      `
    });
    
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.rotation.x = Math.PI / 2;
    disc.add(seal); // Attach seal to disc

    // --- Water Leakage Particles ---
    const particleCount = 1500;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velArray = [];
    
    for(let i=0; i < particleCount; i++) {
      // Start particles around the seal perimeter
      const angle = Math.random() * Math.PI * 2;
      const r = sealRadius + (Math.random() - 0.5) * 0.5;
      
      posArray[i*3] = Math.cos(angle) * r;
      posArray[i*3+1] = (Math.random() - 0.5) * 1.5; // Slightly offset from disc center
      posArray[i*3+2] = Math.sin(angle) * r;
      
      velArray.push({
         x: (Math.random() - 0.5) * 0.1,
         y: 0.1 + Math.random() * 0.3, // Flow direction (along Y axis of the cylinder body)
         z: (Math.random() - 0.5) * 0.1
      });
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x0ea5e9, // sky-500
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    // Rotate particle system to match body orientation
    particleSystem.rotation.z = Math.PI / 2;
    valveGroup.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let valveAngle = 0;
    let isOpening = false;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Simulate valve opening/closing periodically for visual effect
      if (Math.sin(time * 0.5) > 0.9) isOpening = true;
      if (Math.sin(time * 0.5) < -0.9) isOpening = false;

      if (isOpening && valveAngle < Math.PI / 4) {
         valveAngle += 0.01;
      } else if (!isOpening && valveAngle > 0) {
         valveAngle -= 0.01;
      }
      
      disc.rotation.z = valveAngle;
      shaft.rotation.y = valveAngle;

      // Update Seal Shader
      sealMat.uniforms.uAging.value = currentState.agingFactor;
      sealMat.uniforms.uPressure.value = currentState.pressure;

      // Update Water Particles based on leakage rate and valve position
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      
      // If valve is open, massive flow. If closed, flow depends on leakage rate.
      let activeParticles = 0;
      let flowSpeed = 0;

      if (valveAngle > 0.05) {
         activeParticles = particleCount; // Full flow
         flowSpeed = 0.5;
      } else {
         // Leakage flow
         activeParticles = Math.floor((currentState.leakageRate / 50) * particleCount);
         flowSpeed = 0.1 + (currentState.pressure * 0.05);
      }

      for(let i=0; i < particleCount; i++) {
        if (i < activeParticles) {
           // Move along Y axis (which is the pipe direction due to rotation)
           positions[i*3+1] += velArray[i].y * flowSpeed;
           positions[i*3] += velArray[i].x * flowSpeed;
           positions[i*3+2] += velArray[i].z * flowSpeed;

           // Reset if they go too far
           if (positions[i*3+1] > bodyLength / 2) {
              const angle = Math.random() * Math.PI * 2;
              const r = sealRadius + (Math.random() - 0.5) * 0.5;
              positions[i*3] = Math.cos(angle) * r;
              positions[i*3+1] = 0; // Reset to disc position
              positions[i*3+2] = Math.sin(angle) * r;
           }
        } else {
           // Hide inactive particles
           positions[i*3+1] = 1000;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

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
      bodyGeo.dispose();
      bodyMat.dispose();
      discGeo.dispose();
      discMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      sealGeo.dispose();
      sealMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
