import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HardDriveState } from './three-types';

interface ThreeSceneProps {
  state: HardDriveState;
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
    camera.position.set(0, 15, 10);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 20); // sky-500
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // --- Hard Drive Model (HDD internals) ---
    const hddGroup = new THREE.Group();
    scene.add(hddGroup);

    // Casing (Bottom half)
    const caseGeo = new THREE.BoxGeometry(10, 1, 14);
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });
    const casing = new THREE.Mesh(caseGeo, caseMat);
    casing.position.y = -0.5;
    hddGroup.add(casing);

    // Platter (Disk)
    const platterRadius = 4.5;
    const platterGeo = new THREE.CylinderGeometry(platterRadius, platterRadius, 0.1, 64);
    
    // Custom shader for platter to show bad sectors and heat
    const platterMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemperature: { value: 40.0 },
        uBadSectors: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x94a3b8) }, // slate-400 (shiny metal)
        uHotColor: { value: new THREE.Color(0xef4444) }, // red-500
        uBadColor: { value: new THREE.Color(0x000000) } // black spots
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
        uniform float uBadSectors;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        uniform vec3 uBadColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Heat mapping (normalize temp 30-70C)
          float heatFactor = clamp((uTemperature - 30.0) / 40.0, 0.0, 1.0);
          vec3 color = mix(uBaseColor, uHotColor, heatFactor * 0.5);

          // Bad sectors (random black spots)
          float noise = rand(vUv * 50.0);
          if (noise < uBadSectors * 0.1) { // Scale bad sectors to noise threshold
             color = uBadColor;
          }

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // High specular for platter
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 128.0);
          
          // If it\'s a bad sector, no specular
          if (noise < uBadSectors * 0.1) spec = 0.0;

          gl_FragColor = vec4(color * diff + vec3(1.0) * spec, 1.0);
        }
      `
    });

    const platter = new THREE.Mesh(platterGeo, platterMat);
    platter.position.set(0, 0.2, -2);
    hddGroup.add(platter);

    // Spindle
    const spindleGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.position.set(0, 0.3, -2);
    hddGroup.add(spindle);

    // Actuator Arm
    const armGroup = new THREE.Group();
    armGroup.position.set(-3.5, 0.3, 4); // Pivot point
    hddGroup.add(armGroup);

    const armGeo = new THREE.BoxGeometry(1, 0.2, 6);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(0, 0, -3); // Offset from pivot
    armGroup.add(arm);

    // Read/Write Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0, -6);
    armGroup.add(head);

    // Pivot
    const pivotGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 32);
    const pivot = new THREE.Mesh(pivotGeo, spindleMat);
    armGroup.add(pivot);

    // --- Data Transfer Visualization ---
    const dataCount = 50;
    const dataGeo = new THREE.BufferGeometry();
    const dataPos = new Float32Array(dataCount * 3);
    for(let i=0; i<dataCount; i++) {
       dataPos[i*3] = 0; dataPos[i*3+1] = 1000; dataPos[i*3+2] = 0;
    }
    dataGeo.setAttribute('position', new THREE.BufferAttribute(dataPos, 3));
    const dataMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x0ea5e9, // sky-500
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const dataSystem = new THREE.Points(dataGeo, dataMat);
    hddGroup.add(dataSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let armAngle = 0;
    let armTarget = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Platter Shader
      platterMat.uniforms.uTemperature.value = currentState.temperature;
      // Scale bad sectors for visual (e.g., 1000 bad sectors = 1.0)
      platterMat.uniforms.uBadSectors.value = clamp(currentState.badSectors / 1000, 0, 1);

      // Rotate Platter
      platter.rotation.y -= 0.5; // Fast spin

      // Animate Actuator Arm (seeking)
      // If vibration is high, arm jitters
      const jitter = (Math.random() - 0.5) * (currentState.vibration * 0.1);
      
      if (Math.random() > 0.95) {
         // New seek target (angle between -0.2 and 0.5 radians)
         armTarget = -0.2 + Math.random() * 0.7;
      }
      armAngle += (armTarget - armAngle) * 0.2;
      armGroup.rotation.y = armAngle + jitter;

      // Apply vibration to whole HDD
      if (currentState.vibration > 1.0) {
         hddGroup.position.x = (Math.random() - 0.5) * (currentState.vibration * 0.05);
         hddGroup.position.z = (Math.random() - 0.5) * (currentState.vibration * 0.05);
      } else {
         hddGroup.position.x = 0;
         hddGroup.position.z = 0;
      }

      // Animate Data Transfer (particles flying from head to pivot)
      const positions = dataSystem.geometry.attributes.position.array as Float32Array;
      
      // Get head world position
      const headWorldPos = new THREE.Vector3();
      head.getWorldPosition(headWorldPos);
      
      // Get pivot world position
      const pivotWorldPos = new THREE.Vector3();
      pivot.getWorldPosition(pivotWorldPos);

      // TBW determines how much data is flowing (visual only)
      const activeData = Math.floor(clamp(currentState.tbw / 100, 10, dataCount));

      for(let i=0; i<dataCount; i++) {
        if (i < activeData) {
           if (positions[i*3+1] === 1000 || Math.random() > 0.9) {
              // Spawn at head
              positions[i*3] = headWorldPos.x + (Math.random() - 0.5) * 0.2;
              positions[i*3+1] = headWorldPos.y + 0.2;
              positions[i*3+2] = headWorldPos.z + (Math.random() - 0.5) * 0.2;
           } else {
              // Move towards pivot
              const dx = pivotWorldPos.x - positions[i*3];
              const dz = pivotWorldPos.z - positions[i*3+2];
              const dist = Math.sqrt(dx*dx + dz*dz);
              
              if (dist > 0.5) {
                 positions[i*3] += (dx/dist) * 0.5;
                 positions[i*3+2] += (dz/dist) * 0.5;
              } else {
                 positions[i*3+1] = 1000; // Hide
              }
           }
        } else {
           positions[i*3+1] = 1000;
        }
      }
      dataSystem.geometry.attributes.position.needsUpdate = true;

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
      caseGeo.dispose();
      caseMat.dispose();
      platterGeo.dispose();
      platterMat.dispose();
      spindleGeo.dispose();
      spindleMat.dispose();
      armGeo.dispose();
      armMat.dispose();
      headGeo.dispose();
      headMat.dispose();
      pivotGeo.dispose();
      dataGeo.dispose();
      dataMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
