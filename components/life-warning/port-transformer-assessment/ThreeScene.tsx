import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformerState } from './three-types';

interface ThreeSceneProps {
  state: TransformerState;
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
    camera.position.set(15, 15, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const transformerGroup = new THREE.Group();
    scene.add(transformerGroup);

    // Transformer Tank
    const tankGeo = new THREE.BoxGeometry(8, 10, 6);
    const tankMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, // slate-600
        metalness: 0.7, 
        roughness: 0.3,
        transparent: true,
        opacity: 0.4 // Semi-transparent to see inside
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    transformerGroup.add(tank);

    // Core and Coils
    const coreGeo = new THREE.BoxGeometry(6, 8, 2);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.5 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    transformerGroup.add(core);

    // Coils (3 phases)
    const coils: THREE.Mesh[] = [];
    const coilGeo = new THREE.CylinderGeometry(1.5, 1.5, 7, 32);
    
    // Shader to show heat on coils
    const coilMat = new THREE.ShaderMaterial({
        uniforms: {
            uTemp: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0xb45309) }, // amber-700 (copper)
            uHeatColor: { value: new THREE.Color(0xfef08a) }  // yellow-200 (hot)
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTemp;
            uniform vec3 uBaseColor;
            uniform vec3 uHeatColor;
            varying vec3 vNormal;
            void main() {
                vec3 color = mix(uBaseColor, uHeatColor, uTemp);
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });

    for (let i = 0; i < 3; i++) {
        const coil = new THREE.Mesh(coilGeo, coilMat.clone());
        coil.position.x = (i - 1) * 2; // -2, 0, 2
        coil.position.z = 1.5; // Front of core
        transformerGroup.add(coil);
        coils.push(coil);
    }

    // Bushings (Top insulators)
    const bushingGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 16);
    const bushingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1 }); // slate-200 (ceramic)
    for (let i = 0; i < 3; i++) {
        const bushing = new THREE.Mesh(bushingGeo, bushingMat);
        bushing.position.set((i - 1) * 2, 6.5, 0);
        transformerGroup.add(bushing);
    }

    // Partial Discharge (Sparks/Arcs)
    const pdCount = 50;
    const pdGeo = new THREE.BufferGeometry();
    const pdPos = new Float32Array(pdCount * 3);
    pdGeo.setAttribute('position', new THREE.BufferAttribute(pdPos, 3));
    
    const pdMat = new THREE.ShaderMaterial({
        uniforms: {
            uIntensity: { value: 0.0 },
            uTime: { value: 0.0 }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uIntensity;
            void main() {
                vec3 pos = position;
                // Random jitter based on time and intensity
                pos.x += sin(uTime * 50.0 + pos.y) * 0.5 * uIntensity;
                pos.y += cos(uTime * 60.0 + pos.x) * 0.5 * uIntensity;
                pos.z += sin(uTime * 70.0 + pos.z) * 0.5 * uIntensity;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = 8.0 * uIntensity * (10.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uIntensity;
            void main() {
                if (uIntensity < 0.05) discard;
                
                // Electric blue/white spark
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if(dist > 0.5) discard;
                
                float alpha = (0.5 - dist) * 2.0 * uIntensity;
                gl_FragColor = vec4(0.5, 0.8, 1.0, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const pdSystem = new THREE.Points(pdGeo, pdMat);
    transformerGroup.add(pdSystem);

    // Initialize PD positions around coils
    const pPositions = pdSystem.geometry.attributes.position.array as Float32Array;
    for(let i=0; i<pdCount; i++) {
        const coilIdx = Math.floor(Math.random() * 3);
        pPositions[i*3] = (coilIdx - 1) * 2 + (Math.random() - 0.5) * 2;
        pPositions[i*3+1] = (Math.random() - 0.5) * 6;
        pPositions[i*3+2] = 1.5 + (Math.random() - 0.5) * 2;
    }

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      transformerGroup.rotation.y = Math.sin(time * 0.1) * 0.2;

      // Update Coil Heat Shader
      // Normal temp ~60C, critical ~100C
      const tempRatio = Math.max(0, Math.min(1, (currentState.oilTemp - 40) / 60));
      coils.forEach(coil => {
          (coil.material as THREE.ShaderMaterial).uniforms.uTemp.value = tempRatio;
      });

      // Update Partial Discharge Shader
      // Normal PD < 100pC, critical > 1000pC
      const pdRatio = Math.max(0, Math.min(1, currentState.partialDischarge / 1000));
      pdMat.uniforms.uIntensity.value = pdRatio;
      pdMat.uniforms.uTime.value = time;

      // Randomize PD positions occasionally if intensity is high
      if (pdRatio > 0.2 && Math.random() < 0.1) {
          const pPositions = pdSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pdCount; i++) {
              if (Math.random() < pdRatio) {
                  const coilIdx = Math.floor(Math.random() * 3);
                  pPositions[i*3] = (coilIdx - 1) * 2 + (Math.random() - 0.5) * 2.5;
                  pPositions[i*3+1] = (Math.random() - 0.5) * 7;
                  pPositions[i*3+2] = 1.5 + (Math.random() - 0.5) * 2.5;
              }
          }
          pdSystem.geometry.attributes.position.needsUpdate = true;
      }

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
      tankGeo.dispose();
      tankMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      coilGeo.dispose();
      coils.forEach(c => (c.material as THREE.Material).dispose());
      bushingGeo.dispose();
      bushingMat.dispose();
      pdGeo.dispose();
      pdMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
