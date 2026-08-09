import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GearboxOilState } from './three-types';

interface ThreeSceneProps {
  state: GearboxOilState;
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
    scene.background = new THREE.Color(0x020617); // slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);

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

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 2, 20); // amber-500
    pointLight.position.set(0, -5, 0);
    scene.add(pointLight);

    // --- Gearbox Model ---
    const gearboxGroup = new THREE.Group();
    scene.add(gearboxGroup);

    // Create a simple gear shape
    const createGear = (radius: number, teeth: number, thickness: number, color: number) => {
      const shape = new THREE.Shape();
      const innerRadius = radius * 0.8;
      
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? radius : innerRadius;
        if (i === 0) shape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      shape.closePath();

      const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();
      
      const material = new THREE.MeshStandardMaterial({ 
        color: color, 
        metalness: 0.9, 
        roughness: 0.3 
      });
      
      return new THREE.Mesh(geometry, material);
    };

    const gear1 = createGear(4, 20, 2, 0x64748b); // slate-500
    gear1.position.set(-3, 0, 0);
    gearboxGroup.add(gear1);

    const gear2 = createGear(2, 10, 2, 0x475569); // slate-600
    gear2.position.set(3, 0, 0);
    gearboxGroup.add(gear2);

    // --- Oil Fluid Simulation (Particles) ---
    const particleCount = 3000;
    const oilGeo = new THREE.BufferGeometry();
    const oilPos = new Float32Array(particleCount * 3);
    const oilVel = new Float32Array(particleCount * 3);
    
    // Initialize particles in a "bath" at the bottom
    for(let i=0; i<particleCount; i++) {
       oilPos[i*3] = (Math.random() - 0.5) * 12;
       oilPos[i*3+1] = -4 + (Math.random() * 2); // Bottom area
       oilPos[i*3+2] = (Math.random() - 0.5) * 6;
       
       oilVel[i*3] = 0;
       oilVel[i*3+1] = 0;
       oilVel[i*3+2] = 0;
    }
    oilGeo.setAttribute('position', new THREE.BufferAttribute(oilPos, 3));
    
    // Custom shader for oil particles to show degradation
    const oilMat = new THREE.ShaderMaterial({
      uniforms: {
        uWaterContent: { value: 0.0 }, // 0 to 1 (makes oil cloudy/milky)
        uMetallic: { value: 0.0 }, // 0 to 1 (adds dark/shiny specks)
        uBaseColor: { value: new THREE.Color(0xd97706) }, // amber-600 (clean oil)
        uWaterColor: { value: new THREE.Color(0xfde68a) }, // amber-200 (milky)
        uMetalColor: { value: new THREE.Color(0x1e293b) } // slate-800 (dark debris)
      },
      vertexShader: `
        attribute float aType; // 0=oil, 1=metal
        varying float vType;
        void main() {
          vType = mod(float(gl_VertexID), 10.0) < 1.0 ? 1.0 : 0.0; // 10% are potential metal particles
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (vType > 0.5 ? 4.0 : 8.0) * (10.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uWaterContent;
        uniform float uMetallic;
        uniform vec3 uBaseColor;
        uniform vec3 uWaterColor;
        uniform vec3 uMetalColor;
        
        varying float vType;

        void main() {
          // Circular particle
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if(ll > 0.5) discard;

          vec3 color = uBaseColor;
          float alpha = 0.6;

          if (vType > 0.5) {
             // This is a potential metal particle
             if (uMetallic > 0.1) {
                color = uMetalColor;
                alpha = 1.0;
             } else {
                // Hide it if metallic is low
                discard;
             }
          } else {
             // Normal oil particle, mix with water color based on water content
             color = mix(uBaseColor, uWaterColor, uWaterContent);
             // Water makes it more opaque (milky)
             alpha = mix(0.6, 0.9, uWaterContent);
          }

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    const oilSystem = new THREE.Points(oilGeo, oilMat);
    scene.add(oilSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Rotate Gears
      // Speed depends somewhat on viscosity (lower viscosity = slightly faster visual spin for effect)
      const speedFactor = 1.0 + (320 - currentState.viscosity) / 320;
      gear1.rotation.z -= 0.02 * speedFactor;
      gear2.rotation.z += 0.04 * speedFactor; // Gear ratio 2:1

      // Update Oil Shader
      oilMat.uniforms.uWaterContent.value = clamp(currentState.waterContent / 1000, 0, 1);
      oilMat.uniforms.uMetallic.value = clamp(currentState.metallicParticles / 500, 0, 1);

      // Animate Oil Particles (Splash and Flow)
      const positions = oilSystem.geometry.attributes.position.array as Float32Array;
      
      // Viscosity affects how "sticky" the oil is to the gears
      // High viscosity (cold/thick) = sticks more, moves slower
      // Low viscosity (hot/thin) = splashes more, falls faster
      const flowSpeed = 1.0 + (320 - currentState.viscosity) / 320;

      for(let i=0; i<particleCount; i++) {
         let x = positions[i*3];
         let y = positions[i*3+1];
         let z = positions[i*3+2];

         // Basic gravity
         oilVel[i*3+1] -= 0.01 * flowSpeed;

         // Interaction with Gear 1 (Left)
         const distToGear1 = Math.sqrt(Math.pow(x - gear1.position.x, 2) + Math.pow(y - gear1.position.y, 2));
         if (distToGear1 < 4.2 && distToGear1 > 3.5 && Math.abs(z) < 1.5) {
            // Caught by gear teeth, move upwards and around
            const angle = Math.atan2(y - gear1.position.y, x - gear1.position.x);
            const newAngle = angle - 0.05 * speedFactor;
            
            // Stickiness based on viscosity
            if (Math.random() > (currentState.viscosity / 600)) {
               // Thrown off
               oilVel[i*3] = Math.cos(newAngle) * 0.2 * flowSpeed;
               oilVel[i*3+1] = Math.sin(newAngle) * 0.2 * flowSpeed;
            } else {
               // Sticks to gear
               x = gear1.position.x + Math.cos(newAngle) * 4.0;
               y = gear1.position.y + Math.sin(newAngle) * 4.0;
               oilVel[i*3] = 0;
               oilVel[i*3+1] = 0;
            }
         }

         // Interaction with Gear 2 (Right)
         const distToGear2 = Math.sqrt(Math.pow(x - gear2.position.x, 2) + Math.pow(y - gear2.position.y, 2));
         if (distToGear2 < 2.2 && distToGear2 > 1.5 && Math.abs(z) < 1.5) {
            const angle = Math.atan2(y - gear2.position.y, x - gear2.position.x);
            const newAngle = angle + 0.1 * speedFactor;
            
            if (Math.random() > (currentState.viscosity / 600)) {
               oilVel[i*3] = Math.cos(newAngle) * 0.2 * flowSpeed;
               oilVel[i*3+1] = Math.sin(newAngle) * 0.2 * flowSpeed;
            } else {
               x = gear2.position.x + Math.cos(newAngle) * 2.0;
               y = gear2.position.y + Math.sin(newAngle) * 2.0;
               oilVel[i*3] = 0;
               oilVel[i*3+1] = 0;
            }
         }

         // Apply velocity
         x += oilVel[i*3];
         y += oilVel[i*3+1];
         z += oilVel[i*3+2];

         // Floor collision (Oil bath)
         if (y < -4 + (Math.random() * 1.0)) {
            y = -4 + (Math.random() * 1.0);
            oilVel[i*3+1] *= -0.3; // Dampened bounce
            
            // Slowly move towards center to be picked up again
            if (x < -3) oilVel[i*3] += 0.005;
            if (x > 3) oilVel[i*3] -= 0.005;
            
            // Friction
            oilVel[i*3] *= 0.9;
            oilVel[i*3+2] *= 0.9;
         }

         // Walls
         if (x < -6) { x = -6; oilVel[i*3] *= -0.5; }
         if (x > 6) { x = 6; oilVel[i*3] *= -0.5; }
         if (z < -3) { z = -3; oilVel[i*3+2] *= -0.5; }
         if (z > 3) { z = 3; oilVel[i*3+2] *= -0.5; }

         positions[i*3] = x;
         positions[i*3+1] = y;
         positions[i*3+2] = z;
      }
      oilSystem.geometry.attributes.position.needsUpdate = true;

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
      gear1.geometry.dispose();
      (gear1.material as THREE.Material).dispose();
      gear2.geometry.dispose();
      (gear2.material as THREE.Material).dispose();
      oilGeo.dispose();
      oilMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
