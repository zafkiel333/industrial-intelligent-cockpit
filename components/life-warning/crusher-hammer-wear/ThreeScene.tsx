import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HammerState } from './three-types';

interface ThreeSceneProps {
  state: HammerState;
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
    camera.position.set(0, 5, 25);

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
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xef4444, 2); // red-500
    spotLight.position.set(0, -10, 10);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Crusher Rotor Model ---
    const rotorGroup = new THREE.Group();
    scene.add(rotorGroup);

    // Central Shaft
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 10, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = Math.PI / 2;
    rotorGroup.add(shaft);

    // Rotor Discs
    const discGeo = new THREE.CylinderGeometry(3, 3, 0.5, 32);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.5 });
    
    const discPositions = [-4, -2, 0, 2, 4];
    discPositions.forEach(z => {
       const disc = new THREE.Mesh(discGeo, discMat);
       disc.rotation.x = Math.PI / 2;
       disc.position.z = z;
       rotorGroup.add(disc);
    });

    // Hammers
    const hammerCount = 6; // per row
    const rows = 4; // between discs
    const hammers: THREE.Mesh[] = [];

    // Custom shader for hammers to show wear
    const hammerMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x94a3b8) }, // slate-400 (new metal)
        uWearColor: { value: new THREE.Color(0x7f1d1d) } // red-900 (worn/hot)
      },
      vertexShader: `
        uniform float uWear;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          
          // Deform geometry based on wear (shrink the outer edge)
          vec3 pos = position;
          // Assuming hammer extends along Y axis. Shrink Y and X if Y > 0
          if (pos.y > 0.0) {
             pos.y -= uWear * 1.5; // Reduce length
             pos.x *= (1.0 - uWear * 0.3); // Round off corners
          }

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform vec3 uBaseColor;
        uniform vec3 uWearColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // Wear color is stronger at the tip (vUv.y close to 1)
          float tipFactor = smoothstep(0.5, 1.0, vUv.y);
          vec3 color = mix(uBaseColor, uWearColor, uWear * tipFactor);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec * (1.0 - uWear*tipFactor), 1.0);
        }
      `
    });

    const hammerGeo = new THREE.BoxGeometry(1.5, 4, 0.8);
    // Adjust UVs so y goes from 0 at bottom to 1 at top for the shader
    const uvs = hammerGeo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
        const y = hammerGeo.attributes.position.getY(i);
        // Box is height 4, from -2 to 2. Map to 0-1
        uvs.setY(i, (y + 2) / 4);
    }

    for (let r = 0; r < rows; r++) {
       const zPos = -3 + r * 2;
       for (let h = 0; h < hammerCount; h++) {
          const angle = (h / hammerCount) * Math.PI * 2 + (r % 2) * (Math.PI / hammerCount); // Staggered
          
          const hammerGroup = new THREE.Group();
          
          // Pin
          const pinGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16);
          const pin = new THREE.Mesh(pinGeo, shaftMat);
          pin.rotation.x = Math.PI / 2;
          pin.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, zPos);
          rotorGroup.add(pin);

          // Hammer
          const hammer = new THREE.Mesh(hammerGeo, hammerMat.clone());
          // Pivot point is at bottom
          hammer.position.y = 1.5; 
          
          hammerGroup.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, zPos);
          hammerGroup.rotation.z = angle - Math.PI/2; // Point outwards
          
          hammerGroup.add(hammer);
          rotorGroup.add(hammerGroup);
          hammers.push(hammer);
       }
    }

    // --- Material Particles (Rocks) ---
    const rockCount = 200;
    const rockGeo = new THREE.DodecahedronGeometry(0.5, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 }); // stone-500
    
    const rocks: { mesh: THREE.Mesh, vel: THREE.Vector3, active: boolean }[] = [];
    for(let i=0; i<rockCount; i++) {
       const rock = new THREE.Mesh(rockGeo, rockMat);
       rock.position.y = 1000; // Hidden
       scene.add(rock);
       rocks.push({ mesh: rock, vel: new THREE.Vector3(), active: false });
    }

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Hammer Shader (Wear)
      // Max wear depth might be ~50mm. Normalize to 0-1
      const wearFactor = clamp(currentState.wearDepth / 50, 0, 1);
      hammers.forEach(h => {
         (h.material as THREE.ShaderMaterial).uniforms.uWear.value = wearFactor;
      });

      // Rotate Rotor
      // Speed based on throughput (visual only)
      const rps = 10 + (currentState.throughput / 100);
      rotorGroup.rotation.z -= rps * 0.016;

      // Apply Vibration
      if (currentState.vibration > 10.0) {
         const jitterX = (Math.random() - 0.5) * (currentState.vibration * 0.01);
         const jitterY = (Math.random() - 0.5) * (currentState.vibration * 0.01);
         rotorGroup.position.set(jitterX, jitterY, 0);
      } else {
         rotorGroup.position.set(0, 0, 0);
      }

      // Animate Rocks (Falling and being crushed)
      // Spawn rate based on throughput
      const spawnRate = Math.floor(currentState.throughput / 50);
      let spawned = 0;

      rocks.forEach(rockObj => {
         if (rockObj.active) {
            rockObj.mesh.position.add(rockObj.vel);
            rockObj.vel.y -= 0.02; // Gravity
            
            // Collision with rotor area
            const dist = Math.sqrt(rockObj.mesh.position.x**2 + rockObj.mesh.position.y**2);
            if (dist < 6 && rockObj.mesh.position.y < 2 && rockObj.mesh.position.y > -4 && Math.abs(rockObj.mesh.position.z) < 5) {
               // Hit by hammer!
               // Shatter effect (shrink and fly away)
               rockObj.mesh.scale.multiplyScalar(0.8);
               
               // Deflect based on rotor rotation
               rockObj.vel.x = -2 + Math.random() * 4;
               rockObj.vel.y = -1 - Math.random() * 2; // Thrown down
               rockObj.vel.z = -2 + Math.random() * 4;
               
               // If too small, deactivate
               if (rockObj.mesh.scale.x < 0.2) {
                  rockObj.active = false;
                  rockObj.mesh.position.y = 1000;
               }
            }

            // Floor
            if (rockObj.mesh.position.y < -10) {
               rockObj.active = false;
               rockObj.mesh.position.y = 1000;
            }
         } else if (spawned < spawnRate && Math.random() > 0.5) {
            // Spawn new rock
            rockObj.active = true;
            rockObj.mesh.scale.set(1,1,1);
            // Size based on hardness (harder = bigger chunks visually)
            const size = 0.5 + (currentState.materialHardness / 10) * 0.5;
            rockObj.mesh.scale.multiplyScalar(size);
            
            rockObj.mesh.position.set((Math.random() - 0.5) * 4, 10, (Math.random() - 0.5) * 8);
            rockObj.vel.set(0, -0.2 - Math.random() * 0.2, 0);
            spawned++;
         }
      });

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
      discGeo.dispose();
      discMat.dispose();
      hammerGeo.dispose();
      hammerMat.dispose();
      rockGeo.dispose();
      rockMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
