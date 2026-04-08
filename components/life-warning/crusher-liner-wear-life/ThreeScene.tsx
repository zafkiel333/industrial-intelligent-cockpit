import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LinerState } from './three-types';

interface ThreeSceneProps {
  state: LinerState;
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

    const spotLight = new THREE.SpotLight(0x3b82f6, 2); // blue-500
    spotLight.position.set(0, -10, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Crusher Mantle and Concave (Liner) ---
    const crusherGroup = new THREE.Group();
    scene.add(crusherGroup);

    // Mantle (Inner moving part)
    const mantleGeo = new THREE.ConeGeometry(3, 6, 32);
    const mantleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const mantle = new THREE.Mesh(mantleGeo, mantleMat);
    mantle.position.y = 0;
    crusherGroup.add(mantle);

    // Concave (Outer stationary liner - Cutaway)
    const concaveGeo = new THREE.CylinderGeometry(4, 3.5, 6, 32, 1, true, 0, Math.PI * 1.5);
    
    // Custom shader for liner to show wear depth
    const concaveMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uImpact: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x475569) }, // slate-600
        uWearColor: { value: new THREE.Color(0xf87171) }, // red-400 (worn area)
        uImpactColor: { value: new THREE.Color(0x60a5fa) } // blue-400 (impact glow)
      },
      vertexShader: `
        uniform float uWear;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Wear makes the inner radius larger (move vertices outward along normal)
          // Wear is concentrated in the lower crushing zone
          float wearZone = smoothstep(0.8, 0.2, uv.y);
          pos += normal * uWear * wearZone * 0.5;

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform float uImpact;
        uniform vec3 uBaseColor;
        uniform vec3 uWearColor;
        uniform vec3 uImpactColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          float wearZone = smoothstep(0.8, 0.2, vUv.y);
          vec3 color = mix(uBaseColor, uWearColor, uWear * wearZone);
          
          // Add impact glow
          color = mix(color, uImpactColor, uImpact * wearZone * 0.5);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const concave = new THREE.Mesh(concaveGeo, concaveMat);
    concave.position.y = 0;
    crusherGroup.add(concave);

    // --- Rocks Particle System ---
    const rockCount = 100;
    const rockGeo = new THREE.DodecahedronGeometry(0.2);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.9 });
    
    const rocksGroup = new THREE.Group();
    scene.add(rocksGroup);

    const rocks: { mesh: THREE.Mesh, vel: THREE.Vector3, life: number }[] = [];
    for(let i=0; i<rockCount; i++) {
       const rock = new THREE.Mesh(rockGeo, rockMat);
       rock.position.set(0, 1000, 0); // Hide initially
       rocksGroup.add(rock);
       rocks.push({ mesh: rock, vel: new THREE.Vector3(), life: 0 });
    }

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Liner Shader
      const wearFactor = clamp(currentState.wearDepth / 50, 0, 1);
      concaveMat.uniforms.uWear.value = wearFactor;
      
      const impactFactor = clamp(currentState.impactForce / 500, 0, 1);
      concaveMat.uniforms.uImpact.value = impactFactor;

      // Gyratory motion of mantle
      const speed = 10;
      const eccentricity = 0.2;
      mantle.rotation.x = Math.sin(time * speed) * eccentricity;
      mantle.rotation.z = Math.cos(time * speed) * eccentricity;
      mantle.rotation.y -= 0.05;

      // Animate Rocks
      const activeRocks = Math.floor(clamp((currentState.throughput / 1000) * rockCount, 0, rockCount));

      rocks.forEach((rockData, i) => {
         if (rockData.life > 0) {
            rockData.mesh.position.add(rockData.vel);
            rockData.vel.y -= 0.01; // Gravity
            
            // Interaction with mantle/concave (simplified)
            const dist = Math.sqrt(rockData.mesh.position.x**2 + rockData.mesh.position.z**2);
            if (dist < 3 && rockData.mesh.position.y > -3 && rockData.mesh.position.y < 3) {
               // Inside crushing zone, slow down and move outwards
               rockData.vel.y *= 0.8;
               rockData.vel.x += Math.sign(rockData.mesh.position.x) * 0.02;
               rockData.vel.z += Math.sign(rockData.mesh.position.z) * 0.02;
               // Shrink rock to simulate crushing
               rockData.mesh.scale.multiplyScalar(0.98);
            }

            rockData.life -= 0.016;
            if (rockData.life <= 0 || rockData.mesh.position.y < -5) {
               rockData.mesh.position.y = 1000;
            }
         } else if (i < activeRocks && Math.random() > 0.8) {
            // Spawn new rock
            const angle = Math.random() * Math.PI * 2;
            const radius = 1 + Math.random() * 2;
            rockData.mesh.position.set(Math.cos(angle) * radius, 4, Math.sin(angle) * radius);
            rockData.vel.set(0, -0.1 - Math.random() * 0.1, 0);
            rockData.mesh.scale.set(1, 1, 1);
            rockData.life = 2 + Math.random();
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
      mantleGeo.dispose();
      mantleMat.dispose();
      concaveGeo.dispose();
      concaveMat.dispose();
      rockGeo.dispose();
      rockMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
