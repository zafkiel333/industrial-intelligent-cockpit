import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BallState } from './three-types';

interface ThreeSceneProps {
  state: BallState;
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
    camera.position.set(0, 0, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x6366f1, 2); // indigo-500
    spotLight.position.set(0, 0, 15);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Mill Shell (Cross-section) ---
    const shellGeo = new THREE.RingGeometry(9.5, 10, 64);
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x475569, side: THREE.DoubleSide, metalness: 0.8, roughness: 0.2 });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    scene.add(shell);

    // Liners (Lifters)
    const lifterCount = 24;
    const lifterGeo = new THREE.BoxGeometry(1, 0.5, 2);
    const lifterMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const liftersGroup = new THREE.Group();
    for (let i = 0; i < lifterCount; i++) {
       const angle = (i / lifterCount) * Math.PI * 2;
       const lifter = new THREE.Mesh(lifterGeo, lifterMat);
       lifter.position.set(Math.cos(angle) * 9.2, Math.sin(angle) * 9.2, 0);
       lifter.rotation.z = angle;
       liftersGroup.add(lifter);
    }
    scene.add(liftersGroup);

    // --- Steel Balls and Ore Particles ---
    // Using InstancedMesh for performance
    const ballCount = 800;
    const ballGeo = new THREE.SphereGeometry(0.3, 16, 16);
    
    // Custom shader for balls to show wear (size reduction) and impact energy
    const ballMat = new THREE.ShaderMaterial({
      uniforms: {
        uImpactEnergy: { value: 0.0 },
        uBaseColor: { value: new THREE.Color(0x94a3b8) }, // steel
        uImpactColor: { value: new THREE.Color(0xf43f5e) } // rose-500 (high energy impact)
      },
      vertexShader: `
        attribute float aSize;
        attribute float aImpact;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vImpact;
        void main() {
          vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
          
          // Apply individual size scaling
          vec3 scaledPos = position * aSize;
          
          vec4 worldPos = instanceMatrix * vec4(scaledPos, 1.0);
          vPosition = (modelViewMatrix * worldPos).xyz;
          vImpact = aImpact;
          
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uImpactColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vImpact;

        void main() {
          vec3 color = mix(uBaseColor, uImpactColor, vImpact);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.3);
          
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec, 1.0);
        }
      `
    });

    const ballMesh = new THREE.InstancedMesh(ballGeo, ballMat, ballCount);
    
    // Physics simulation arrays
    const ballPositions = new Float32Array(ballCount * 2); // x, y
    const ballVelocities = new Float32Array(ballCount * 2);
    const ballSizes = new Float32Array(ballCount);
    const ballImpacts = new Float32Array(ballCount);

    const dummy = new THREE.Object3D();

    // Initialize balls inside the mill
    for (let i = 0; i < ballCount; i++) {
       const angle = Math.random() * Math.PI * 2;
       const radius = Math.random() * 8;
       ballPositions[i*2] = Math.cos(angle) * radius;
       ballPositions[i*2+1] = Math.sin(angle) * radius;
       
       // Randomize initial sizes to simulate a mixed ball charge
       ballSizes[i] = 0.5 + Math.random() * 0.5; // 0.5 to 1.0 multiplier
       
       dummy.position.set(ballPositions[i*2], ballPositions[i*2+1], (Math.random() - 0.5) * 2);
       dummy.updateMatrix();
       ballMesh.setMatrixAt(i, dummy.matrix);
    }

    ballMesh.geometry.setAttribute('aSize', new THREE.InstancedBufferAttribute(ballSizes, 1));
    ballMesh.geometry.setAttribute('aImpact', new THREE.InstancedBufferAttribute(ballImpacts, 1));
    
    scene.add(ballMesh);

    // --- Slurry (Background fluid) ---
    const slurryGeo = new THREE.CircleGeometry(9, 64);
    const slurryMat = new THREE.MeshBasicMaterial({ 
      color: 0x3f3f46, // zinc-700
      transparent: true,
      opacity: 0.5
    });
    const slurry = new THREE.Mesh(slurryGeo, slurryMat);
    slurry.position.z = -1;
    scene.add(slurry);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let millRotation = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1); // Cap dt to prevent physics explosion
      const currentState = stateRef.current;

      // Mill rotation (critical speed ~ 20 rpm for a large mill, let's say 1 rad/s)
      const speedRad = (currentState.millSpeed / 100) * 2.0; 
      millRotation += speedRad * dt;
      liftersGroup.rotation.z = millRotation;

      // Simple 2D Physics for balls
      const gravity = -9.81;
      const millRadius = 9.0;
      const friction = 0.98; // Dampening
      const slurryViscosity = 1.0 - (currentState.slurryDensity / 200); // Higher density = more viscous

      for (let i = 0; i < ballCount; i++) {
         let px = ballPositions[i*2];
         let py = ballPositions[i*2+1];
         let vx = ballVelocities[i*2];
         let vy = ballVelocities[i*2+1];

         // Gravity
         vy += gravity * dt;

         // Slurry drag
         vx *= slurryViscosity;
         vy *= slurryViscosity;

         // Update position
         px += vx * dt;
         py += vy * dt;

         // Collision with mill shell
         const distFromCenter = Math.sqrt(px*px + py*py);
         if (distFromCenter > millRadius) {
            // Normal vector
            const nx = px / distFromCenter;
            const ny = py / distFromCenter;

            // Push back inside
            px = nx * millRadius;
            py = ny * millRadius;

            // Reflect velocity (bounce)
            const dot = vx * nx + vy * ny;
            vx = (vx - 2 * dot * nx) * 0.5; // Inelastic collision
            vy = (vy - 2 * dot * ny) * 0.5;

            // Add velocity from mill rotation (friction with shell/lifters)
            // Tangent vector
            const tx = -ny;
            const ty = nx;
            
            // If ball is in the lower right quadrant, it gets lifted
            if (px > 0 && py < 0) {
               // Apply lifting force based on mill speed
               vx += tx * speedRad * 2.0;
               vy += ty * speedRad * 2.0;
            }

            // Calculate impact energy for visual effect
            const impactEnergy = Math.abs(dot);
            ballImpacts[i] = clamp(impactEnergy / 10, 0, 1);
         } else {
            // Fade impact glow
            ballImpacts[i] *= 0.9;
         }

         // Very simplified ball-ball collision (just push away from center of mass slightly to prevent clumping)
         // A real DEM simulation is too heavy for this.
         if (py < -4) {
            // Simulate crowding at the bottom
            px += (Math.random() - 0.5) * 0.5;
            py += Math.random() * 0.2;
         }

         // Apply wear (reduce size)
         // Wear rate is g/t, we simulate it by slowly reducing the size multiplier
         // Higher hardness and speed = faster wear
         const wearFactor = (currentState.ballWearRate / 1000) * dt * 0.01;
         ballSizes[i] -= wearFactor;
         
         // If ball gets too small, "add a new one" (reset size and position to top)
         if (ballSizes[i] < 0.2) {
            ballSizes[i] = 1.0;
            px = (Math.random() - 0.5) * 4;
            py = 8;
            vx = 0;
            vy = 0;
         }

         ballPositions[i*2] = px;
         ballPositions[i*2+1] = py;
         ballVelocities[i*2] = vx;
         ballVelocities[i*2+1] = vy;

         dummy.position.set(px, py, (i % 5) * 0.4 - 1); // Stagger in Z
         dummy.updateMatrix();
         ballMesh.setMatrixAt(i, dummy.matrix);
      }

      ballMesh.instanceMatrix.needsUpdate = true;
      ballMesh.geometry.attributes.aSize.needsUpdate = true;
      ballMesh.geometry.attributes.aImpact.needsUpdate = true;

      // Adjust slurry level based on density (visual only)
      slurry.scale.setScalar(0.8 + (currentState.slurryDensity / 100) * 0.2);

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
      shellGeo.dispose();
      shellMat.dispose();
      lifterGeo.dispose();
      lifterMat.dispose();
      ballGeo.dispose();
      ballMat.dispose();
      slurryGeo.dispose();
      slurryMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
