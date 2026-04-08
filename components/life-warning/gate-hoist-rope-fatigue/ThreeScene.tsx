import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RopeState } from './three-types';

interface ThreeSceneProps {
  state: RopeState;
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
    scene.background = new THREE.Color(0x111827); // Gray-900
    scene.fog = new THREE.FogExp2(0x111827, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);

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

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2);
    dirLight1.position.set(10, 20, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x88ccff, 1);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // --- Wire Rope Model ---
    const ropeGroup = new THREE.Group();
    scene.add(ropeGroup);

    const numStrands = 6;
    const strandRadius = 0.6;
    const ropeRadius = 1.5;
    const ropeLength = 30;
    const twistRate = 0.5; // Radians per unit length

    const strands: THREE.Mesh[] = [];
    const brokenWireMarkers: THREE.Mesh[] = [];

    // Custom shader for strands to show corrosion and fatigue
    const createStrandMaterial = () => {
      return new THREE.ShaderMaterial({
        uniforms: {
          uCorrosion: { value: 0.0 },
          uFatigue: { value: 0.0 },
          uTension: { value: 0.0 },
          uColorHealthy: { value: new THREE.Color(0x888888) }, // Steel gray
          uColorCorroded: { value: new THREE.Color(0x8b4513) }, // Rust brown
          uColorFatigue: { value: new THREE.Color(0xff0000) }   // Red for high stress
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          uniform float uTension;
          
          void main() {
            vUv = uv;
            vPosition = position;
            
            // Simulate thinning under high tension (Poisson's ratio effect)
            vec3 pos = position;
            float thinning = 1.0 - (uTension * 0.05); 
            pos.x *= thinning;
            pos.z *= thinning;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uCorrosion;
          uniform float uFatigue;
          uniform vec3 uColorHealthy;
          uniform vec3 uColorCorroded;
          uniform vec3 uColorFatigue;
          
          varying vec2 vUv;
          varying vec3 vPosition;

          // Simple noise
          float rand(vec2 co){
              return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
          }

          void main() {
            // Base color mix based on corrosion
            vec3 baseColor = mix(uColorHealthy, uColorCorroded, uCorrosion);
            
            // Add noise texture for rust/wear
            float noise = rand(vPosition.xy * 10.0 + vPosition.z * 5.0);
            baseColor *= mix(1.0, noise * 0.6 + 0.4, uCorrosion);

            // Add fatigue stress highlighting (pulsing red in high stress areas)
            float stressIntensity = uFatigue * (sin(vPosition.y * 2.0) * 0.5 + 0.5);
            vec3 finalColor = mix(baseColor, uColorFatigue, stressIntensity * 0.5);
            
            // Basic lighting
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            // Fake normal for cylinder
            vec3 normal = normalize(vec3(vPosition.x, 0.0, vPosition.z));
            float diff = max(dot(normal, lightDir), 0.3);

            gl_FragColor = vec4(finalColor * diff, 1.0);
          }
        `,
        side: THREE.DoubleSide
      });
    };

    // Create helical strands
    for (let i = 0; i < numStrands; i++) {
      const path = new THREE.CurvePath<THREE.Vector3>();
      const curve = new THREE.CatmullRomCurve3(
        Array.from({ length: 50 }).map((_, j) => {
          const y = (j / 49) * ropeLength - ropeLength / 2;
          const angle = (i / numStrands) * Math.PI * 2 + y * twistRate;
          return new THREE.Vector3(
            Math.cos(angle) * ropeRadius,
            y,
            Math.sin(angle) * ropeRadius
          );
        })
      );
      path.add(curve);

      const tubeGeo = new THREE.TubeGeometry(path, 100, strandRadius, 16, false);
      const tubeMat = createStrandMaterial();
      const strand = new THREE.Mesh(tubeGeo, tubeMat);
      ropeGroup.add(strand);
      strands.push(strand);
    }

    // Core strand
    const coreGeo = new THREE.CylinderGeometry(strandRadius * 1.2, strandRadius * 1.2, ropeLength, 32);
    const coreMat = createStrandMaterial();
    const core = new THREE.Mesh(coreGeo, coreMat);
    ropeGroup.add(core);
    strands.push(core);

    // --- Broken Wire Visualizer ---
    // We'll create small red "spikes" to represent broken wires sticking out
    const brokenWireGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const brokenWireMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });

    const updateBrokenWires = (count: number) => {
      // Remove old markers
      brokenWireMarkers.forEach(m => ropeGroup.remove(m));
      brokenWireMarkers.length = 0;

      for (let i = 0; i < count; i++) {
        const marker = new THREE.Mesh(brokenWireGeo, brokenWireMat);
        
        // Random position along the rope
        const y = (Math.random() - 0.5) * ropeLength;
        const angle = Math.random() * Math.PI * 2;
        
        // Position on the surface of the rope
        marker.position.set(
          Math.cos(angle) * (ropeRadius + strandRadius),
          y,
          Math.sin(angle) * (ropeRadius + strandRadius)
        );
        
        // Point outwards
        marker.lookAt(marker.position.x * 2, y, marker.position.z * 2);
        marker.rotateX(Math.PI / 2); // Align cylinder with normal

        ropeGroup.add(marker);
        brokenWireMarkers.push(marker);
      }
    };

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Strand Shaders
      strands.forEach(strand => {
        const mat = strand.material as THREE.ShaderMaterial;
        mat.uniforms.uCorrosion.value = currentState.corrosionLevel;
        mat.uniforms.uFatigue.value = currentState.fatigueFactor;
        // Normalize tension for visual effect (assume max 500kN)
        mat.uniforms.uTension.value = Math.min(1.0, currentState.tension / 500);
      });

      // Update broken wires if count changed
      if (brokenWireMarkers.length !== currentState.brokenWires) {
        updateBrokenWires(currentState.brokenWires);
      }

      // Simulate tension vibration
      if (currentState.tension > 300) {
        const vibration = Math.sin(time * 50) * 0.05 * (currentState.tension / 500);
        ropeGroup.position.x = vibration;
      } else {
        ropeGroup.position.x = 0;
      }

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
      strands.forEach(s => {
        s.geometry.dispose();
        (s.material as THREE.Material).dispose();
      });
      brokenWireGeo.dispose();
      brokenWireMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
