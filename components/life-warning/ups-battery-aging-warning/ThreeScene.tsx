import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UPSBatteryState } from './three-types';

interface ThreeSceneProps {
  state: UPSBatteryState;
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

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const upsGroup = new THREE.Group();
    scene.add(upsGroup);

    // UPS Cabinet (Transparent)
    const cabinetGeo = new THREE.BoxGeometry(8, 12, 6);
    const cabinetMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b, // slate-800
        transparent: true,
        opacity: 0.2,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.5
    });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    upsGroup.add(cabinet);

    // Battery Modules (3x4 grid)
    const modules: THREE.Mesh[] = [];
    const moduleGeo = new THREE.BoxGeometry(2, 1.5, 4);
    
    // Shader to show capacity (fill level) and heat
    const moduleMat = new THREE.ShaderMaterial({
        uniforms: {
            uCapacity: { value: 1.0 },
            uTemp: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0x334155) }, // slate-700
            uFillColor: { value: new THREE.Color(0x10b981) }, // emerald-500
            uHeatColor: { value: new THREE.Color(0xf43f5e) }  // rose-500
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
            uniform float uCapacity;
            uniform float uTemp;
            uniform vec3 uBaseColor;
            uniform vec3 uFillColor;
            uniform vec3 uHeatColor;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                // Fill level based on Y position (-0.75 to 0.75)
                float normalizedY = (vPosition.y + 0.75) / 1.5;
                float isFilled = step(normalizedY, uCapacity);
                
                vec3 color = mix(uBaseColor, uFillColor, isFilled);
                
                // Heat glow
                color = mix(color, uHeatColor, uTemp * 0.8);
                
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });

    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 3; x++) {
            const mod = new THREE.Mesh(moduleGeo, moduleMat.clone());
            mod.position.set(-2.5 + x * 2.5, -4.5 + y * 2, 0);
            upsGroup.add(mod);
            modules.push(mod);
        }
    }

    // Data Lines / Energy Flow
    const lineGeo = new THREE.BufferGeometry();
    const linePoints = [];
    for(let i=0; i<50; i++) {
        linePoints.push(new THREE.Vector3(0, -5 + i*0.2, 0));
    }
    lineGeo.setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 }); // blue-500
    const line = new THREE.Line(lineGeo, lineMat);
    line.position.set(0, 0, 2.5);
    upsGroup.add(line);

    // Particles moving up the line
    const particleCount = 20;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
        particlePos[i*3] = 0;
        particlePos[i*3+1] = -5 + Math.random() * 10;
        particlePos[i*3+2] = 2.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
        size: 0.3,
        color: 0x60a5fa, // blue-400
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    upsGroup.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      upsGroup.rotation.y = Math.sin(time * 0.1) * 0.1;

      // Update Shaders
      const capRatio = Math.max(0, Math.min(1, currentState.capacity / 100));
      // Temp normal ~25C, critical > 40C
      const tempRatio = Math.max(0, Math.min(1, (currentState.temperature - 20) / 25));

      modules.forEach((mod, index) => {
          // Add some slight variation between modules
          const varCap = Math.max(0, capRatio - (index % 3) * 0.05);
          (mod.material as THREE.ShaderMaterial).uniforms.uCapacity.value = varCap;
          (mod.material as THREE.ShaderMaterial).uniforms.uTemp.value = tempRatio;
          
          // Change fill color to yellow/red if capacity is low
          if (varCap < 0.6) {
              (mod.material as THREE.ShaderMaterial).uniforms.uFillColor.value.setHex(0xf43f5e); // rose
          } else if (varCap < 0.8) {
              (mod.material as THREE.ShaderMaterial).uniforms.uFillColor.value.setHex(0xf59e0b); // amber
          } else {
              (mod.material as THREE.ShaderMaterial).uniforms.uFillColor.value.setHex(0x10b981); // emerald
          }
      });

      // Update Particles (Energy flow)
      // High resistance = slower flow, red color
      const resRatio = Math.max(0, Math.min(1, (currentState.internalResistance - 5) / 15));
      const speed = 0.05 * (1 - resRatio * 0.8);
      
      if (resRatio > 0.6) {
          particleMat.color.setHex(0xf43f5e);
      } else {
          particleMat.color.setHex(0x60a5fa);
      }

      const pPos = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
          pPos[i*3+1] += speed; // Move up
          if (pPos[i*3+1] > 5) {
              pPos[i*3+1] = -5;
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
      cabinetGeo.dispose();
      cabinetMat.dispose();
      moduleGeo.dispose();
      modules.forEach(m => (m.material as THREE.Material).dispose());
      lineGeo.dispose();
      lineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
