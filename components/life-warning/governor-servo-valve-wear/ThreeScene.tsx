import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ValveState } from './three-types';

interface ThreeSceneProps {
  state: ValveState;
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
    camera.position.set(0, 10, 25);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // --- Servo Valve Model (Cutaway view) ---
    const valveGroup = new THREE.Group();
    scene.add(valveGroup);

    // Valve Body (Sleeve) - Transparent to see inside
    const bodyGeo = new THREE.CylinderGeometry(3, 3, 15, 32, 1, true);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.8, // Glass-like
      thickness: 0.5,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2; // Horizontal
    valveGroup.add(body);

    // Ports (P, T, A, B)
    const portGeo = new THREE.CylinderGeometry(1, 1, 4, 16);
    const portMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.4 });
    
    const portP = new THREE.Mesh(portGeo, portMat);
    portP.position.set(0, 3.5, 0);
    valveGroup.add(portP);

    const portT1 = new THREE.Mesh(portGeo, portMat);
    portT1.position.set(-5, 3.5, 0);
    valveGroup.add(portT1);

    const portT2 = new THREE.Mesh(portGeo, portMat);
    portT2.position.set(5, 3.5, 0);
    valveGroup.add(portT2);

    const portA = new THREE.Mesh(portGeo, portMat);
    portA.position.set(-2.5, -3.5, 0);
    valveGroup.add(portA);

    const portB = new THREE.Mesh(portGeo, portMat);
    portB.position.set(2.5, -3.5, 0);
    valveGroup.add(portB);

    // Spool (The moving part)
    const spoolGroup = new THREE.Group();
    valveGroup.add(spoolGroup);

    // Spool Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 18, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    spoolGroup.add(shaft);

    // Spool Lands (The wider parts that block flow)
    const landGeo = new THREE.CylinderGeometry(2.9, 2.9, 3, 32);
    
    // Custom shader for lands to show wear (scratches/erosion on edges)
    const landMat = new THREE.ShaderMaterial({
      uniforms: {
        uWearDepth: { value: 0.0 },
        uColor: { value: new THREE.Color(0xdddddd) },
        uWearColor: { value: new THREE.Color(0xffaa00) } // Copper/Brass color showing through
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
        uniform float uWearDepth;
        uniform vec3 uColor;
        uniform vec3 uWearColor;
        
        varying vec2 vUv;
        varying vec3 vPosition;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec3 color = uColor;
          
          // Wear happens mostly on the edges (y close to +/- 1.5)
          float edgeDist = abs(vPosition.y) / 1.5;
          float wearZone = smoothstep(0.8, 1.0, edgeDist);
          
          // Add noise for scratchy look
          float noise = rand(vPosition.xz * 20.0);
          
          // Apply wear
          float actualWear = wearZone * noise * (uWearDepth / 50.0); // Normalize wear depth
          
          if (actualWear > 0.5) {
             color = mix(uColor, uWearColor, (actualWear - 0.5) * 2.0);
          }

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          vec3 normal = normalize(vec3(vPosition.x, 0.0, vPosition.z));
          float diff = max(dot(normal, lightDir), 0.3);

          gl_FragColor = vec4(color * diff, 1.0);
        }
      `
    });

    const land1 = new THREE.Mesh(landGeo, landMat);
    land1.rotation.z = Math.PI / 2;
    land1.position.x = -2.5;
    spoolGroup.add(land1);

    const land2 = new THREE.Mesh(landGeo, landMat);
    land2.rotation.z = Math.PI / 2;
    land2.position.x = 2.5;
    spoolGroup.add(land2);

    // --- Oil Flow Particles ---
    const particleCount = 2000;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);
    
    const colorClean = new THREE.Color(0x00ffff); // Clean oil
    const colorDirty = new THREE.Color(0x8b4513); // Dirty/Contaminated oil

    for(let i=0; i < particleCount * 3; i+=3) {
      // Initialize randomly inside the valve body
      posArray[i] = (Math.random() - 0.5) * 14;
      const radius = Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      posArray[i+1] = Math.sin(theta) * radius;
      posArray[i+2] = Math.cos(theta) * radius;
      
      colorClean.toArray(colorArray, i);
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    valveGroup.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Move Spool based on displacement (-2 to +2 mm)
      // Smooth interpolation for visual effect
      spoolGroup.position.x += (currentState.spoolDisplacement - spoolGroup.position.x) * 0.1;

      // Update Wear Shader
      landMat.uniforms.uWearDepth.value = currentState.wearDepth;

      // Update Oil Particles
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const colors = particleSystem.geometry.attributes.color.array as Float32Array;
      
      // Determine oil color based on cleanliness (NAS grade 5=clean, 12=dirty)
      const dirtFactor = Math.max(0, Math.min(1, (currentState.oilCleanliness - 5) / 7));
      const currentOilColor = new THREE.Color().lerpColors(colorClean, colorDirty, dirtFactor);

      for(let i=0; i < particleCount; i++) {
        // Flow logic based on spool position
        // If spool is positive, flow P -> A, B -> T2
        // If spool is negative, flow P -> B, A -> T1
        
        let vx = 0;
        let vy = 0;
        const px = positions[i*3];
        const py = positions[i*3+1];

        // Simplified flow simulation
        if (py > 0) { // Top half (P, T1, T2)
           if (px > -1 && px < 1) { // Near P
              vy = -0.1 * currentState.pressureDrop; // Flow in from P
           } else if (px < -4 && spoolGroup.position.x < -0.5) { // Near T1
              vy = 0.1 * currentState.pressureDrop; // Flow out to T1
           } else if (px > 4 && spoolGroup.position.x > 0.5) { // Near T2
              vy = 0.1 * currentState.pressureDrop; // Flow out to T2
           }
        } else { // Bottom half (A, B)
           if (px < 0) { // Near A
              if (spoolGroup.position.x > 0.5) {
                 vy = -0.1 * currentState.pressureDrop; // Flow out to A
              } else if (spoolGroup.position.x < -0.5) {
                 vy = 0.1 * currentState.pressureDrop; // Flow in from A
              }
           } else { // Near B
              if (spoolGroup.position.x < -0.5) {
                 vy = -0.1 * currentState.pressureDrop; // Flow out to B
              } else if (spoolGroup.position.x > 0.5) {
                 vy = 0.1 * currentState.pressureDrop; // Flow in from B
              }
           }
        }

        // Add some turbulence based on wear (worn edges cause eddies)
        const turbulence = currentState.wearDepth * 0.005;
        vx += (Math.random() - 0.5) * turbulence;
        vy += (Math.random() - 0.5) * turbulence;

        // Move particles horizontally towards exits/entrances
        if (vy < 0 && py < 0) {
           vx = px < 0 ? -0.1 : 0.1; // Move towards A or B
        } else if (vy > 0 && py > 0) {
           vx = px < 0 ? -0.1 : 0.1; // Move towards T1 or T2
        }

        positions[i*3] += vx;
        positions[i*3+1] += vy;

        // Reset particles that leave the valve
        if (Math.abs(positions[i*3]) > 7 || Math.abs(positions[i*3+1]) > 3.5) {
           // Respawn at P or A/B depending on flow
           if (Math.random() > 0.5) {
             positions[i*3] = (Math.random() - 0.5) * 1.5; // P port
             positions[i*3+1] = 3.4;
           } else {
             positions[i*3] = (Math.random() > 0.5 ? -2.5 : 2.5) + (Math.random() - 0.5); // A or B port
             positions[i*3+1] = -3.4;
           }
           positions[i*3+2] = (Math.random() - 0.5) * 2;
        }

        // Update color
        currentOilColor.toArray(colors, i*3);
        
        // Add "sparks" for high friction/wear
        if (currentState.frictionForce > 500 && Math.random() < 0.01) {
           colors[i*3] = 1; colors[i*3+1] = 1; colors[i*3+2] = 0; // Yellow spark
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.geometry.attributes.color.needsUpdate = true;

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
      bodyGeo.dispose();
      bodyMat.dispose();
      portGeo.dispose();
      portMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      landGeo.dispose();
      landMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
