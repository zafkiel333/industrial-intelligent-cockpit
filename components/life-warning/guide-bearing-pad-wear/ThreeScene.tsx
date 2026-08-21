import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BearingPadState } from './three-types';

interface ThreeSceneProps {
  state: BearingPadState;
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
    camera.position.set(15, 10, 20);

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

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x38bdf8, 2); // sky-400
    spotLight.position.set(-10, 10, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Guide Bearing Model ---
    const bearingGroup = new THREE.Group();
    scene.add(bearingGroup);

    // Rotor Shaft
    const shaftRadius = 4;
    const shaftHeight = 12;
    const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftHeight, 64);
    const shaftMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, // slate-400
      metalness: 0.8, 
      roughness: 0.2 
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    bearingGroup.add(shaft);

    // Bearing Pads (Babbitt metal)
    const padCount = 8;
    const padRadius = shaftRadius + 0.2; // slight gap for oil film
    const padHeight = 6;
    const padThickness = 1.5;
    const pads: THREE.Mesh[] = [];

    // Custom shader for pads to show temperature and wear
    const padMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemperature: { value: 40.0 },
        uWear: { value: 0.0 },
        uBaseColor: { value: new THREE.Color(0xd4d4d8) }, // zinc-300 (Babbitt metal)
        uHotColor: { value: new THREE.Color(0xf43f5e) }, // rose-500
        uWearColor: { value: new THREE.Color(0x78350f) } // amber-900 (worn/burnt)
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
        uniform float uTemperature;
        uniform float uWear;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        uniform vec3 uWearColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Heat mapping (normalize temp 40-90C)
          float heatFactor = clamp((uTemperature - 40.0) / 50.0, 0.0, 1.0);
          vec3 color = mix(uBaseColor, uHotColor, heatFactor * 0.7);

          // Wear mapping (concentrated in the middle of the pad)
          float wearZone = smoothstep(0.0, 0.5, 0.5 - abs(vUv.y - 0.5)) * smoothstep(0.0, 0.5, 0.5 - abs(vUv.x - 0.5));
          float noise = rand(vUv * 20.0);
          float wearFactor = clamp(uWear / 200.0, 0.0, 1.0) * wearZone * (noise * 0.5 + 0.5);
          
          color = mix(color, uWearColor, wearFactor);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec * (1.0 - wearFactor), 1.0);
        }
      `
    });

    for (let i = 0; i < padCount; i++) {
      const angle = (i / padCount) * Math.PI * 2;
      
      // Create a curved pad segment
      const shape = new THREE.Shape();
      const innerR = padRadius;
      const outerR = padRadius + padThickness;
      const span = (Math.PI * 2 / padCount) * 0.8; // 80% coverage
      
      shape.absarc(0, 0, outerR, -span/2, span/2, false);
      shape.absarc(0, 0, innerR, span/2, -span/2, true);
      
      const extrudeSettings = {
        depth: padHeight,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
      };
      
      const padGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      padGeo.center();
      padGeo.rotateX(Math.PI / 2);
      
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(
        Math.cos(angle) * (padRadius + padThickness/2),
        0,
        Math.sin(angle) * (padRadius + padThickness/2)
      );
      // Orient pad towards center
      pad.rotation.y = -angle;
      
      bearingGroup.add(pad);
      pads.push(pad);
    }

    // Outer Housing (Wireframe to see inside)
    const housingRadius = padRadius + padThickness + 1;
    const housingGeo = new THREE.CylinderGeometry(housingRadius, housingRadius, padHeight + 2, 32);
    const housingMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, // slate-700
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    bearingGroup.add(housing);

    // --- Oil Film Particles ---
    const oilParticleCount = 1000;
    const oilGeo = new THREE.BufferGeometry();
    const oilPos = new Float32Array(oilParticleCount * 3);
    
    for(let i=0; i<oilParticleCount; i++) {
       const theta = Math.random() * Math.PI * 2;
       const y = (Math.random() - 0.5) * padHeight;
       // Position in the gap between shaft and pads
       const r = shaftRadius + Math.random() * 0.2;
       
       oilPos[i*3] = r * Math.cos(theta);
       oilPos[i*3+1] = y;
       oilPos[i*3+2] = r * Math.sin(theta);
    }
    oilGeo.setAttribute('position', new THREE.BufferAttribute(oilPos, 3));
    
    const oilMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xfde047, // yellow-300
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const oilSystem = new THREE.Points(oilGeo, oilMat);
    bearingGroup.add(oilSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Rotate shaft based on rotor speed
      const speedFactor = currentState.rotorSpeed / 600; // Normalize
      shaft.rotation.y += 0.1 * speedFactor;

      // Update Pad Shader uniforms
      padMat.uniforms.uTemperature.value = currentState.temperature;
      padMat.uniforms.uWear.value = currentState.wearDepth;

      // Simulate Vibration (shake the shaft)
      const vibAmp = currentState.vibration * 0.05;
      shaft.position.x = Math.sin(time * 50) * vibAmp;
      shaft.position.z = Math.cos(time * 43) * vibAmp;

      // Update Oil Particles
      const positions = oilSystem.geometry.attributes.position.array as Float32Array;
      
      // Oil film thickness affects particle density/visibility
      const activeOil = Math.floor((currentState.oilFilmThickness / 100) * oilParticleCount);

      for(let i=0; i<oilParticleCount; i++) {
        if (i < activeOil) {
          // Calculate current angle and radius
          let x = positions[i*3];
          let z = positions[i*3+2];
          let r = Math.sqrt(x*x + z*z);
          let theta = Math.atan2(z, x);

          // Particles rotate with the shaft (drag flow)
          theta += 0.05 * speedFactor;
          
          // Add some turbulence if oil film is thin (friction)
          if (currentState.oilFilmThickness < 30) {
             positions[i*3+1] += (Math.random() - 0.5) * 0.1;
             if (Math.abs(positions[i*3+1]) > padHeight/2) positions[i*3+1] *= 0.9;
          }

          positions[i*3] = r * Math.cos(theta);
          positions[i*3+2] = r * Math.sin(theta);
        } else {
          // Hide inactive oil
          positions[i*3+1] = 1000;
        }
      }
      oilSystem.geometry.attributes.position.needsUpdate = true;
      
      // Oil color changes with temperature
      const tempFactor = Math.min(1.0, (currentState.temperature - 40) / 50);
      oilMat.color.setHSL(0.15 - tempFactor * 0.1, 0.8, 0.6); // Yellow to Orange

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
      shaftGeo.dispose();
      shaftMat.dispose();
      padMat.dispose();
      housingGeo.dispose();
      housingMat.dispose();
      oilGeo.dispose();
      oilMat.dispose();
      pads.forEach(p => p.geometry.dispose());
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
