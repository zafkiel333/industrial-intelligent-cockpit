import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RelayComponentState } from './three-types';

interface ThreeSceneProps {
  state: RelayComponentState;
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
    camera.position.set(0, 15, 10);

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

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // --- PCB Model ---
    const pcbGroup = new THREE.Group();
    scene.add(pcbGroup);

    // Board
    const boardGeo = new THREE.BoxGeometry(16, 0.2, 12);
    
    // Custom shader for board to show dust accumulation
    const boardMat = new THREE.ShaderMaterial({
      uniforms: {
        uDust: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x064e3b) }, // emerald-900
        uDustColor: { value: new THREE.Color(0x78716c) } // stone-500
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
        uniform float uDust;
        uniform vec3 uBaseColor;
        uniform vec3 uDustColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          float noise = rand(vUv * 100.0);
          float dustFactor = clamp(uDust * 1.5 - noise * 0.5, 0.0, 1.0);
          
          vec3 color = mix(uBaseColor, uDustColor, dustFactor);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `
    });

    const board = new THREE.Mesh(boardGeo, boardMat);
    pcbGroup.add(board);

    // Components
    const components: { mesh: THREE.Mesh, type: string, baseColor: THREE.Color }[] = [];

    // Main IC (Processor)
    const icGeo = new THREE.BoxGeometry(3, 0.4, 3);
    const icMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const ic = new THREE.Mesh(icGeo, icMat);
    ic.position.set(0, 0.3, 0);
    pcbGroup.add(ic);
    components.push({ mesh: ic, type: 'ic', baseColor: new THREE.Color(0x1e293b) });

    // Relays
    const relayGeo = new THREE.BoxGeometry(1.5, 1.5, 2);
    const relayMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }); // slate-900
    const relayPositions = [[-5, -3], [-3, -3], [-1, -3]];
    relayPositions.forEach(pos => {
      const relay = new THREE.Mesh(relayGeo, relayMat.clone());
      relay.position.set(pos[0], 0.85, pos[1]);
      pcbGroup.add(relay);
      components.push({ mesh: relay, type: 'relay', baseColor: new THREE.Color(0x0f172a) });
    });

    // Capacitors (Electrolytic)
    const capGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 }); // blue-500
    const capPositions = [[4, 3], [5.5, 3], [4, 1.5], [5.5, 1.5]];
    capPositions.forEach(pos => {
      const cap = new THREE.Mesh(capGeo, capMat.clone());
      cap.position.set(pos[0], 0.85, pos[1]);
      pcbGroup.add(cap);
      components.push({ mesh: cap, type: 'capacitor', baseColor: new THREE.Color(0x3b82f6) });
    });

    // --- Heat/Stress Visualization ---
    // We will tint components based on temperature and voltage stress
    const hotColor = new THREE.Color(0xef4444); // red-500

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Board Dust
      boardMat.uniforms.uDust.value = currentState.dustAccumulation / 100;

      // Update Components Heat
      const tempFactor = clamp((currentState.temperature - 25) / 60, 0, 1); // 25C to 85C
      
      components.forEach(comp => {
         const mat = comp.mesh.material as THREE.MeshStandardMaterial;
         
         // ICs and Capacitors heat up more
         let localHeat = tempFactor;
         if (comp.type === 'ic') localHeat *= 1.2;
         if (comp.type === 'capacitor') {
            // Capacitors also stress from voltage fluctuations
            localHeat += (currentState.voltageFluctuation / 20) * 0.5;
         }
         
         localHeat = clamp(localHeat, 0, 1);
         mat.color.copy(comp.baseColor).lerp(hotColor, localHeat * 0.8);
         
         // If humidity is high and dust is high, simulate short circuit risk (flicker)
         if (currentState.humidity > 80 && currentState.dustAccumulation > 50) {
            if (Math.random() > 0.95) {
               mat.emissive.setHex(0x38bdf8); // Spark color
               mat.emissiveIntensity = 0.5;
            } else {
               mat.emissive.setHex(0x000000);
            }
         } else {
            mat.emissive.setHex(0x000000);
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
      boardGeo.dispose();
      boardMat.dispose();
      icGeo.dispose();
      icMat.dispose();
      relayGeo.dispose();
      relayMat.dispose();
      capGeo.dispose();
      capMat.dispose();
      components.forEach(c => (c.mesh.material as THREE.Material).dispose());
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
