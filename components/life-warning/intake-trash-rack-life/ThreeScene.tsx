import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrashRackState } from './three-types';

interface ThreeSceneProps {
  state: TrashRackState;
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
    scene.fog = new THREE.FogExp2(0x315268, 0.01);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(20, 15, 30);

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
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2); // sky-400
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x0ea5e9, 1); // sky-500
    backLight.position.set(-10, -10, -10);
    scene.add(backLight);

    // --- Trash Rack Model ---
    const rackGroup = new THREE.Group();
    scene.add(rackGroup);

    const width = 20;
    const height = 15;
    const barSpacing = 1.5;
    const barThickness = 0.4;
    const numBars = Math.floor(width / barSpacing);

    // Custom shader for bars to show corrosion and stress
    const createBarMaterial = () => {
      return new THREE.ShaderMaterial({
        uniforms: {
          uCorrosion: { value: 0.0 },
          uStress: { value: 0.0 },
          uColorHealthy: { value: new THREE.Color(0x64748b) }, // slate-500
          uColorCorroded: { value: new THREE.Color(0x9a3412) }, // orange-800 (rust)
          uColorStress: { value: new THREE.Color(0xf43f5e) }   // rose-500
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
          uniform float uCorrosion;
          uniform float uStress;
          uniform vec3 uColorHealthy;
          uniform vec3 uColorCorroded;
          uniform vec3 uColorStress;
          
          varying vec2 vUv;
          varying vec3 vPosition;

          float rand(vec2 co){
              return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
          }

          void main() {
            // Base color mix based on corrosion
            vec3 baseColor = mix(uColorHealthy, uColorCorroded, uCorrosion);
            
            // Add noise texture for rust
            float noise = rand(vPosition.xy * 5.0 + vPosition.z * 2.0);
            baseColor *= mix(1.0, noise * 0.7 + 0.3, uCorrosion);

            // Add stress highlighting (concentrated at center where bending is highest)
            float stressZone = 1.0 - abs(vPosition.y) / 7.5; // 0 at ends, 1 at center
            float stressIntensity = uStress * stressZone;
            vec3 finalColor = mix(baseColor, uColorStress, stressIntensity * 0.8);
            
            // Basic lighting
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            vec3 normal = normalize(vec3(0.0, 0.0, 1.0)); // Simplified normal for flat bars
            float diff = max(dot(normal, lightDir), 0.3);

            gl_FragColor = vec4(finalColor * diff, 1.0);
          }
        `
      });
    };

    const bars: THREE.Mesh[] = [];

    // Vertical bars
    const barGeo = new THREE.BoxGeometry(barThickness, height, barThickness * 2);
    for (let i = 0; i < numBars; i++) {
      const barMat = createBarMaterial();
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.x = (i - numBars / 2) * barSpacing + barSpacing / 2;
      rackGroup.add(bar);
      bars.push(bar);
    }

    // Horizontal supports
    const supportGeo = new THREE.BoxGeometry(width, barThickness * 2, barThickness * 3);
    const supportMat = createBarMaterial();
    
    const support1 = new THREE.Mesh(supportGeo, supportMat);
    support1.position.y = height / 3;
    support1.position.z = -barThickness;
    rackGroup.add(support1);
    bars.push(support1);

    const support2 = new THREE.Mesh(supportGeo, supportMat);
    support2.position.y = -height / 3;
    support2.position.z = -barThickness;
    rackGroup.add(support2);
    bars.push(support2);

    // Frame
    const frameGeoV = new THREE.BoxGeometry(barThickness * 3, height + 2, barThickness * 4);
    const frameGeoH = new THREE.BoxGeometry(width + 2, barThickness * 3, barThickness * 4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }); // slate-700

    const frameL = new THREE.Mesh(frameGeoV, frameMat);
    frameL.position.x = -width / 2 - barThickness;
    rackGroup.add(frameL);

    const frameR = new THREE.Mesh(frameGeoV, frameMat);
    frameR.position.x = width / 2 + barThickness;
    rackGroup.add(frameR);

    const frameT = new THREE.Mesh(frameGeoH, frameMat);
    frameT.position.y = height / 2 + barThickness;
    rackGroup.add(frameT);

    const frameB = new THREE.Mesh(frameGeoH, frameMat);
    frameB.position.y = -height / 2 - barThickness;
    rackGroup.add(frameB);

    // --- Debris / Blockage ---
    const debrisGroup = new THREE.Group();
    rackGroup.add(debrisGroup);
    
    const debrisGeo = new THREE.DodecahedronGeometry(0.8, 1);
    const debrisMat = new THREE.MeshStandardMaterial({ color: 0x4d2c10, roughness: 0.9 }); // Brownish trash

    const debrisMeshes: THREE.Mesh[] = [];
    const maxDebris = 100;

    for (let i = 0; i < maxDebris; i++) {
       const debris = new THREE.Mesh(debrisGeo, debrisMat);
       // Position randomly on the front face of the rack
       debris.position.x = (Math.random() - 0.5) * width;
       debris.position.y = (Math.random() - 0.5) * height;
       debris.position.z = barThickness + Math.random() * 0.5;
       
       // Random scale
       const scale = 0.5 + Math.random();
       debris.scale.set(scale, scale, scale);
       
       debris.visible = false;
       debrisGroup.add(debris);
       debrisMeshes.push(debris);
    }

    // --- Water Flow Particles ---
    const particleCount = 1500;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    
    for(let i=0; i < particleCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * width * 1.5; // x
      posArray[i+1] = (Math.random() - 0.5) * height; // y
      posArray[i+2] = Math.random() * 20 + 5; // z (start in front of rack)
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x38bdf8, // sky-400
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Bar Shaders
      bars.forEach(bar => {
        const mat = bar.material as THREE.ShaderMaterial;
        mat.uniforms.uCorrosion.value = currentState.corrosionLevel;
        // Normalize stress (assume max ~200 MPa)
        mat.uniforms.uStress.value = Math.min(1.0, currentState.structuralStress / 200);
      });

      // Update Debris visibility based on blockage ratio
      const activeDebrisCount = Math.floor(currentState.blockageRatio * maxDebris);
      debrisMeshes.forEach((mesh, index) => {
         mesh.visible = index < activeDebrisCount;
      });

      // Simulate Vibration
      if (currentState.vibrationAmplitude > 0) {
         const vibX = Math.sin(time * 30) * currentState.vibrationAmplitude * 0.1;
         const vibZ = Math.cos(time * 40) * currentState.vibrationAmplitude * 0.1;
         rackGroup.position.set(vibX, 0, vibZ);
      } else {
         rackGroup.position.set(0, 0, 0);
      }

      // Simulate Bending under stress (Head loss)
      // Bend the center backwards (negative Z)
      const bendAmount = currentState.waterLevelDiff * 0.5;
      bars.forEach(bar => {
         if (bar.geometry.type === 'BoxGeometry' && bar.scale.y === 1) { // Vertical bars
            // Simple approximation: move the whole bar back slightly, but ideally we'd deform the geometry
            // For performance, we just translate based on stress
         }
      });
      // A simple way to visualize bending is rotating the whole group slightly or scaling
      // We'll just use the shader stress color for now as it's more performant

      // Update Water Particles
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const speed = currentState.flowVelocity * 0.2;
      
      for(let i=0; i < particleCount; i++) {
        // Move towards the rack (-z direction)
        positions[i*3 + 2] -= speed;

        // If particle hits the rack (z near 0)
        if (positions[i*3 + 2] < 2 && positions[i*3 + 2] > -2) {
           // Check if it hits blockage (simplified: just slow down based on ratio)
           if (Math.random() < currentState.blockageRatio) {
              positions[i*3 + 2] += speed * 0.8; // Slow down significantly
              // Add some turbulence
              positions[i*3] += (Math.random() - 0.5) * 0.5;
              positions[i*3+1] += (Math.random() - 0.5) * 0.5;
           }
        }

        // Reset particles that pass through
        if (positions[i*3 + 2] < -15) {
           positions[i*3] = (Math.random() - 0.5) * width * 1.5;
           positions[i*3+1] = (Math.random() - 0.5) * height;
           positions[i*3+2] = 20 + Math.random() * 10;
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
      barGeo.dispose();
      supportGeo.dispose();
      frameGeoV.dispose();
      frameGeoH.dispose();
      frameMat.dispose();
      debrisGeo.dispose();
      debrisMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      bars.forEach(b => (b.material as THREE.Material).dispose());
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
