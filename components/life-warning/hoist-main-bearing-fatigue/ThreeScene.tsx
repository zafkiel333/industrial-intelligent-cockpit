import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HoistBearingState } from './three-types';

interface ThreeSceneProps {
  state: HoistBearingState;
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
    camera.position.set(0, 15, 25);

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
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x0ea5e9, 2); // sky-500
    spotLight.position.set(0, -10, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Bearing Model ---
    const bearingGroup = new THREE.Group();
    scene.add(bearingGroup);

    // Main Shaft
    const shaftGeo = new THREE.CylinderGeometry(4, 4, 20, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    bearingGroup.add(shaft);

    // Bearing Housing (Cutaway)
    const housingGeo = new THREE.CylinderGeometry(7, 7, 8, 32, 1, false, 0, Math.PI * 1.5);
    
    // Custom shader for housing to show heat and stress
    const housingMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemperature: { value: 40.0 },
        uStress: { value: 0.0 }, // Based on load
        uBaseColor: { value: new THREE.Color(0x334155) }, // slate-700
        uHotColor: { value: new THREE.Color(0xef4444) }, // red-500
        uStressColor: { value: new THREE.Color(0x8b5cf6) } // violet-500
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTemperature;
        uniform float uStress;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        uniform vec3 uStressColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // Heat mapping (normalize temp 40-100C)
          float heatFactor = clamp((uTemperature - 40.0) / 60.0, 0.0, 1.0);
          
          vec3 color = mix(uBaseColor, uHotColor, heatFactor * 0.8);
          
          // Add stress color at the bottom (load bearing zone)
          if (vPosition.y < 0.0) {
             float stressZone = smoothstep(0.0, -7.0, vPosition.y);
             color = mix(color, uStressColor, uStress * stressZone);
          }

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.rotation.z = Math.PI / 2;
    housing.rotation.y = Math.PI / 4;
    bearingGroup.add(housing);

    // Rollers (Spherical Roller Bearing)
    const rollerCount = 16;
    const rollerGeo = new THREE.CylinderGeometry(1, 1, 3, 16);
    // Curve the cylinder slightly to make it spherical
    const posAttribute = rollerGeo.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
        const y = posAttribute.getY(i);
        const x = posAttribute.getX(i);
        const z = posAttribute.getZ(i);
        // Bulge in the middle
        const bulge = 1.0 + (1.0 - Math.pow(y / 1.5, 2)) * 0.2;
        posAttribute.setX(i, x * bulge);
        posAttribute.setZ(i, z * bulge);
    }
    rollerGeo.computeVertexNormals();

    const rollerMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.1 });
    
    const rollersGroup1 = new THREE.Group();
    const rollersGroup2 = new THREE.Group();
    bearingGroup.add(rollersGroup1);
    bearingGroup.add(rollersGroup2);

    for (let i = 0; i < rollerCount; i++) {
       const angle = (i / rollerCount) * Math.PI * 2;
       
       // Row 1
       const roller1 = new THREE.Mesh(rollerGeo, rollerMat);
       roller1.position.set(0, Math.sin(angle) * 5.5, Math.cos(angle) * 5.5);
       roller1.rotation.x = -angle;
       roller1.rotation.z = Math.PI / 2;
       // Tilt inwards
       roller1.rotation.y = 0.2;
       rollersGroup1.add(roller1);

       // Row 2
       const roller2 = new THREE.Mesh(rollerGeo, rollerMat);
       roller2.position.set(0, Math.sin(angle) * 5.5, Math.cos(angle) * 5.5);
       roller2.rotation.x = -angle;
       roller2.rotation.z = Math.PI / 2;
       roller2.rotation.y = -0.2;
       rollersGroup2.add(roller2);
    }
    
    rollersGroup1.position.x = -2;
    rollersGroup2.position.x = 2;

    // --- Oil Film Visualization ---
    const oilGeo = new THREE.CylinderGeometry(4.2, 4.2, 8, 32);
    const oilMat = new THREE.ShaderMaterial({
      uniforms: {
        uThickness: { value: 1.0 }, // 0 to 1
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uThickness;
        varying vec2 vUv;
        
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Color based on thickness. Thin = red, Thick = blue/green
          vec3 thickColor = vec3(0.0, 0.8, 0.8); // cyan
          vec3 thinColor = vec3(1.0, 0.0, 0.0); // red
          
          vec3 color = mix(thinColor, thickColor, uThickness);
          
          // Add some noise for fluid look
          float noise = rand(vUv * 20.0);
          
          gl_FragColor = vec4(color, 0.3 + noise * 0.2);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const oilFilm = new THREE.Mesh(oilGeo, oilMat);
    oilFilm.rotation.z = Math.PI / 2;
    bearingGroup.add(oilFilm);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Housing Shader
      housingMat.uniforms.uTemperature.value = currentState.temperature;
      housingMat.uniforms.uStress.value = clamp(currentState.load / 100, 0, 1);

      // Update Oil Film Shader
      // Normal thickness > 10um. Critical < 2um.
      const thicknessFactor = clamp((currentState.oilFilmThickness - 2) / 10, 0, 1);
      oilMat.uniforms.uThickness.value = thicknessFactor;

      // Rotate Shaft and Rollers
      const speed = 0.05;
      shaft.rotation.x += speed;
      
      // Cage rotation
      rollersGroup1.rotation.x += speed * 0.4;
      rollersGroup2.rotation.x += speed * 0.4;

      // Apply Low Freq Vibration
      if (currentState.vibration > 2.0) {
         const jitterY = (Math.random() - 0.5) * (currentState.vibration * 0.05);
         bearingGroup.position.set(0, jitterY, 0);
      } else {
         bearingGroup.position.set(0, 0, 0);
      }

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
      shaftGeo.dispose();
      shaftMat.dispose();
      housingGeo.dispose();
      housingMat.dispose();
      rollerGeo.dispose();
      rollerMat.dispose();
      oilGeo.dispose();
      oilMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
