import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PipeState } from './three-types';

interface ThreeSceneProps {
  state: PipeState;
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x0ea5e9, 2); // sky-500
    spotLight.position.set(-10, 10, 0);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const pipeGroup = new THREE.Group();
    scene.add(pipeGroup);

    // Pipe Geometry (Cutaway view)
    const pipeGeo = new THREE.CylinderGeometry(5, 5, 20, 64, 32, true, 0, Math.PI * 1.5);
    
    const pipeMat = new THREE.ShaderMaterial({
      uniforms: {
        uThickness: { value: 1.0 }, // 0 to 1 (1 is full thickness, 0 is worn)
        uCorrosion: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x475569) }, // slate-600
        uRustColor: { value: new THREE.Color(0x9a3412) }, // orange-800
        uPittingColor: { value: new THREE.Color(0x450a0a) } // red-950
      },
      vertexShader: `
        uniform float uThickness;
        uniform float uCorrosion;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ; m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Corrosion displacement (pitting)
          float noise = snoise(uv * 20.0);
          float pitting = smoothstep(0.2, 0.8, noise) * uCorrosion;
          
          // Shrink radius based on thickness loss and pitting
          // Normal points outward, so we move inward
          pos -= normal * ((1.0 - uThickness) * 0.5 + pitting * 0.3);

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uCorrosion;
        uniform vec3 uBaseColor;
        uniform vec3 uRustColor;
        uniform vec3 uPittingColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec3 color = uBaseColor;
          
          // Rust pattern
          float noise1 = rand(vUv * 5.0);
          float noise2 = rand(vUv * 20.0);
          
          float rustFactor = smoothstep(0.3, 1.0, uCorrosion * (noise1 * 0.5 + 0.5));
          color = mix(color, uRustColor, rustFactor);
          
          // Deep pitting pattern
          float pitFactor = smoothstep(0.7, 1.0, uCorrosion * noise2);
          color = mix(color, uPittingColor, pitFactor);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular (rust is less shiny)
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float specPower = mix(64.0, 8.0, rustFactor);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), specPower);
          
          gl_FragColor = vec4(color * diff + vec3(0.3) * spec, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipeGroup.add(pipe);

    // Fluid Flow (Particles)
    const particleCount = 2000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeed = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
       const radius = Math.random() * 4.5;
       const angle = Math.random() * Math.PI * 2;
       particlePos[i*3] = (Math.random() - 0.5) * 20; // X axis
       particlePos[i*3+1] = Math.cos(angle) * radius; // Y axis
       particlePos[i*3+2] = Math.sin(angle) * radius; // Z axis
       
       // Center flows faster
       particleSpeed[i] = 1.0 - (radius / 4.5) * 0.5 + Math.random() * 0.2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x0ea5e9, // sky-500
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Pipe Shader
      const thicknessFactor = Math.max(0, currentState.wallThickness / 12.0); // Assuming 12mm is new
      const corrosionFactor = Math.min(1, Math.max(0, (12.0 - currentState.wallThickness) / 6.0)); // Max corrosion at 6mm loss
      
      pipeMat.uniforms.uThickness.value = thicknessFactor;
      pipeMat.uniforms.uCorrosion.value = corrosionFactor;

      // Fluid Color based on pH (Acidic = more yellow/green, Neutral = blue)
      if (currentState.phValue < 5) {
          particleMat.color.setHex(0x84cc16); // lime-500 (acidic/corrosive)
      } else if (currentState.phValue < 6.5) {
          particleMat.color.setHex(0x0d9488); // teal-600
      } else {
          particleMat.color.setHex(0x0ea5e9); // sky-500
      }

      // Fluid Flow Animation
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const baseFlow = currentState.flowVelocity * 0.1;
      
      for(let i=0; i<particleCount; i++) {
         positions[i*3] += baseFlow * particleSpeed[i];
         
         // Turbulence based on pressure and velocity
         if (currentState.pressure > 2.5 || currentState.flowVelocity > 3.0) {
             positions[i*3+1] += (Math.random() - 0.5) * 0.1;
             positions[i*3+2] += (Math.random() - 0.5) * 0.1;
         }

         // Wrap around
         if (positions[i*3] > 10) {
             positions[i*3] = -10;
             const radius = Math.random() * 4.5;
             const angle = Math.random() * Math.PI * 2;
             positions[i*3+1] = Math.cos(angle) * radius;
             positions[i*3+2] = Math.sin(angle) * radius;
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
      pipeGeo.dispose();
      pipeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
