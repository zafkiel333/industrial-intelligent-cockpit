import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BushingState } from './three-types';

interface ThreeSceneProps {
  state: BushingState;
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
    scene.fog = new THREE.FogExp2(0x315268, 0.015);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 15, 35);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00ffff, 2);
    dirLight1.position.set(10, 20, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff00ff, 1.5);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // --- Bushing Model ---
    const bushingGroup = new THREE.Group();
    scene.add(bushingGroup);

    // Central Conductor
    const conductorGeo = new THREE.CylinderGeometry(0.5, 0.5, 20, 32);
    const conductorMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.2 });
    const conductor = new THREE.Mesh(conductorGeo, conductorMat);
    bushingGroup.add(conductor);

    // Porcelain Insulator Sheds (Outer shell)
    const shedsGroup = new THREE.Group();
    const numSheds = 12;
    const shedSpacing = 1.2;
    const shedMat = new THREE.MeshPhysicalMaterial({
      color: 0xdddddd,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.6, // Glassy/Porcelain look
      thickness: 0.5,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < numSheds; i++) {
      // Create a shed shape (cone-like)
      const shedGeo = new THREE.CylinderGeometry(2, 3.5, 0.5, 32, 1, false);
      const shed = new THREE.Mesh(shedGeo, shedMat);
      shed.position.y = (i - numSheds / 2) * shedSpacing + 2; // Offset upwards
      shedsGroup.add(shed);
      
      // Add connecting cylinder between sheds
      if (i < numSheds - 1) {
         const connGeo = new THREE.CylinderGeometry(2, 2, shedSpacing - 0.5, 32);
         const conn = new THREE.Mesh(connGeo, shedMat);
         conn.position.y = shed.position.y + shedSpacing / 2;
         shedsGroup.add(conn);
      }
    }
    bushingGroup.add(shedsGroup);

    // Condenser Core (Inner layers)
    const coreGeo = new THREE.CylinderGeometry(1.5, 1.5, 18, 32);
    
    // Custom shader for condenser core to visualize moisture and aging
    const coreMat = new THREE.ShaderMaterial({
      uniforms: {
        uAging: { value: 0.0 },
        uMoisture: { value: 0.0 },
        uTime: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uAging;
        uniform float uMoisture;
        uniform float uTime;
        
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          // Base color (oil-impregnated paper)
          vec3 baseColor = vec3(0.8, 0.7, 0.5);
          
          // Aging darkens the paper
          vec3 agedColor = vec3(0.3, 0.2, 0.1);
          vec3 color = mix(baseColor, agedColor, uAging);
          
          // Moisture adds a blue/green tint and pulsating effect
          float moisturePulse = sin(uTime * 2.0 + vPosition.y) * 0.5 + 0.5;
          vec3 moistureColor = vec3(0.1, 0.5, 0.8);
          color = mix(color, moistureColor, uMoisture * moisturePulse * 0.5);
          
          // Add horizontal lines representing foil layers
          float lines = step(0.8, fract(vUv.y * 50.0));
          color -= lines * 0.2;

          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    bushingGroup.add(core);

    // Flange (Mounting base)
    const flangeGeo = new THREE.CylinderGeometry(4, 4, 1, 32);
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.4 });
    const flange = new THREE.Mesh(flangeGeo, flangeMat);
    flange.position.y = -6;
    bushingGroup.add(flange);

    // --- Oil Particles (Visualizing internal condition) ---
    const particleCount = 1000;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    
    for(let i=0; i < particleCount * 3; i+=3) {
      // Distribute particles within the core volume
      const radius = 0.6 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 17;
      
      posArray[i] = Math.cos(theta) * radius;
      posArray[i+1] = y;
      posArray[i+2] = Math.sin(theta) * radius;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffaa00, // Oil color
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    bushingGroup.add(particleSystem);


    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Core Shader
      coreMat.uniforms.uAging.value = currentState.agingFactor;
      coreMat.uniforms.uMoisture.value = currentState.moistureContent / 50; // Normalize moisture (max ~50ppm)
      coreMat.uniforms.uTime.value = time;

      // Animate oil particles based on temperature and pressure
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const speed = (currentState.oilTemperature / 100) * 0.05;
      
      for(let i=0; i < particleCount; i++) {
        positions[i*3 + 1] += speed; // Move up
        if (positions[i*3 + 1] > 8.5) {
           positions[i*3 + 1] = -8.5; // Reset to bottom
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Change particle color based on aging (darker oil)
      const r = 1.0 - currentState.agingFactor * 0.5;
      const g = 0.6 - currentState.agingFactor * 0.4;
      const b = 0.0;
      particlesMat.color.setRGB(r, g, b);

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
      conductorGeo.dispose();
      conductorMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      flangeGeo.dispose();
      flangeMat.dispose();
      shedMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
