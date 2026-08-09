import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShorePowerPlugState } from './three-types';

interface ThreeSceneProps {
  state: ShorePowerPlugState;
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
    camera.position.set(10, 8, 15);

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

    const plugGroup = new THREE.Group();
    scene.add(plugGroup);

    // Socket (Receptacle)
    const socketGeo = new THREE.CylinderGeometry(3, 3, 4, 32);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5 });
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.rotation.x = Math.PI / 2;
    socket.position.z = -2;
    plugGroup.add(socket);

    // Plug Body
    const plugBodyGeo = new THREE.CylinderGeometry(2.8, 2.8, 6, 32);
    const plugBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.7 });
    const plugBody = new THREE.Mesh(plugBodyGeo, plugBodyMat);
    plugBody.rotation.x = Math.PI / 2;
    plugBody.position.z = 3;
    plugGroup.add(plugBody);

    // Cable
    const cableGeo = new THREE.CylinderGeometry(1, 1, 8, 16);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.rotation.x = Math.PI / 2;
    cable.position.z = 10;
    plugGroup.add(cable);

    // Contact Pins (3 phases + neutral/ground)
    const pins: THREE.Mesh[] = [];
    const pinGeo = new THREE.CylinderGeometry(0.4, 0.4, 3, 16);
    
    // Shader for pin heat and wear
    const pinMat = new THREE.ShaderMaterial({
        uniforms: {
            uTemp: { value: 0.0 },
            uWear: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0xd4d4d8) }, // Silver/zinc
            uHeatColor: { value: new THREE.Color(0xfca5a5) }, // Red hot
            uWearColor: { value: new THREE.Color(0x71717a) }  // Dark grey/oxidized
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec2 vUv;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTemp;
            uniform float uWear;
            uniform vec3 uBaseColor;
            uniform vec3 uHeatColor;
            uniform vec3 uWearColor;
            varying vec3 vNormal;
            varying vec2 vUv;

            // Simple noise
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                // Wear adds noise and darkens
                float noise = random(vUv * 20.0);
                float wearFactor = smoothstep(1.0 - uWear, 1.0, noise + uWear * 0.5);
                vec3 color = mix(uBaseColor, uWearColor, wearFactor);
                
                // Heat adds red glow
                color = mix(color, uHeatColor, uTemp * (0.5 + noise * 0.5));
                
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });

    const pinPositions = [
        { x: 0, y: 1.5 },
        { x: 1.3, y: -0.75 },
        { x: -1.3, y: -0.75 },
        { x: 0, y: -1.5 } // Ground/Neutral
    ];

    pinPositions.forEach(pos => {
        const pin = new THREE.Mesh(pinGeo, pinMat.clone());
        pin.rotation.x = Math.PI / 2;
        pin.position.set(pos.x, pos.y, 0.5);
        plugBody.add(pin);
        pins.push(pin);
    });

    // Sparks/Arcing (when resistance is high and current flows)
    const sparkCount = 100;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    
    const sparkMat = new THREE.ShaderMaterial({
        uniforms: {
            uIntensity: { value: 0.0 },
            uTime: { value: 0.0 }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uIntensity;
            void main() {
                vec3 pos = position;
                // Jitter
                pos.x += sin(uTime * 50.0 + pos.y) * 0.2 * uIntensity;
                pos.y += cos(uTime * 60.0 + pos.x) * 0.2 * uIntensity;
                pos.z += sin(uTime * 70.0 + pos.z) * 0.2 * uIntensity;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = 6.0 * uIntensity * (10.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uIntensity;
            void main() {
                if (uIntensity < 0.05) discard;
                vec2 coord = gl_PointCoord - vec2(0.5);
                if(length(coord) > 0.5) discard;
                gl_FragColor = vec4(1.0, 0.8, 0.2, uIntensity); // Yellow/Orange sparks
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const sparkSystem = new THREE.Points(sparkGeo, sparkMat);
    plugGroup.add(sparkSystem);

    const clock = new THREE.Clock();
    let plugAnimationTime = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Slowly rotate the whole assembly for better view
      plugGroup.rotation.y = Math.sin(time * 0.2) * 0.3;
      plugGroup.rotation.x = Math.cos(time * 0.1) * 0.1;

      // Simulate plugging/unplugging occasionally
      plugAnimationTime += 0.016;
      if (plugAnimationTime > 10) {
          // Unplug and plug back in
          const cycle = (plugAnimationTime - 10) / 2; // 2 seconds cycle
          if (cycle < 1) {
              plugBody.position.z = 3 + Math.sin(cycle * Math.PI) * 4;
              cable.position.z = 10 + Math.sin(cycle * Math.PI) * 4;
          } else {
              plugAnimationTime = 0;
              plugBody.position.z = 3;
              cable.position.z = 10;
          }
      }

      // Update Pin Shader (Wear and Heat)
      // Normal resistance ~0.5 mOhm, critical > 2.0 mOhm
      const wearRatio = Math.max(0, Math.min(1, currentState.contactResistance / 2.5));
      // Normal temp ~40C, critical > 90C
      const tempRatio = Math.max(0, Math.min(1, (currentState.temperature - 30) / 70));
      
      pins.forEach(pin => {
          (pin.material as THREE.ShaderMaterial).uniforms.uWear.value = wearRatio;
          (pin.material as THREE.ShaderMaterial).uniforms.uTemp.value = tempRatio;
      });

      // Update Sparks (Arcing due to high resistance and current)
      const arcIntensity = (wearRatio > 0.5 && currentState.currentLoad > 100) ? wearRatio * (currentState.currentLoad / 500) : 0;
      sparkMat.uniforms.uIntensity.value = arcIntensity;
      sparkMat.uniforms.uTime.value = time;

      if (arcIntensity > 0.1 && Math.random() < 0.2) {
          const sPos = sparkSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<sparkCount; i++) {
              if (Math.random() < arcIntensity) {
                  // Spawn sparks near the contact interface (z ~ 0)
                  const pinIdx = Math.floor(Math.random() * 4);
                  sPos[i*3] = pinPositions[pinIdx].x + (Math.random() - 0.5) * 0.8;
                  sPos[i*3+1] = pinPositions[pinIdx].y + (Math.random() - 0.5) * 0.8;
                  sPos[i*3+2] = plugBody.position.z - 3 + (Math.random() - 0.5) * 1.5;
              }
          }
          sparkSystem.geometry.attributes.position.needsUpdate = true;
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
      socketGeo.dispose();
      socketMat.dispose();
      plugBodyGeo.dispose();
      plugBodyMat.dispose();
      cableGeo.dispose();
      cableMat.dispose();
      pinGeo.dispose();
      pins.forEach(p => (p.material as THREE.Material).dispose());
      sparkGeo.dispose();
      sparkMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
