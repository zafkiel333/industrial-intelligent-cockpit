import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CapacitorState } from './three-types';

interface ThreeSceneProps {
  state: CapacitorState;
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
    camera.position.set(12, 8, 15);

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

    const pointLight = new THREE.PointLight(0xa855f7, 2, 20); // purple-500
    pointLight.position.set(-5, 5, 0);
    scene.add(pointLight);

    // --- Inverter Capacitor Bank Model ---
    const bankGroup = new THREE.Group();
    scene.add(bankGroup);

    // PCB Board
    const boardGeo = new THREE.BoxGeometry(10, 0.2, 8);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 }); // emerald-900
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = -0.1;
    bankGroup.add(board);

    // Capacitors (Electrolytic)
    const capCount = 4;
    const capRadius = 1.5;
    const capHeight = 5;
    const capacitors: THREE.Mesh[] = [];

    // Custom shader for capacitor body to show heat (ESR) and bulging (aging)
    const capMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemperature: { value: 40.0 },
        uAging: { value: 0.0 }, // 0 to 1 based on capacitance loss
        uBaseColor: { value: new THREE.Color(0x1e293b) }, // slate-800
        uHotColor: { value: new THREE.Color(0xd946ef) } // fuchsia-500
      },
      vertexShader: `
        uniform float uAging;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          
          vec3 pos = position;
          // Bulging effect: top of the cylinder bulges outwards as it ages (gas buildup)
          if (pos.y > 0.0) {
             float bulgeFactor = smoothstep(0.0, 2.5, pos.y); // 2.5 is half height
             pos.x += normalize(pos.x) * uAging * 0.3 * bulgeFactor;
             pos.z += normalize(pos.z) * uAging * 0.3 * bulgeFactor;
             // Top surface pushes up
             if (pos.y > 2.4) {
                pos.y += uAging * 0.5;
             }
          }

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTemperature;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // Heat mapping (normalize temp 40-105C)
          float heatFactor = clamp((uTemperature - 40.0) / 65.0, 0.0, 1.0);
          vec3 color = mix(uBaseColor, uHotColor, heatFactor * 0.8);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular (plastic sleeve)
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec, 1.0);
        }
      `
    });

    const capGeo = new THREE.CylinderGeometry(capRadius, capRadius, capHeight, 32);
    
    const positions = [
      [-2.5, 2.5], [2.5, 2.5],
      [-2.5, -2.5], [2.5, -2.5]
    ];

    positions.forEach(pos => {
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(pos[0], capHeight/2, pos[1]);
      bankGroup.add(cap);
      capacitors.push(cap);
      
      // Add terminals
      const termGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
      const termMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      const term1 = new THREE.Mesh(termGeo, termMat);
      term1.position.set(pos[0] - 0.5, capHeight + 0.25, pos[1]);
      const term2 = new THREE.Mesh(termGeo, termMat);
      term2.position.set(pos[0] + 0.5, capHeight + 0.25, pos[1]);
      bankGroup.add(term1);
      bankGroup.add(term2);
    });

    // --- Ripple Current Visualization (Energy pulses) ---
    const pulseCount = 40;
    const pulsesGeo = new THREE.BufferGeometry();
    const pulsePos = new Float32Array(pulseCount * 3);
    
    for(let i=0; i<pulseCount; i++) {
       pulsePos[i*3] = 0;
       pulsePos[i*3+1] = 1000;
       pulsePos[i*3+2] = 0;
    }
    pulsesGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
    
    const pulseMat = new THREE.PointsMaterial({
      size: 0.4,
      color: 0xd946ef, // fuchsia-500
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const pulseSystem = new THREE.Points(pulsesGeo, pulseMat);
    bankGroup.add(pulseSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Calculate aging factor (0 to 1) based on capacitance loss (assume 4700uF is nominal)
      const agingFactor = clamp((4700 - currentState.capacitance) / 940, 0, 1); // 20% loss is end of life

      // Update Capacitor Shader
      capMat.uniforms.uTemperature.value = currentState.temperature;
      capMat.uniforms.uAging.value = agingFactor;

      // Simulate Ripple Current Pulses
      const positions = pulseSystem.geometry.attributes.position.array as Float32Array;
      
      // More ripple current = more active pulses
      const activePulses = Math.floor((currentState.rippleCurrent / 100) * pulseCount);

      for(let i=0; i<pulseCount; i++) {
        if (i < activePulses) {
           // Spawn pulses moving between capacitors
           if (Math.random() > 0.9) {
              const startCap = positionsArray[Math.floor(Math.random() * 4)];
              const endCap = positionsArray[Math.floor(Math.random() * 4)];
              
              positions[i*3] = startCap[0] + (Math.random() - 0.5);
              positions[i*3+1] = capHeight + 0.5;
              positions[i*3+2] = startCap[1] + (Math.random() - 0.5);
              
              // Store target for movement (hacky way using unused array space if we had it, but we'll just jitter)
           } else {
              // Jitter / move towards center
              positions[i*3] += (Math.random() - 0.5) * 0.5;
              positions[i*3+2] += (Math.random() - 0.5) * 0.5;
              // Hide if it goes too far
              if (Math.abs(positions[i*3]) > 5) positions[i*3+1] = 1000;
           }
        } else {
           positions[i*3+1] = 1000;
        }
      }
      pulseSystem.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    const positionsArray = positions;

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
      boardGeo.dispose();
      boardMat.dispose();
      capGeo.dispose();
      capMat.dispose();
      pulsesGeo.dispose();
      pulseMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
