import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DrillPipeState } from './three-types';

interface ThreeSceneProps {
  state: DrillPipeState;
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
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xf59e0b, 2); // amber-500
    spotLight.position.set(0, 15, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Drill Pipe Model ---
    const drillGroup = new THREE.Group();
    scene.add(drillGroup);

    // Pipe Body
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 20, 32, 20); // More segments for bending
    
    // Custom shader for pipe to show torsion, bending, and fatigue cracks
    const pipeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTorque: { value: 0.0 }, // 0 to 1
        uThrust: { value: 0.0 }, // 0 to 1
        uFatigue: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x64748b) }, // slate-500
        uStressColor: { value: new THREE.Color(0xf59e0b) }, // amber-500
        uCrackColor: { value: new THREE.Color(0xef4444) } // red-500
      },
      vertexShader: `
        uniform float uTorque;
        uniform float uThrust;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vec3 pos = position;
          
          // Torsion (twist along Y axis)
          // Twist is higher at the bottom (y = -10) relative to top (y = 10)
          float twistAngle = (10.0 - pos.y) * uTorque * 0.05; 
          float c = cos(twistAngle);
          float s = sin(twistAngle);
          mat3 rotY = mat3(
              c, 0, s,
              0, 1, 0,
             -s, 0, c
          );
          pos = rotY * pos;

          // Bending (buckling due to thrust)
          // Assume buckling happens in the middle (y=0)
          float bendFactor = sin((pos.y + 10.0) / 20.0 * 3.14159);
          pos.x += bendFactor * uThrust * 0.5;

          // Recalculate normal after deformation (simplified)
          vNormal = normalize(normalMatrix * rotY * normal);
          
          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTorque;
        uniform float uThrust;
        uniform float uFatigue;
        uniform vec3 uBaseColor;
        uniform vec3 uStressColor;
        uniform vec3 uCrackColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        // Simplex noise for cracks
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
          // Base stress color based on combined torque and thrust
          float totalStress = max(uTorque, uThrust);
          vec3 color = mix(uBaseColor, uStressColor, totalStress * 0.7);
          
          // Fatigue cracks (sharp lines)
          // Generate a crack pattern
          float crackPattern = snoise(vUv * vec2(20.0, 100.0));
          crackPattern = smoothstep(0.8, 0.9, abs(crackPattern)); // Sharp edges
          
          // Cracks appear more in the middle (bending) and at joints (ends)
          float crackZone = sin(vUv.y * 3.14159) * 0.5 + 0.5; 
          
          if (crackPattern > 0.0 && uFatigue > 0.3) {
             float crackIntensity = (uFatigue - 0.3) / 0.7;
             color = mix(color, uCrackColor, crackPattern * crackIntensity * crackZone);
          }

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec, 1.0);
        }
      `
    });

    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    drillGroup.add(pipe);

    // Drill Bit (Bottom)
    const bitGeo = new THREE.ConeGeometry(1.2, 2, 16);
    const bitMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.4 });
    const bit = new THREE.Mesh(bitGeo, bitMat);
    bit.position.y = -11;
    bit.rotation.x = Math.PI;
    drillGroup.add(bit);

    // Joint (Top)
    const jointGeo = new THREE.CylinderGeometry(1.0, 1.0, 2, 32);
    const joint = new THREE.Mesh(jointGeo, bitMat);
    joint.position.y = 11;
    drillGroup.add(joint);

    // --- Rock/Dust Particles ---
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
       particlePos[i*3] = (Math.random() - 0.5) * 2;
       particlePos[i*3+1] = -11; // Start at bit
       particlePos[i*3+2] = (Math.random() - 0.5) * 2;
       
       particleVel[i*3] = (Math.random() - 0.5) * 0.2;
       particleVel[i*3+1] = Math.random() * 0.5; // Move up
       particleVel[i*3+2] = (Math.random() - 0.5) * 0.2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x78350f, // brown
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Pipe Shader
      pipeMat.uniforms.uTorque.value = clamp(currentState.torque / 20, 0, 1);
      pipeMat.uniforms.uThrust.value = clamp(currentState.axialThrust / 300, 0, 1);
      pipeMat.uniforms.uFatigue.value = clamp(currentState.fatigueDamage / 100, 0, 1);

      // Rotate Drill
      const speed = (currentState.rotationSpeed / 60) * Math.PI * 2; // rad/s
      drillGroup.rotation.y -= speed * 0.016; // dt approx

      // Add vibration based on torque and thrust
      const vibIntensity = (currentState.torque / 20) * (currentState.axialThrust / 300);
      if (vibIntensity > 0.2) {
         drillGroup.position.x = (Math.random() - 0.5) * vibIntensity * 0.5;
         drillGroup.position.z = (Math.random() - 0.5) * vibIntensity * 0.5;
      } else {
         drillGroup.position.set(0, 0, 0);
      }

      // Animate Dust Particles
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
         positions[i*3] += particleVel[i*3];
         positions[i*3+1] += particleVel[i*3+1];
         positions[i*3+2] += particleVel[i*3+2];

         // Swirl with drill
         const x = positions[i*3];
         const z = positions[i*3+2];
         const angle = Math.atan2(z, x) - speed * 0.016;
         const radius = Math.sqrt(x*x + z*z);
         positions[i*3] = Math.cos(angle) * radius;
         positions[i*3+2] = Math.sin(angle) * radius;

         if (positions[i*3+1] > 0) {
            // Reset to bottom
            positions[i*3] = (Math.random() - 0.5) * 2;
            positions[i*3+1] = -11;
            positions[i*3+2] = (Math.random() - 0.5) * 2;
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
      pipeGeo.dispose();
      pipeMat.dispose();
      bitGeo.dispose();
      bitMat.dispose();
      jointGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
