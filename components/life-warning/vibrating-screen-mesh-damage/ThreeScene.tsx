import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ScreenMeshState } from './three-types';

interface ThreeSceneProps {
  state: ScreenMeshState;
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
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

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
    controls.enablePan = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xa855f7, 2); // purple-500
    spotLight.position.set(0, 20, 0);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Vibrating Screen Model ---
    const screenGroup = new THREE.Group();
    scene.add(screenGroup);

    // Screen Frame
    const frameGeo = new THREE.BoxGeometry(12, 1, 16);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    screenGroup.add(frame);

    // Screen Mesh (The critical component)
    const meshGeo = new THREE.PlaneGeometry(11, 15, 64, 64);
    
    // Custom shader for mesh to show wear, holes, and vibration stress
    const meshMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uLoad: { value: 0.0 }, // 0 to 1
        uTime: { value: 0.0 },
        uBaseColor: { value: new THREE.Color(0x94a3b8) }, // slate-400 (polyurethane/steel)
        uWearColor: { value: new THREE.Color(0xfcd34d) }, // amber-300 (worn)
        uHoleColor: { value: new THREE.Color(0xef4444) } // red-500 (broken)
      },
      vertexShader: `
        uniform float uLoad;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Sagging due to load (more in the middle)
          float sag = sin(uv.x * 3.14159) * sin(uv.y * 3.14159);
          pos.z -= sag * uLoad * 1.5; // Plane is rotated, so Z is down

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform vec3 uBaseColor;
        uniform vec3 uWearColor;
        uniform vec3 uHoleColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        // Simplex noise
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
          // Create a grid pattern for the mesh
          float gridX = abs(fract(vUv.x * 50.0) - 0.5) * 2.0;
          float gridY = abs(fract(vUv.y * 70.0) - 0.5) * 2.0;
          float grid = max(gridX, gridY);
          
          // Discard fragments to make holes in the mesh
          if (grid < 0.8) discard;

          vec3 color = uBaseColor;
          
          // Wear pattern (concentrated where material hits and flows)
          // Material usually hits near the top (vUv.y > 0.7) and flows down
          float wearArea = smoothstep(0.0, 1.0, vUv.y) * sin(vUv.x * 3.14159);
          float wearNoise = snoise(vUv * 10.0) * 0.5 + 0.5;
          float localWear = uWear * wearArea * wearNoise;
          
          color = mix(color, uWearColor, clamp(localWear * 2.0, 0.0, 1.0));

          // Simulate broken wires/holes
          // If wear is very high, create larger holes
          if (localWear > 0.8) {
              // Create a jagged hole
              float holeNoise = snoise(vUv * 50.0);
              if (holeNoise > 0.2) {
                  discard; // Actual hole
              } else {
                  color = uHoleColor; // Edge of hole
              }
          }

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(meshGeo, meshMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.51; // Just above frame
    screenGroup.add(mesh);

    // Tilt the screen
    screenGroup.rotation.x = Math.PI / 12; // 15 degrees

    // --- Material Particles ---
    const particleCount = 1500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);
    const particleSize = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
       // Start at the top of the screen
       particlePos[i*3] = (Math.random() - 0.5) * 10;
       particlePos[i*3+1] = 5 + Math.random() * 2;
       particlePos[i*3+2] = -7 + Math.random() * 2;
       
       particleVel[i*3] = 0;
       particleVel[i*3+1] = 0;
       particleVel[i*3+2] = 0;
       
       // Mix of sizes (some pass through, some don't)
       particleSize[i] = Math.random();
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('aSize', new THREE.BufferAttribute(particleSize, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x78350f) } // brown
      },
      vertexShader: `
        attribute float aSize;
        varying float vSize;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (aSize * 15.0 + 5.0) * (10.0 / -mvPosition.z);
          vSize = aSize;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vSize;
        void main() {
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if(ll > 0.5) discard;
          
          // Smaller particles are lighter
          vec3 color = mix(uColor, vec3(0.6), 1.0 - vSize);
          gl_FragColor = vec4(color, 0.8);
        }
      `,
      transparent: true
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Mesh Shader
      meshMat.uniforms.uWear.value = clamp(currentState.meshWear / 100, 0, 1);
      meshMat.uniforms.uLoad.value = clamp(currentState.materialLoad / 500, 0, 1);
      meshMat.uniforms.uTime.value = time;

      // Screen Vibration
      // Circular or linear vibration based on amplitude and frequency
      const freq = currentState.vibrationFrequency * Math.PI * 2;
      const amp = currentState.vibrationAmplitude * 0.05; // Scale for visual
      
      screenGroup.position.y = Math.sin(time * freq) * amp;
      screenGroup.position.z = Math.cos(time * freq) * amp;

      // Particle Physics
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const sizes = particleSystem.geometry.attributes.aSize.array as Float32Array;
      
      // Load determines how many particles are active
      const activeParticles = Math.floor((currentState.materialLoad / 500) * particleCount);

      for(let i=0; i<particleCount; i++) {
         if (i > activeParticles) {
             positions[i*3+1] = -100; // Hide inactive
             continue;
         }

         let x = positions[i*3];
         let y = positions[i*3+1];
         let z = positions[i*3+2];

         // Gravity
         particleVel[i*3+1] -= 0.01;

         // Screen collision
         // Screen is tilted 15 deg. Equation of plane: y = -z * tan(15)
         const screenY = -z * Math.tan(Math.PI / 12) + screenGroup.position.y;
         
         if (y < screenY && y > screenY - 1.0 && z > -8 && z < 8 && x > -5.5 && x < 5.5) {
             // Hit the screen
             
             // Does it pass through?
             // Smaller particles pass, larger bounce
             // If mesh is worn/broken, larger particles can pass
             const passThreshold = 0.3 + (currentState.meshWear / 100) * 0.5;
             
             if (sizes[i] < passThreshold) {
                 // Pass through (fall straight down)
                 particleVel[i*3+1] *= 0.8; 
             } else {
                 // Bounce and move forward (due to vibration and tilt)
                 y = screenY;
                 particleVel[i*3+1] = Math.random() * 0.2 + amp * 2; // Bounce up
                 particleVel[i*3+2] = 0.05 + Math.random() * 0.05; // Move forward
                 
                 // Spread out slightly
                 particleVel[i*3] += (Math.random() - 0.5) * 0.02;
             }
         }

         x += particleVel[i*3];
         y += particleVel[i*3+1];
         z += particleVel[i*3+2];

         // Reset if falls off bottom or passes through
         if (y < -10 || z > 10) {
             x = (Math.random() - 0.5) * 10;
             y = 5 + Math.random() * 2;
             z = -7 + Math.random() * 2;
             particleVel[i*3] = 0;
             particleVel[i*3+1] = 0;
             particleVel[i*3+2] = 0;
         }

         positions[i*3] = x;
         positions[i*3+1] = y;
         positions[i*3+2] = z;
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
      frameGeo.dispose();
      frameMat.dispose();
      meshGeo.dispose();
      meshMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
