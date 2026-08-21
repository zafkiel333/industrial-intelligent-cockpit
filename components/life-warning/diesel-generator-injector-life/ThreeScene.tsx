import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { InjectorState } from './three-types';

interface ThreeSceneProps {
  state: InjectorState;
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

    const spotLight = new THREE.SpotLight(0xf97316, 2); // orange-500
    spotLight.position.set(0, -5, 5);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Injector Model ---
    const injectorGroup = new THREE.Group();
    scene.add(injectorGroup);

    // Main Body
    const bodyGeo = new THREE.CylinderGeometry(1, 1, 6, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, // slate-600
      metalness: 0.8,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 3;
    injectorGroup.add(body);

    // Nozzle Nut
    const nutGeo = new THREE.CylinderGeometry(1.2, 0.8, 2, 6); // Hexagonal
    const nutMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.4 });
    const nut = new THREE.Mesh(nutGeo, nutMat);
    nut.position.y = -1;
    injectorGroup.add(nut);

    // Nozzle Tip
    const tipGeo = new THREE.CylinderGeometry(0.8, 0.2, 2, 32);
    
    // Custom shader for nozzle tip to show carbon buildup (coking)
    const tipMat = new THREE.ShaderMaterial({
      uniforms: {
        uCoking: { value: 0.0 }, // 0 to 1 based on impurities/hours
        uBaseColor: { value: new THREE.Color(0x94a3b8) }, // slate-400 (clean metal)
        uCokeColor: { value: new THREE.Color(0x0a0a0a) } // almost black
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
        uniform float uCoking;
        uniform vec3 uBaseColor;
        uniform vec3 uCokeColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Carbon buildup is heavier at the very tip (vUv.y close to 0)
          float tipConcentration = 1.0 - vUv.y;
          float noise = rand(vUv * 20.0);
          
          float cokeFactor = clamp(uCoking * tipConcentration * 2.0 + (noise * 0.2), 0.0, 1.0);
          vec3 color = mix(uBaseColor, uCokeColor, cokeFactor);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular (metal is shiny, coke is dull)
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec * (1.0 - cokeFactor), 1.0);
        }
      `
    });

    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = -3;
    injectorGroup.add(tip);

    // --- Fuel Spray Particle System ---
    const particleCount = 2000;
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPos = new Float32Array(particleCount * 3);
    const sprayVel = new Float32Array(particleCount * 3);
    const sprayLife = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
       sprayPos[i*3] = 0;
       sprayPos[i*3+1] = 1000; // Hidden initially
       sprayPos[i*3+2] = 0;
       sprayLife[i] = 0;
    }
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
    
    const sprayMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xfde047, // yellow-300 (diesel mist)
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const spraySystem = new THREE.Points(sprayGeo, sprayMat);
    scene.add(spraySystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let isInjecting = false;
    let injectionTimer = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();
      const currentState = stateRef.current;

      // Update Injector Shader (Coking)
      // Coking increases with impurities and hours
      const cokingFactor = clamp((currentState.fuelImpurities / 100) + (currentState.operatingHours / 10000), 0, 1);
      tipMat.uniforms.uCoking.value = cokingFactor;

      // Simulate Injection Cycle (Pulse)
      injectionTimer += 0.016; // Approx frame time
      if (injectionTimer > 1.0) { // 1 second cycle
         injectionTimer = 0;
         isInjecting = true;
      }
      if (injectionTimer > 0.2) { // 200ms injection duration
         isInjecting = false;
      }

      // Animate Spray Particles
      const positions = spraySystem.geometry.attributes.position.array as Float32Array;
      
      // Spray characteristics based on state
      const angleRad = (currentState.sprayAngle / 2) * (Math.PI / 180);
      const speedBase = currentState.fuelPressure / 100; // e.g., 1500 bar -> 15
      const atomization = currentState.atomizationQuality / 100; // 1.0 is fine mist, 0.0 is large drops/streams

      // Adjust particle size based on atomization (poor atomization = larger drops)
      sprayMat.size = 0.05 + (1.0 - atomization) * 0.2;

      let activeCount = 0;

      for(let i=0; i<particleCount; i++) {
         if (sprayLife[i] > 0) {
            // Particle is alive, move it
            positions[i*3] += sprayVel[i*3] * 0.016;
            positions[i*3+1] += sprayVel[i*3+1] * 0.016;
            positions[i*3+2] += sprayVel[i*3+2] * 0.016;
            
            // Gravity effect (more pronounced if poor atomization)
            sprayVel[i*3+1] -= 9.8 * 0.016 * (1.0 - atomization + 0.1);

            sprayLife[i] -= 0.016;
            if (sprayLife[i] <= 0) {
               positions[i*3+1] = 1000; // Hide
            }
         } else if (isInjecting && activeCount < (currentState.fuelPressure / 20)) {
            // Spawn new particle
            activeCount++;
            
            // Start at nozzle tip
            positions[i*3] = (Math.random() - 0.5) * 0.2;
            positions[i*3+1] = -4.0;
            positions[i*3+2] = (Math.random() - 0.5) * 0.2;
            
            // Determine velocity vector based on spray angle
            // If atomization is poor, angle becomes narrower (streaming)
            const actualAngle = angleRad * atomization;
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * actualAngle;
            
            const speed = speedBase * (0.8 + Math.random() * 0.4);
            
            sprayVel[i*3] = Math.sin(phi) * Math.cos(theta) * speed;
            sprayVel[i*3+1] = -Math.cos(phi) * speed; // Downwards
            sprayVel[i*3+2] = Math.sin(phi) * Math.sin(theta) * speed;
            
            // If poor atomization, add some random "dribble" particles
            if (Math.random() > atomization) {
               sprayVel[i*3] *= 0.2;
               sprayVel[i*3+1] *= 0.5;
               sprayVel[i*3+2] *= 0.2;
            }

            sprayLife[i] = 0.5 + Math.random() * 0.5; // Live for 0.5-1.0s
         }
      }
      spraySystem.geometry.attributes.position.needsUpdate = true;

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
      bodyGeo.dispose();
      bodyMat.dispose();
      nutGeo.dispose();
      nutMat.dispose();
      tipGeo.dispose();
      tipMat.dispose();
      sprayGeo.dispose();
      sprayMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
