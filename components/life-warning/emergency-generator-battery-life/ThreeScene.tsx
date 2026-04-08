import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EmergencyBatteryState } from './three-types';

interface ThreeSceneProps {
  state: EmergencyBatteryState;
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
    scene.background = new THREE.Color(0x1e1b4b); // indigo-950
    scene.fog = new THREE.FogExp2(0x1e1b4b, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const batteryGroup = new THREE.Group();
    scene.add(batteryGroup);

    // Battery Casing (Transparent)
    const casingGeo = new THREE.BoxGeometry(10, 6, 6);
    const casingMat = new THREE.MeshPhysicalMaterial({
        color: 0x312e81, // indigo-900
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.5
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    batteryGroup.add(casing);

    // Terminals
    const terminalGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const posMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.5 }); // Red
    const negMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.5, roughness: 0.5 }); // Black
    
    const posTerminal = new THREE.Mesh(terminalGeo, posMat);
    posTerminal.position.set(3.5, 3.5, 0);
    batteryGroup.add(posTerminal);

    const negTerminal = new THREE.Mesh(terminalGeo, negMat);
    negTerminal.position.set(-3.5, 3.5, 0);
    batteryGroup.add(negTerminal);

    // Internal Cells (6 cells for 12V lead-acid)
    const cells: THREE.Mesh[] = [];
    const cellGeo = new THREE.BoxGeometry(1.4, 5, 5);
    
    // Shader to show sulfation (resistance) and heat
    const cellMat = new THREE.ShaderMaterial({
        uniforms: {
            uResistance: { value: 0.0 },
            uTemp: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0x475569) }, // Slate
            uSulfationColor: { value: new THREE.Color(0xfef08a) }, // Yellow/White crystals
            uHeatColor: { value: new THREE.Color(0xf87171) } // Red
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uResistance;
            uniform float uTemp;
            uniform vec3 uBaseColor;
            uniform vec3 uSulfationColor;
            uniform vec3 uHeatColor;
            varying vec3 vNormal;
            varying vec3 vPosition;

            // Simple 3D noise for sulfation pattern
            float hash(vec3 p) {
                p = fract(p * 0.3183099 + .1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }

            void main() {
                // Sulfation grows from bottom up and in patches
                float noise = hash(vPosition * 5.0);
                float heightFactor = smoothstep(2.5, -2.5, vPosition.y); // More at bottom
                float sulfation = smoothstep(1.0 - uResistance, 1.0, noise * heightFactor + uResistance * 0.5);
                
                vec3 color = mix(uBaseColor, uSulfationColor, sulfation);
                
                // Heat glow
                color = mix(color, uHeatColor, uTemp * 0.8);
                
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });

    for (let i = 0; i < 6; i++) {
        const cell = new THREE.Mesh(cellGeo, cellMat.clone());
        cell.position.set(-3.75 + i * 1.5, 0, 0);
        batteryGroup.add(cell);
        cells.push(cell);
    }

    // Energy Flow Particles (Moving between cells and terminals)
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
        particlePos[i*3] = (Math.random() - 0.5) * 8;
        particlePos[i*3+1] = (Math.random() - 0.5) * 4;
        particlePos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x4ade80, // green (healthy flow)
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    batteryGroup.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      batteryGroup.rotation.y = Math.sin(time * 0.1) * 0.2;

      // Update Cell Shaders
      // Resistance normal ~5 mOhm, critical > 15 mOhm
      const resRatio = Math.max(0, Math.min(1, (currentState.internalResistance - 3) / 15));
      // Temp normal ~25C, critical > 45C
      const tempRatio = Math.max(0, Math.min(1, (currentState.temperature - 20) / 30));

      cells.forEach(cell => {
          (cell.material as THREE.ShaderMaterial).uniforms.uResistance.value = resRatio;
          (cell.material as THREE.ShaderMaterial).uniforms.uTemp.value = tempRatio;
      });

      // Update Particles (Energy flow)
      // Voltage low = red, high = green
      if (currentState.voltage < 22) {
          particleMat.color.setHex(0xf87171); // red
      } else if (currentState.voltage < 24) {
          particleMat.color.setHex(0xfacc15); // yellow
      } else {
          particleMat.color.setHex(0x4ade80); // green
      }

      // High resistance slows down particles
      const speed = 0.05 * (1 - resRatio * 0.8);
      const pPos = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
          pPos[i*3] += speed; // Flow left to right
          pPos[i*3+1] += Math.sin(time * 5 + i) * 0.01; // Wiggle
          
          if (pPos[i*3] > 4) {
              pPos[i*3] = -4;
              pPos[i*3+1] = (Math.random() - 0.5) * 4;
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
      casingGeo.dispose();
      casingMat.dispose();
      terminalGeo.dispose();
      posMat.dispose();
      negMat.dispose();
      cellGeo.dispose();
      cells.forEach(c => (c.material as THREE.Material).dispose());
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
