import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FanBladeState } from './three-types';

interface ThreeSceneProps {
  state: FanBladeState;
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
    dirLight.position.set(5, 10, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x06b6d4, 2); // cyan-500
    spotLight.position.set(0, 0, 15);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Fan Model ---
    const fanGroup = new THREE.Group();
    scene.add(fanGroup);

    // Hub
    const hubGeo = new THREE.CylinderGeometry(2, 2, 2, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    fanGroup.add(hub);

    // Blades
    const bladeCount = 8;
    const blades: THREE.Mesh[] = [];
    
    // Custom shader for blades to show stress (vibration) and dust
    const bladeMat = new THREE.ShaderMaterial({
      uniforms: {
        uStress: { value: 0.0 }, // 0 to 1
        uDust: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x94a3b8) }, // steel
        uStressColor: { value: new THREE.Color(0xef4444) }, // red
        uDustColor: { value: new THREE.Color(0x78350f) } // brown
      },
      vertexShader: `
        uniform float uStress;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Bending deformation based on stress (mostly at the tip)
          // Assume blade extends along Y axis
          float bendFactor = pow(pos.y / 6.0, 2.0);
          pos.z += bendFactor * uStress * 2.0; // Bend backwards

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uStress;
        uniform float uDust;
        uniform vec3 uBaseColor;
        uniform vec3 uStressColor;
        uniform vec3 uDustColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Stress color concentrated at the root (y near 0)
          float stressZone = smoothstep(2.0, 0.0, vUv.y * 6.0); // Assuming y goes 0 to 6
          vec3 color = mix(uBaseColor, uStressColor, uStress * stressZone);
          
          // Dust accumulation (noisy)
          float noise = rand(vUv * 50.0);
          if (noise < uDust) {
             color = mix(color, uDustColor, 0.8);
          }

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    // Create a curved blade shape
    const shape = new THREE.Shape();
    shape.moveTo(-1, 0);
    shape.quadraticCurveTo(-1.5, 3, -0.5, 6);
    shape.lineTo(0.5, 6);
    shape.quadraticCurveTo(1.5, 3, 1, 0);
    shape.lineTo(-1, 0);

    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 };
    const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Adjust UVs for the shader
    const posAttr = bladeGeo.attributes.position;
    const uvAttr = bladeGeo.attributes.uv;
    for(let i=0; i<posAttr.count; i++) {
        uvAttr.setY(i, posAttr.getY(i) / 6.0); // Normalize Y to 0-1
    }

    for (let i = 0; i < bladeCount; i++) {
       const angle = (i / bladeCount) * Math.PI * 2;
       const blade = new THREE.Mesh(bladeGeo, bladeMat.clone());
       
       // Position at edge of hub
       blade.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
       
       // Rotate to face outward
       blade.rotation.z = angle - Math.PI/2;
       
       // Pitch angle
       blade.rotation.x = 0.3;
       
       fanGroup.add(blade);
       blades.push(blade);
    }

    // --- Airflow Particles ---
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
       particlePos[i*3] = (Math.random() - 0.5) * 16;
       particlePos[i*3+1] = (Math.random() - 0.5) * 16;
       particlePos[i*3+2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x22d3ee, // cyan-400
      transparent: true,
      opacity: 0.4,
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

      // Update Blade Shaders
      const stressFactor = clamp(currentState.vibrationAmplitude / 10, 0, 1);
      const dustFactor = clamp(currentState.dustAccumulation / 5, 0, 1);
      
      blades.forEach(blade => {
         const mat = blade.material as THREE.ShaderMaterial;
         // Oscillating stress based on vibration frequency
         const vibOscillation = Math.sin(time * currentState.vibrationFrequency * Math.PI * 2);
         mat.uniforms.uStress.value = stressFactor * (0.5 + 0.5 * vibOscillation);
         mat.uniforms.uDust.value = dustFactor;
      });

      // Rotate Fan
      // Speed based on airflow
      const speed = currentState.airFlow * 0.005;
      fanGroup.rotation.z -= speed;

      // Apply overall vibration to the fan group
      if (currentState.vibrationAmplitude > 2.0) {
         const jitterX = (Math.random() - 0.5) * (currentState.vibrationAmplitude * 0.02);
         const jitterY = (Math.random() - 0.5) * (currentState.vibrationAmplitude * 0.02);
         fanGroup.position.set(jitterX, jitterY, 0);
      } else {
         fanGroup.position.set(0, 0, 0);
      }

      // Animate Airflow
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
         // Move particles forward (Z axis)
         positions[i*3+2] += speed * 20;
         
         // Add some swirl based on fan rotation
         const x = positions[i*3];
         const y = positions[i*3+1];
         const radius = Math.sqrt(x*x + y*y);
         if (radius > 2 && radius < 8) {
            const angle = Math.atan2(y, x) - speed * 0.5;
            positions[i*3] = Math.cos(angle) * radius;
            positions[i*3+1] = Math.sin(angle) * radius;
         }

         if (positions[i*3+2] > 10) {
            positions[i*3+2] = -10;
            positions[i*3] = (Math.random() - 0.5) * 16;
            positions[i*3+1] = (Math.random() - 0.5) * 16;
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
      hubGeo.dispose();
      hubMat.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
