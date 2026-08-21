import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ErosionState } from './three-types';

interface ThreeSceneProps {
  state: ErosionState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  // Keep ref updated without triggering re-renders
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Cleanup existing canvas if any
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.015);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00ffff, 3);
    dirLight1.position.set(10, 20, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff00ff, 2);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // --- Turbine Runner Model ---
    const runnerGroup = new THREE.Group();
    scene.add(runnerGroup);

    // Hub
    const hubGeometry = new THREE.CylinderGeometry(3, 4, 8, 32);
    const hubMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x88ccff, 
      metalness: 0.8, 
      roughness: 0.2,
      envMapIntensity: 1.0
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    runnerGroup.add(hub);

    // Blades
    const numBlades = 13;
    const blades: THREE.Mesh[] = [];
    const originalBladeColors: THREE.Color[] = [];

    // Create a custom shader material for blades to show erosion
    const createBladeMaterial = () => {
      return new THREE.ShaderMaterial({
        uniforms: {
          uErosionLevel: { value: 0.0 },
          uColor: { value: new THREE.Color(0x44aaff) },
          uErosionColor: { value: new THREE.Color(0xff4400) }, // Red/Orange for erosion
          uTime: { value: 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uErosionLevel;
          uniform vec3 uColor;
          uniform vec3 uErosionColor;
          uniform float uTime;
          
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;

          // Simple noise function
          float rand(vec2 co){
              return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
          }

          void main() {
            // Base lighting
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            float diff = max(dot(vNormal, lightDir), 0.2);
            
            // Erosion pattern based on position and noise
            float noise = rand(vPosition.xy * 10.0);
            
            // Concentrate erosion on leading edge (assuming x > 0 is leading edge in local space)
            float edgeFactor = smoothstep(-2.0, 5.0, vPosition.x);
            
            // Calculate final erosion amount for this pixel
            float localErosion = smoothstep(1.0 - uErosionLevel, 1.0, noise * edgeFactor + uErosionLevel * 0.5);
            
            // Mix colors
            vec3 finalColor = mix(uColor, uErosionColor, localErosion);
            
            // Add some "glow" to eroded parts
            finalColor += uErosionColor * localErosion * 0.5 * (sin(uTime * 5.0) * 0.5 + 0.5);

            gl_FragColor = vec4(finalColor * diff, 1.0);
          }
        `,
        side: THREE.DoubleSide,
        transparent: true
      });
    };

    for (let i = 0; i < numBlades; i++) {
      // Create a curved blade shape
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(5, 2, 8, -2);
      shape.quadraticCurveTo(4, -4, 0, -1);
      shape.lineTo(0, 0);

      const extrudeSettings = {
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
      };

      const bladeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      
      // Center geometry
      bladeGeometry.computeBoundingBox();
      const centerOffset = -0.5 * (bladeGeometry.boundingBox!.max.z - bladeGeometry.boundingBox!.min.z);
      bladeGeometry.translate(0, 0, centerOffset);

      const bladeMat = createBladeMaterial();
      const blade = new THREE.Mesh(bladeGeometry, bladeMat);

      // Position and rotate around hub
      const angle = (i / numBlades) * Math.PI * 2;
      blade.position.x = Math.cos(angle) * 3;
      blade.position.z = Math.sin(angle) * 3;
      
      // Orient blade
      blade.rotation.y = -angle;
      blade.rotation.x = Math.PI / 6; // Pitch
      blade.rotation.z = Math.PI / 12; // Sweep

      runnerGroup.add(blade);
      blades.push(blade);
    }

    // --- Particle System (Water/Sediment/Cavitation) ---
    const particleCount = 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = new Float32Array(particleCount * 3);
    const particlesVelocities = [];
    const particlesColors = new Float32Array(particleCount * 3);

    const colorWater = new THREE.Color(0x00ffff);
    const colorSediment = new THREE.Color(0x8b4513);
    const colorCavitation = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      // Start particles above the runner
      particlesPositions[i * 3] = (Math.random() - 0.5) * 20;
      particlesPositions[i * 3 + 1] = 15 + Math.random() * 10;
      particlesPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      particlesVelocities.push({
        y: -0.1 - Math.random() * 0.2, // Downward velocity
        x: (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.05
      });

      // Default color (water)
      colorWater.toArray(particlesColors, i * 3);
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particlesColors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Rotate runner based on water flow speed
      const rotationSpeed = currentState.waterFlowSpeed * 0.002;
      runnerGroup.rotation.y -= rotationSpeed;

      // Update blades shader uniforms
      blades.forEach(blade => {
        const mat = blade.material as THREE.ShaderMaterial;
        mat.uniforms.uErosionLevel.value = currentState.erosionLevel;
        mat.uniforms.uTime.value = time;
      });

      // Update particles
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const colors = particleSystem.geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        // Move particles
        positions[i * 3] += particlesVelocities[i].x;
        positions[i * 3 + 1] += particlesVelocities[i].y * (currentState.waterFlowSpeed / 50); // Scale fall speed
        positions[i * 3 + 2] += particlesVelocities[i].z;

        // Reset particles that fall below
        if (positions[i * 3 + 1] < -15) {
          positions[i * 3] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 1] = 15 + Math.random() * 5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

          // Determine particle type based on state probabilities
          const rand = Math.random() * 100;
          if (rand < currentState.sedimentConcentration) {
            colorSediment.toArray(colors, i * 3); // Sediment
          } else if (rand < currentState.sedimentConcentration + currentState.cavitationIntensity) {
            colorCavitation.toArray(colors, i * 3); // Cavitation bubble
          } else {
            colorWater.toArray(colors, i * 3); // Normal water
          }
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.geometry.attributes.color.needsUpdate = true;

      // Adjust particle size based on cavitation (bubbles expand)
      particlesMaterial.size = 0.2 + (currentState.cavitationIntensity / 100) * 0.3;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
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
      // Dispose geometries and materials
      hubGeometry.dispose();
      hubMaterial.dispose();
      blades.forEach(b => {
        b.geometry.dispose();
        (b.material as THREE.Material).dispose();
      });
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []); // Empty dependency array for init only

  return <div ref={mountRef} className="w-full h-full" />;
};
