import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UVLampState } from './three-types';

interface ThreeSceneProps {
  state: UVLampState;
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
    scene.fog = new THREE.FogExp2(0x315268, 0.03);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(12, 5, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Enable bloom-like effect via additive blending later
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const reactorGroup = new THREE.Group();
    scene.add(reactorGroup);

    // Reactor Chamber (Transparent Pipe)
    const chamberGeo = new THREE.CylinderGeometry(3, 3, 12, 32, 1, true);
    const chamberMat = new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8,
        metalness: 0.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.2,
        transmission: 0.9,
        side: THREE.DoubleSide
    });
    const chamber = new THREE.Mesh(chamberGeo, chamberMat);
    chamber.rotation.z = Math.PI / 2; // Horizontal
    reactorGroup.add(chamber);

    // Flanges
    const flangeGeo = new THREE.TorusGeometry(3.2, 0.3, 16, 32);
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.4 });
    const flange1 = new THREE.Mesh(flangeGeo, flangeMat);
    flange1.position.x = -6;
    flange1.rotation.y = Math.PI / 2;
    reactorGroup.add(flange1);
    const flange2 = new THREE.Mesh(flangeGeo, flangeMat);
    flange2.position.x = 6;
    flange2.rotation.y = Math.PI / 2;
    reactorGroup.add(flange2);

    // UV Lamps (Inside chamber)
    const lamps: THREE.Mesh[] = [];
    const lampLights: THREE.PointLight[] = [];
    const lampCount = 4;
    const lampGeo = new THREE.CylinderGeometry(0.2, 0.2, 10, 16);
    
    // Shader for UV glow
    const lampMat = new THREE.ShaderMaterial({
        uniforms: {
            uIntensity: { value: 1.0 },
            uColor: { value: new THREE.Color(0xa855f7) } // purple-500
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uIntensity;
            uniform vec3 uColor;
            varying vec3 vNormal;
            void main() {
                // Core is white, edges are purple
                float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                vec3 finalColor = mix(vec3(1.0), uColor, intensity) * uIntensity * 2.0;
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    for(let i=0; i<lampCount; i++) {
        const angle = (i / lampCount) * Math.PI * 2;
        const radius = 1.5;
        const lamp = new THREE.Mesh(lampGeo, lampMat.clone());
        lamp.rotation.z = Math.PI / 2;
        lamp.position.y = Math.sin(angle) * radius;
        lamp.position.z = Math.cos(angle) * radius;
        reactorGroup.add(lamp);
        lamps.push(lamp);

        const light = new THREE.PointLight(0xa855f7, 2, 8);
        light.position.copy(lamp.position);
        reactorGroup.add(light);
        lampLights.push(light);
    }

    // Water Flow Particles
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleLife = new Float32Array(particleCount); // To track passage through UV

    for(let i=0; i<particleCount; i++) {
        particlePos[i*3] = -6 + Math.random() * 12; // x
        const r = Math.random() * 2.8;
        const theta = Math.random() * Math.PI * 2;
        particlePos[i*3+1] = Math.sin(theta) * r; // y
        particlePos[i*3+2] = Math.cos(theta) * r; // z
        particleLife[i] = Math.random();
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('aLife', new THREE.BufferAttribute(particleLife, 1));

    const particleMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uTransmittance: { value: 1.0 }, // Water clarity
            uUVIntensity: { value: 1.0 }
        },
        vertexShader: `
            attribute float aLife;
            varying float vLife;
            varying vec3 vPos;
            uniform float uTime;
            
            void main() {
                vLife = aLife;
                vec3 pos = position;
                vPos = pos;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = 4.0 * (10.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uTransmittance;
            uniform float uUVIntensity;
            varying float vLife;
            varying vec3 vPos;
            
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                if(length(coord) > 0.5) discard;
                
                // Base water color (blueish)
                vec3 color = vec3(0.2, 0.6, 0.8);
                
                // If transmittance is low, water is murky (green/brown)
                vec3 murkyColor = vec3(0.4, 0.5, 0.2);
                color = mix(murkyColor, color, uTransmittance);
                
                // UV glow effect on particles in the center
                float distToCenter = length(vPos.yz);
                if (distToCenter < 2.0 && vPos.x > -4.0 && vPos.x < 4.0) {
                    color += vec3(0.6, 0.2, 0.8) * uUVIntensity * 0.5;
                }
                
                float alpha = mix(0.8, 0.2, uTransmittance); // Murky water is more opaque
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    reactorGroup.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Lamps based on intensity
      // Intensity drops as lamp ages or gets fouled
      const intensityRatio = Math.max(0, Math.min(1, currentState.uvIntensity / 250)); // Max ~250 W/m2
      lamps.forEach(lamp => {
          (lamp.material as THREE.ShaderMaterial).uniforms.uIntensity.value = intensityRatio;
      });
      lampLights.forEach(light => {
          light.intensity = intensityRatio * 2;
      });

      // Flow Animation
      const flowSpeed = currentState.flowRate * 0.01; // Scale flow rate
      const pPos = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
          pPos[i*3] += flowSpeed; // Move along X axis
          
          // Slight swirl
          const r = Math.sqrt(pPos[i*3+1]*pPos[i*3+1] + pPos[i*3+2]*pPos[i*3+2]);
          const theta = Math.atan2(pPos[i*3+1], pPos[i*3+2]) + 0.02;
          pPos[i*3+1] = Math.sin(theta) * r;
          pPos[i*3+2] = Math.cos(theta) * r;

          // Reset if it exits pipe
          if (pPos[i*3] > 6) {
              pPos[i*3] = -6;
              const newR = Math.random() * 2.8;
              const newTheta = Math.random() * Math.PI * 2;
              pPos[i*3+1] = Math.sin(newTheta) * newR;
              pPos[i*3+2] = Math.cos(newTheta) * newR;
          }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Update Particle Shader
      particleMat.uniforms.uTransmittance.value = currentState.transmittance / 100;
      particleMat.uniforms.uUVIntensity.value = intensityRatio;

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
      chamberGeo.dispose();
      chamberMat.dispose();
      flangeGeo.dispose();
      flangeMat.dispose();
      lampGeo.dispose();
      lamps.forEach(l => (l.material as THREE.Material).dispose());
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
