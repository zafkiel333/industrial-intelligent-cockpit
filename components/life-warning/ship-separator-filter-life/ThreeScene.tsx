import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeparatorFilterState } from './three-types';

interface ThreeSceneProps {
  state: SeparatorFilterState;
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
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const separatorGroup = new THREE.Group();
    scene.add(separatorGroup);

    // Tank (Cutaway)
    const tankGeo = new THREE.CylinderGeometry(5, 5, 15, 32, 1, true, 0, Math.PI * 1.5);
    const tankMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.6, 
        roughness: 0.4, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    separatorGroup.add(tank);

    // Filter Elements (Coalescer)
    const filterCount = 3;
    const filters: THREE.Mesh[] = [];
    
    // Shader to show filter clogging (darkening/browning)
    const filterMat = new THREE.ShaderMaterial({
        uniforms: {
            uClog: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0xf8fafc) }, // slate-50 (clean)
            uClogColor: { value: new THREE.Color(0x451a03) }  // dark brown (oily)
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
            uniform float uClog;
            uniform vec3 uBaseColor;
            uniform vec3 uClogColor;
            varying vec3 vNormal;
            varying vec2 vUv;

            // Simple noise
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                // Add some noise to make it look like a porous filter
                float noise = random(vUv * 50.0);
                
                // Clogging pattern (more clog = darker and more widespread)
                float clogFactor = smoothstep(1.0 - uClog, 1.0, noise + uClog * 0.5);
                
                vec3 color = mix(uBaseColor, uClogColor, clogFactor);
                
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });

    for (let i = 0; i < filterCount; i++) {
        const filterGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16);
        const filter = new THREE.Mesh(filterGeo, filterMat.clone());
        // Position them in a triangle
        const angle = (i / filterCount) * Math.PI * 2;
        filter.position.x = Math.cos(angle) * 2;
        filter.position.z = Math.sin(angle) * 2;
        filter.position.y = -2;
        separatorGroup.add(filter);
        filters.push(filter);
    }

    // Fluid Particles (Water and Oil)
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleTypes = new Float32Array(particleCount); // 0 = water, 1 = oil

    for(let i=0; i<particleCount; i++) {
        particlePos[i*3] = (Math.random() - 0.5) * 8;
        particlePos[i*3+1] = -7 + Math.random() * 14;
        particlePos[i*3+2] = (Math.random() - 0.5) * 8;
        
        // Initial state: mixed at bottom, separated at top
        particleTypes[i] = Math.random() > 0.8 ? 1.0 : 0.0; // 20% oil
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('aType', new THREE.BufferAttribute(particleTypes, 1));

    const particleMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uFlowSpeed: { value: 1.0 },
            uSeparationEfficiency: { value: 1.0 }
        },
        vertexShader: `
            attribute float aType;
            varying float vType;
            uniform float uTime;
            uniform float uFlowSpeed;
            uniform float uSeparationEfficiency;
            
            void main() {
                vType = aType;
                vec3 pos = position;
                
                // Flow upwards
                pos.y += uTime * uFlowSpeed * 2.0;
                
                // Wrap around
                if (pos.y > 7.0) {
                    pos.y = -7.0;
                    // Randomize XZ on reset
                    pos.x = (fract(sin(uTime * pos.x) * 43758.5453) - 0.5) * 8.0;
                    pos.z = (fract(cos(uTime * pos.z) * 43758.5453) - 0.5) * 8.0;
                }
                
                // Separation logic: Oil (type 1) moves to the center/top if efficiency is high
                if (aType == 1.0) {
                    // Move towards center (filters)
                    pos.x *= (1.0 - uSeparationEfficiency * 0.05);
                    pos.z *= (1.0 - uSeparationEfficiency * 0.05);
                    
                    // If efficiency is low, some oil escapes to the top without being caught
                    // (Visualized by oil particles reaching the very top)
                }

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = (aType == 1.0 ? 6.0 : 3.0) * (10.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vType;
            void main() {
                // Water is light blue, Oil is dark brown/yellow
                vec3 color = vType == 1.0 ? vec3(0.6, 0.4, 0.1) : vec3(0.4, 0.8, 1.0);
                float alpha = vType == 1.0 ? 0.8 : 0.4;
                
                vec2 coord = gl_PointCoord - vec2(0.5);
                if(length(coord) > 0.5) discard;
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    separatorGroup.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      separatorGroup.rotation.y = time * 0.1;

      // Update Filter Shader (Clogging based on pressure drop)
      // Normal pressure drop ~0.2 bar, critical ~1.5 bar
      const clogRatio = Math.max(0, Math.min(1, (currentState.pressureDrop - 0.2) / 1.3));
      filters.forEach(filter => {
          (filter.material as THREE.ShaderMaterial).uniforms.uClog.value = clogRatio;
      });

      // Update Particle Shader
      particleMat.uniforms.uTime.value = time;
      particleMat.uniforms.uFlowSpeed.value = currentState.flowRate / 5; // Normal ~2-5 m3/h
      
      // Separation efficiency drops as filter clogs
      const efficiency = 1.0 - clogRatio;
      particleMat.uniforms.uSeparationEfficiency.value = efficiency;

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
      filters.forEach(f => {
          f.geometry.dispose();
          (f.material as THREE.Material).dispose();
      });
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
