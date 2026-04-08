import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BeltCordState } from './three-types';

interface ThreeSceneProps {
  state: BeltCordState;
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
    camera.position.set(0, 5, 20);

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

    const spotLight = new THREE.SpotLight(0x10b981, 2); // emerald-500
    spotLight.position.set(0, 10, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Belt Model ---
    const beltGroup = new THREE.Group();
    scene.add(beltGroup);

    // Rubber body (transparent to show cords)
    const beltGeo = new THREE.BoxGeometry(10, 0.5, 20);
    const beltMat = new THREE.MeshPhysicalMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.6,
      roughness: 0.8,
      transmission: 0.5,
      thickness: 0.5
    });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    beltGroup.add(belt);

    // Steel Cords
    const cordCount = 20;
    const cords: THREE.Mesh[] = [];
    const cordGeo = new THREE.CylinderGeometry(0.05, 0.05, 20, 8);
    
    // Custom shader for cords to show corrosion and breaks
    const cordMat = new THREE.ShaderMaterial({
      uniforms: {
        uCorrosion: { value: 0.0 },
        uIsBroken: { value: 0.0 },
        uTension: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x94a3b8) }, // steel
        uCorrosionColor: { value: new THREE.Color(0x9a3412) }, // rust
        uTensionColor: { value: new THREE.Color(0xef4444) } // red (high tension)
      },
      vertexShader: `
        uniform float uIsBroken;
        uniform float uTension;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // If broken, create a gap in the middle
          if (uIsBroken > 0.5) {
             if (abs(pos.y) < 0.5) {
                pos.x += 1000.0; // Hide middle segment
             }
          }

          // High tension makes it slightly thinner
          pos.x *= (1.0 - uTension * 0.2);
          pos.z *= (1.0 - uTension * 0.2);

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uCorrosion;
        uniform float uTension;
        uniform vec3 uBaseColor;
        uniform vec3 uCorrosionColor;
        uniform vec3 uTensionColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          float noise = rand(vUv * 100.0);
          vec3 color = uBaseColor;
          
          // Apply corrosion
          if (noise < uCorrosion) {
             color = uCorrosionColor;
          }

          // Apply tension color (glow)
          color = mix(color, uTensionColor, uTension * 0.5);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `
    });

    for (let i = 0; i < cordCount; i++) {
       const xPos = -4.5 + (i / (cordCount - 1)) * 9;
       const cord = new THREE.Mesh(cordGeo, cordMat.clone());
       cord.rotation.x = Math.PI / 2;
       cord.position.x = xPos;
       beltGroup.add(cord);
       cords.push(cord);
    }

    // --- X-Ray Scanner Effect ---
    const scannerGeo = new THREE.BoxGeometry(11, 1, 0.2);
    const scannerMat = new THREE.MeshBasicMaterial({ 
      color: 0x10b981, 
      transparent: true, 
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    scanner.position.y = 0.5;
    scene.add(scanner);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Cords
      const tensionFactor = clamp((currentState.tension - 50) / 100, 0, 1);
      const corrosionFactor = clamp(currentState.corrosionLevel / 100, 0, 1);
      
      cords.forEach((cord, index) => {
         const mat = cord.material as THREE.ShaderMaterial;
         mat.uniforms.uTension.value = tensionFactor;
         mat.uniforms.uCorrosion.value = corrosionFactor;
         
         // Randomly assign broken status based on count
         // In a real app, this would be mapped to specific cords
         if (index < currentState.brokenCords) {
            mat.uniforms.uIsBroken.value = 1.0;
         } else {
            mat.uniforms.uIsBroken.value = 0.0;
         }
      });

      // Animate Belt (Texture scrolling effect on rubber)
      // Since we don't have a texture, we'll move the scanner to simulate belt movement
      const speed = currentState.speed;
      scanner.position.z += speed * 0.1;
      if (scanner.position.z > 10) {
         scanner.position.z = -10;
      }

      // Belt vibration based on tension and broken cords
      const vib = (currentState.brokenCords * 0.02) + (tensionFactor * 0.05);
      beltGroup.position.y = Math.sin(time * 20) * vib;

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
      beltGeo.dispose();
      beltMat.dispose();
      cordGeo.dispose();
      cordMat.dispose();
      scannerGeo.dispose();
      scannerMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
