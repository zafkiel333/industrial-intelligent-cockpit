import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RollerState } from './three-types';

interface ThreeSceneProps {
  state: RollerState;
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
    camera.position.set(0, 5, 15);

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

    const spotLight = new THREE.SpotLight(0x3b82f6, 2); // blue-500
    spotLight.position.set(0, 5, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Roller Model ---
    const rollerGroup = new THREE.Group();
    scene.add(rollerGroup);

    // Central Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    rollerGroup.add(shaft);

    // Roller Body (Tube)
    const tubeGeo = new THREE.CylinderGeometry(2, 2, 8, 32);
    
    // Custom shader for tube to show dust and heat
    const tubeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemperature: { value: 25.0 },
        uDust: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x334155) }, // slate-700
        uHotColor: { value: new THREE.Color(0xef4444) }, // red-500
        uDustColor: { value: new THREE.Color(0xa8a29e) } // stone-400
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
        uniform float uDust;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        uniform vec3 uDustColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Heat mapping (normalize temp 25-85C)
          float heatFactor = clamp((uTemperature - 25.0) / 60.0, 0.0, 1.0);
          vec3 color = mix(uBaseColor, uHotColor, heatFactor * 0.7); // 0.7 so it doesn't go full red

          // Dust accumulation
          float noise = rand(vUv * 20.0);
          float dustFactor = clamp(uDust * 1.5 - noise * 0.5, 0.0, 1.0);
          color = mix(color, uDustColor, dustFactor);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular (dust makes it less shiny)
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec * (1.0 - dustFactor), 1.0);
        }
      `
    });

    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.rotation.z = Math.PI / 2;
    rollerGroup.add(tube);

    // Bearings (Ends)
    const bearingGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.5, 32);
    const bearingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.5 });
    
    const bearingLeft = new THREE.Mesh(bearingGeo, bearingMat);
    bearingLeft.position.x = -4.25;
    bearingLeft.rotation.z = Math.PI / 2;
    rollerGroup.add(bearingLeft);

    const bearingRight = new THREE.Mesh(bearingGeo, bearingMat);
    bearingRight.position.x = 4.25;
    bearingRight.rotation.z = Math.PI / 2;
    rollerGroup.add(bearingRight);

    // --- Dust Particle System ---
    const dustCount = 1000;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustVel = new Float32Array(dustCount * 3);
    
    for(let i=0; i<dustCount; i++) {
       dustPos[i*3] = (Math.random() - 0.5) * 10;
       dustPos[i*3+1] = (Math.random() - 0.5) * 10;
       dustPos[i*3+2] = (Math.random() - 0.5) * 10;
       
       dustVel[i*3] = (Math.random() - 0.5) * 0.02;
       dustVel[i*3+1] = Math.random() * 0.05; // Upwards drift
       dustVel[i*3+2] = (Math.random() - 0.5) * 0.02;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    
    const dustMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xa8a29e, // stone-400
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const dustSystem = new THREE.Points(dustGeo, dustMat);
    scene.add(dustSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Tube Shader
      tubeMat.uniforms.uTemperature.value = currentState.bearingTemperature;
      tubeMat.uniforms.uDust.value = currentState.dustAccumulation / 100;

      // Rotate Roller
      // RPM to radians per frame (approx 60fps)
      const rps = currentState.rotationalSpeed / 60;
      const radPerFrame = rps * Math.PI * 2 * 0.016;
      tube.rotation.x -= radPerFrame;

      // Apply Vibration
      if (currentState.vibration > 2.0) {
         const jitterX = (Math.random() - 0.5) * (currentState.vibration * 0.02);
         const jitterY = (Math.random() - 0.5) * (currentState.vibration * 0.02);
         rollerGroup.position.set(jitterX, jitterY, 0);
      } else {
         rollerGroup.position.set(0, 0, 0);
      }

      // Animate Dust Particles
      const positions = dustSystem.geometry.attributes.position.array as Float32Array;
      
      // Dust amount based on accumulation and speed
      const activeDust = Math.floor(clamp((currentState.dustAccumulation / 100) * dustCount * (currentState.rotationalSpeed / 300), 0, dustCount));

      for(let i=0; i<dustCount; i++) {
         if (i < activeDust) {
            positions[i*3] += dustVel[i*3];
            positions[i*3+1] += dustVel[i*3+1];
            positions[i*3+2] += dustVel[i*3+2];

            // Reset if out of bounds
            if (positions[i*3+1] > 5 || Math.abs(positions[i*3]) > 6 || Math.abs(positions[i*3+2]) > 6) {
               // Spawn near roller
               positions[i*3] = (Math.random() - 0.5) * 8;
               positions[i*3+1] = -2 + Math.random();
               positions[i*3+2] = (Math.random() - 0.5) * 4;
            }
         } else {
            positions[i*3+1] = 1000; // Hide
         }
      }
      dustSystem.geometry.attributes.position.needsUpdate = true;

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
      tubeGeo.dispose();
      tubeMat.dispose();
      bearingGeo.dispose();
      bearingMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
