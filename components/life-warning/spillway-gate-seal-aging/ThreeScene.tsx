import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SealState } from './three-types';

interface ThreeSceneProps {
  state: SealState;
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
    scene.background = new THREE.Color(0x0f172a); // slate-900
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x0088ff, 2, 20);
    blueLight.position.set(-5, 0, 5);
    scene.add(blueLight);

    // --- Gate Seal Model (P-type rubber seal cross-section) ---
    const sealGroup = new THREE.Group();
    scene.add(sealGroup);

    // Gate Structure (Steel)
    const gateGeo = new THREE.BoxGeometry(10, 15, 2);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 }); // slate-600
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(-5, 0, 0);
    sealGroup.add(gate);

    // Embedded Part (Concrete/Steel wall)
    const wallGeo = new THREE.BoxGeometry(2, 15, 10);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 }); // slate-400
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(2, 0, -4);
    sealGroup.add(wall);

    // Rubber Seal (P-shape)
    // We'll use a custom shader to deform it based on compression and show aging
    const sealLength = 14;
    const sealRadius = 1.5;
    
    // Create a P-shape profile
    const shape = new THREE.Shape();
    shape.moveTo(0, -1);
    shape.lineTo(2, -1);
    shape.lineTo(2, 1);
    shape.lineTo(0, 1);
    shape.absarc(0, 0, sealRadius, Math.PI/2, Math.PI*1.5, false);

    const extrudeSettings = {
      depth: sealLength,
      bevelEnabled: false,
      steps: 20 // More steps for smoother deformation
    };

    const sealGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    sealGeo.center();
    sealGeo.rotateX(Math.PI / 2); // Align vertically

    const sealMat = new THREE.ShaderMaterial({
      uniforms: {
        uCompression: { value: 0.0 },
        uAging: { value: 0.0 },
        uColorNew: { value: new THREE.Color(0x111111) }, // Black rubber
        uColorAged: { value: new THREE.Color(0x554433) }, // Gray/Brownish cracked rubber
        uTime: { value: 0.0 }
      },
      vertexShader: `
        uniform float uCompression;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normal;
          
          vec3 pos = position;
          
          // Deform the bulb part (x < 0 in local space) based on compression
          // The wall is pushing from the positive X direction
          if (pos.x > 0.0) {
             // Compress the bulb inwards (negative X)
             // The closer to the edge (x ~ 1.5), the more it compresses
             float compressFactor = smoothstep(0.0, 1.5, pos.x);
             pos.x -= uCompression * compressFactor;
             
             // Bulge outwards (Z direction) to conserve volume
             float bulgeFactor = sin(pos.x * 3.14159 / 1.5);
             pos.z += uCompression * 0.5 * bulgeFactor * sign(pos.z);
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uAging;
        uniform vec3 uColorNew;
        uniform vec3 uColorAged;
        uniform float uTime;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Base color mix
          vec3 color = mix(uColorNew, uColorAged, uAging);
          
          // Add "cracks" based on aging
          float noise1 = rand(vPosition.xy * 10.0);
          float noise2 = rand(vPosition.yz * 15.0);
          float crackPattern = smoothstep(0.8, 1.0, noise1 * noise2);
          
          // Cracks are deeper/darker
          color = mix(color, vec3(0.0), crackPattern * uAging);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular highlight (rubber gets less shiny as it ages)
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float specAngle = max(dot(halfDir, vNormal), 0.0);
          float specular = pow(specAngle, 32.0) * (1.0 - uAging);

          gl_FragColor = vec4(color * diff + vec3(0.2) * specular, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.position.set(0, 0, 0);
    sealGroup.add(seal);

    // --- Water Leakage Particles ---
    const particleCount = 1000;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velArray = [];
    
    for(let i=0; i < particleCount; i++) {
      // Start particles near the seal interface
      posArray[i*3] = 1.0 + Math.random() * 0.5;
      posArray[i*3+1] = (Math.random() - 0.5) * sealLength;
      posArray[i*3+2] = (Math.random() - 0.5) * 2;
      
      velArray.push({
         x: Math.random() * 0.1,
         y: -0.1 - Math.random() * 0.2, // Fall down
         z: (Math.random() - 0.5) * 0.1
      });
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x00aaff,
      transparent: true,
      opacity: 0.6,
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

      // Update Seal Shader
      sealMat.uniforms.uCompression.value = currentState.compression;
      sealMat.uniforms.uAging.value = currentState.agingFactor;
      sealMat.uniforms.uTime.value = time;

      // Move the wall to simulate compression
      // Base position is x=2, seal radius is 1.5. Compression reduces distance.
      wall.position.x = 1.5 + (1.5 - currentState.compression);

      // Update Water Particles based on leakage rate
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      
      // Determine how many particles are active based on leakage
      // Max leakage ~ 100 L/min -> all particles active
      const activeParticles = Math.floor((currentState.leakageRate / 100) * particleCount);
      
      for(let i=0; i < particleCount; i++) {
        if (i < activeParticles) {
           positions[i*3] += velArray[i].x * (currentState.pressure / 10); // Pressure pushes water out
           positions[i*3+1] += velArray[i].y;
           positions[i*3+2] += velArray[i].z;

           // Reset if they fall too far
           if (positions[i*3+1] < -10) {
              // Respawn at the seal gap
              positions[i*3] = wall.position.x - 0.5;
              positions[i*3+1] = (Math.random() - 0.5) * sealLength;
              positions[i*3+2] = (Math.random() - 0.5) * 2;
           }
        } else {
           // Hide inactive particles far away
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
      gateGeo.dispose();
      gateMat.dispose();
      wallGeo.dispose();
      wallMat.dispose();
      sealGeo.dispose();
      sealMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
