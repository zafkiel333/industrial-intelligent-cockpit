import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BearingState } from './three-types';

interface ThreeSceneProps {
  state: BearingState;
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
    camera.position.set(12, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x0ea5e9, 2); // sky-500
    spotLight.position.set(-5, 5, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Bearing Assembly Model ---
    const bearingGroup = new THREE.Group();
    scene.add(bearingGroup);

    // Outer Ring (Stationary)
    const outerRadius = 5;
    const innerRadius = 4;
    const width = 2;

    const outerRingGeo = new THREE.TorusGeometry(outerRadius, 0.5, 16, 100);
    const outerRingMat = new THREE.MeshStandardMaterial({ 
      color: 0x64748b, // slate-500
      metalness: 0.9, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.8 // Semi-transparent to see inside
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    bearingGroup.add(outerRing);

    // Inner Ring (Rotating)
    const innerRingGeo = new THREE.CylinderGeometry(innerRadius, innerRadius, width, 64);
    const innerRingMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, // slate-400
      metalness: 0.8, 
      roughness: 0.3 
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    bearingGroup.add(innerRing);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(innerRadius - 0.1, innerRadius - 0.1, width * 3, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    bearingGroup.add(shaft);

    // Rolling Elements (Balls)
    const ballCount = 12;
    const ballRadius = 0.6;
    const pitchCircleRadius = (outerRadius + innerRadius) / 2;
    const balls: THREE.Mesh[] = [];

    // Shader for balls to show heat/wear
    const ballMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemperature: { value: 20.0 },
        uWear: { value: 0.0 },
        uBaseColor: { value: new THREE.Color(0xcbd5e1) }, // slate-300
        uHotColor: { value: new THREE.Color(0xff3300) }, // Red hot
        uWearColor: { value: new THREE.Color(0x332211) } // Dark worn spots
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
        uniform float uWear;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        uniform vec3 uWearColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Simple noise for wear pattern
        float rand(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }

        void main() {
          // Heat mapping (normalize temp 20-120C)
          float heatFactor = clamp((uTemperature - 20.0) / 100.0, 0.0, 1.0);
          vec3 color = mix(uBaseColor, uHotColor, heatFactor * 0.8);

          // Wear mapping (noise-based spots)
          float noise = rand(vPosition * 10.0);
          float wearSpot = smoothstep(0.7, 1.0, noise);
          // Normalize wear 0-50um
          float wearFactor = clamp(uWear / 50.0, 0.0, 1.0);
          
          color = mix(color, uWearColor, wearSpot * wearFactor);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular (shiny metal, less shiny when worn)
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
          
          gl_FragColor = vec4(color * diff + vec3(1.0) * spec * (1.0 - wearFactor*0.5), 1.0);
        }
      `
    });

    const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 32);
    
    for (let i = 0; i < ballCount; i++) {
      const angle = (i / ballCount) * Math.PI * 2;
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.position.set(
        Math.cos(angle) * pitchCircleRadius,
        0,
        Math.sin(angle) * pitchCircleRadius
      );
      bearingGroup.add(ball);
      balls.push(ball);
    }

    // Cage (Separator)
    const cageGeo = new THREE.TorusGeometry(pitchCircleRadius, 0.2, 16, 64);
    const cageMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.3, roughness: 0.7 }); // amber-700 (brass/bronze look)
    const cage = new THREE.Mesh(cageGeo, cageMat);
    cage.rotation.x = Math.PI / 2;
    bearingGroup.add(cage);

    // --- Lubrication Oil Particles ---
    const oilParticleCount = 500;
    const oilGeo = new THREE.BufferGeometry();
    const oilPos = new Float32Array(oilParticleCount * 3);
    const oilVel = [];

    for(let i=0; i<oilParticleCount; i++) {
       const r = innerRadius + Math.random() * (outerRadius - innerRadius);
       const theta = Math.random() * Math.PI * 2;
       const y = (Math.random() - 0.5) * width;
       
       oilPos[i*3] = r * Math.cos(theta);
       oilPos[i*3+1] = y;
       oilPos[i*3+2] = r * Math.sin(theta);
       
       oilVel.push({
         angular: 0.05 + Math.random() * 0.05,
         radial: (Math.random() - 0.5) * 0.02
       });
    }
    oilGeo.setAttribute('position', new THREE.BufferAttribute(oilPos, 3));
    
    const oilMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xfcd34d, // amber-300
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

      // Base rotation speed based on load
      const baseSpeed = 0.05 * (currentState.load / 100);
      
      // Rotate inner ring and shaft
      innerRing.rotation.y += baseSpeed;
      shaft.rotation.y += baseSpeed;

      // Rotate cage and balls (epicyclic gearing, roughly half speed of inner ring)
      const cageSpeed = baseSpeed * 0.4;
      cage.rotation.z -= cageSpeed; // Torus is rotated, so Z is the axis of revolution
      
      balls.forEach((ball, index) => {
        const angle = (index / ballCount) * Math.PI * 2 - (time * cageSpeed * 10); // *10 to match cage rotation visually
        ball.position.x = Math.cos(angle) * pitchCircleRadius;
        ball.position.z = Math.sin(angle) * pitchCircleRadius;
        // Balls also spin on their own axis
        ball.rotation.x += baseSpeed * 2;
        ball.rotation.z += baseSpeed * 2;
      });

      // Update Ball Shader uniforms
      ballMat.uniforms.uTemperature.value = currentState.temperature;
      ballMat.uniforms.uWear.value = currentState.wearDepth;

      // Simulate Vibration (shake the whole assembly)
      // Vibration amplitude is in mm/s, scale it down for visual effect
      const vibAmp = currentState.vibration * 0.02;
      bearingGroup.position.x = Math.sin(time * 50) * vibAmp;
      bearingGroup.position.y = Math.cos(time * 43) * vibAmp;

      // Update Oil Particles
      const positions = oilSystem.geometry.attributes.position.array as Float32Array;
      // Hide particles if oil level is low
      const activeOil = Math.floor((currentState.oilLevel / 100) * oilParticleCount);

      for(let i=0; i<oilParticleCount; i++) {
        if (i < activeOil) {
          // Calculate current angle and radius
          let x = positions[i*3];
          let z = positions[i*3+2];
          let r = Math.sqrt(x*x + z*z);
          let theta = Math.atan2(z, x);

          // Move particle
          theta += oilVel[i].angular * (currentState.load/100);
          r += oilVel[i].radial;

          // Keep within bounds
          if (r < innerRadius) r = innerRadius + 0.1;
          if (r > outerRadius) r = outerRadius - 0.1;

          positions[i*3] = r * Math.cos(theta);
          positions[i*3+2] = r * Math.sin(theta);
          
          // Add some jitter based on temperature (boiling/splashing)
          if (currentState.temperature > 80) {
             positions[i*3+1] += (Math.random() - 0.5) * 0.1;
             // Keep within width
             if (Math.abs(positions[i*3+1]) > width/2) positions[i*3+1] *= 0.9;
          }
        } else {
          // Hide inactive oil
          positions[i*3+1] = 1000;
        }
      }
      oilSystem.geometry.attributes.position.needsUpdate = true;
      
      // Oil color changes with wear (gets darker/dirtier)
      const oilDarkness = Math.min(1.0, currentState.wearDepth / 50);
      oilMat.color.setHSL(0.12, 0.8, 0.6 - (oilDarkness * 0.4)); // From amber to dark brown

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
      outerRingGeo.dispose();
      outerRingMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      ballGeo.dispose();
      ballMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      oilGeo.dispose();
      oilMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
