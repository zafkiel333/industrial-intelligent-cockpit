import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BoilerTubeState } from './three-types';

interface ThreeSceneProps {
  state: BoilerTubeState;
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
    camera.position.set(0, 0, 20);

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

    // Fire/Heat light from bottom
    const fireLight = new THREE.PointLight(0xff4500, 2, 30);
    fireLight.position.set(0, -10, 0);
    scene.add(fireLight);

    const boilerGroup = new THREE.Group();
    scene.add(boilerGroup);

    // Boiler Tube (Cross-section view)
    // We use a cylinder with a hole, but to see inside we use a custom shader or half-cylinder
    const tubeGeo = new THREE.CylinderGeometry(3, 3, 15, 32, 32, true, 0, Math.PI); // Half cylinder
    
    // Shader to show wall thinning (corrosion) and heat
    const tubeMat = new THREE.ShaderMaterial({
        uniforms: {
            uThickness: { value: 1.0 }, // 1.0 = new, 0.0 = burst
            uTemp: { value: 0.0 },
            uTime: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0x475569) }, // slate-600
            uCorrosionColor: { value: new THREE.Color(0x7f1d18) }, // red-800
            uHeatColor: { value: new THREE.Color(0xf97316) } // orange-500
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uThickness;
            uniform float uTemp;
            uniform float uTime;
            uniform vec3 uBaseColor;
            uniform vec3 uCorrosionColor;
            uniform vec3 uHeatColor;
            
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;

            // Simple noise
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                // Corrosion pattern (more corrosion = more noise/dark spots)
                float noise = random(vUv * 20.0);
                float corrosionFactor = 1.0 - uThickness;
                
                // Base material color
                vec3 color = mix(uBaseColor, uCorrosionColor, corrosionFactor * noise);
                
                // Heat glow (bottom is hotter)
                float heatGradient = smoothstep(5.0, -7.5, vPosition.y);
                vec3 glow = uHeatColor * heatGradient * uTemp;
                
                color += glow;

                // Lighting
                vec3 lightDir = normalize(vec3(0.0, -1.0, 1.0)); // Light from fire
                float diff = max(dot(vNormal, lightDir), 0.2);
                
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });

    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    boilerGroup.add(tube);

    // Inner Tube wall (to show thickness)
    const innerTubeGeo = new THREE.CylinderGeometry(2.5, 2.5, 15, 32, 1, true, 0, Math.PI);
    const innerTubeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, side: THREE.DoubleSide, roughness: 0.4 });
    const innerTube = new THREE.Mesh(innerTubeGeo, innerTubeMat);
    boilerGroup.add(innerTube);

    // Water/Steam inside the tube
    const fluidCount = 500;
    const fluidGeo = new THREE.BufferGeometry();
    const fluidPos = new Float32Array(fluidCount * 3);
    const fluidTypes = new Float32Array(fluidCount); // 0 = water, 1 = steam

    for(let i=0; i<fluidCount; i++) {
        const angle = Math.random() * Math.PI; // Only in the half we can see
        const radius = Math.random() * 2.4;
        fluidPos[i*3] = Math.cos(angle) * radius;
        fluidPos[i*3+1] = (Math.random() - 0.5) * 15;
        fluidPos[i*3+2] = Math.sin(angle) * radius;
        
        // Bottom is water, top is steam
        fluidTypes[i] = fluidPos[i*3+1] > 0 ? 1.0 : 0.0;
    }
    fluidGeo.setAttribute('position', new THREE.BufferAttribute(fluidPos, 3));
    fluidGeo.setAttribute('aType', new THREE.BufferAttribute(fluidTypes, 1));

    const fluidMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uPressure: { value: 1.0 }
        },
        vertexShader: `
            attribute float aType;
            varying float vType;
            uniform float uTime;
            uniform float uPressure;
            void main() {
                vType = aType;
                vec3 pos = position;
                
                // Move upwards
                float speed = aType == 1.0 ? 5.0 : 2.0; // Steam moves faster
                pos.y += uTime * speed;
                
                // Wrap around
                if (pos.y > 7.5) pos.y = -7.5 + mod(pos.y, 15.0);
                
                // Jitter based on pressure
                pos.x += sin(uTime * 10.0 + pos.y) * 0.1 * uPressure;
                pos.z += cos(uTime * 10.0 + pos.y) * 0.1 * uPressure;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = (aType == 1.0 ? 4.0 : 6.0) * (10.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vType;
            void main() {
                // Water is blue, steam is white/transparent
                vec3 color = vType == 1.0 ? vec3(0.9, 0.9, 1.0) : vec3(0.2, 0.6, 1.0);
                float alpha = vType == 1.0 ? 0.4 : 0.8;
                
                // Soft particle
                vec2 coord = gl_PointCoord - vec2(0.5);
                if(length(coord) > 0.5) discard;
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const fluidSystem = new THREE.Points(fluidGeo, fluidMat);
    boilerGroup.add(fluidSystem);

    // Exhaust Gas Particles (Outside the tube)
    const gasCount = 300;
    const gasGeo = new THREE.BufferGeometry();
    const gasPos = new Float32Array(gasCount * 3);
    for(let i=0; i<gasCount; i++) {
        // Position outside the tube
        const angle = Math.random() * Math.PI * 2;
        const radius = 3.5 + Math.random() * 2;
        gasPos[i*3] = Math.cos(angle) * radius;
        gasPos[i*3+1] = -8 + Math.random() * 16;
        gasPos[i*3+2] = Math.sin(angle) * radius;
    }
    gasGeo.setAttribute('position', new THREE.BufferAttribute(gasPos, 3));
    const gasMat = new THREE.PointsMaterial({
        size: 0.5,
        color: 0xf97316, // orange-500
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    const gasSystem = new THREE.Points(gasGeo, gasMat);
    boilerGroup.add(gasSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Rotate scene slightly for better 3D feel
      boilerGroup.rotation.y = Math.sin(time * 0.2) * 0.2;

      // Update Tube Shader
      // Original thickness ~5mm, critical ~2mm
      const thicknessRatio = Math.max(0, Math.min(1, (currentState.tubeThickness - 2) / 3));
      tubeMat.uniforms.uThickness.value = thicknessRatio;
      
      const tempRatio = Math.max(0, Math.min(1, (currentState.exhaustGasTemp - 200) / 400));
      tubeMat.uniforms.uTemp.value = tempRatio;
      tubeMat.uniforms.uTime.value = time;

      // Adjust inner tube radius to visually show thinning
      const newInnerRadius = 3 - (currentState.tubeThickness / 10); // Visual scaling
      innerTube.scale.set(newInnerRadius/2.5, 1, newInnerRadius/2.5);

      // Update Fluid Shader
      fluidMat.uniforms.uTime.value = time;
      fluidMat.uniforms.uPressure.value = currentState.steamPressure / 2; // Normal ~1-2 MPa

      // Animate Exhaust Gas
      const gPos = gasSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<gasCount; i++) {
          gPos[i*3+1] += 0.1 + tempRatio * 0.2; // Move up, faster if hotter
          gPos[i*3] += Math.sin(time * 2 + i) * 0.05; // Swirl
          gPos[i*3+2] += Math.cos(time * 2 + i) * 0.05;

          if (gPos[i*3+1] > 8) {
              gPos[i*3+1] = -8;
          }
      }
      gasSystem.geometry.attributes.position.needsUpdate = true;
      
      // Gas color changes with temp
      gasMat.color.setRGB(
          1.0,
          0.5 - tempRatio * 0.3,
          0.0
      );

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
      tubeGeo.dispose();
      tubeMat.dispose();
      innerTubeGeo.dispose();
      innerTubeMat.dispose();
      fluidGeo.dispose();
      fluidMat.dispose();
      gasGeo.dispose();
      gasMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
