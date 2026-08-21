import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShovelRopeState } from './three-types';

interface ThreeSceneProps {
  state: ShovelRopeState;
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
    scene.fog = new THREE.FogExp2(0x315268, 0.05);

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
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x3b82f6, 2); // blue-500
    spotLight.position.set(-5, 5, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Wire Rope Model ---
    const ropeGroup = new THREE.Group();
    scene.add(ropeGroup);

    // Sheave (Pulley)
    const sheaveGeo = new THREE.TorusGeometry(5, 0.5, 16, 64);
    const sheaveMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });
    const sheave = new THREE.Mesh(sheaveGeo, sheaveMat);
    sheave.position.y = 5;
    ropeGroup.add(sheave);

    // Rope (Curved around sheave and hanging down)
    // We'll use a TubeGeometry along a spline
    const curve = new THREE.CatmullRomCurve3([
       new THREE.Vector3(-5, -10, 0),
       new THREE.Vector3(-5, 5, 0),
       new THREE.Vector3(0, 10, 0),
       new THREE.Vector3(5, 5, 0),
       new THREE.Vector3(5, -10, 0)
    ]);

    const ropeGeo = new THREE.TubeGeometry(curve, 100, 0.3, 16, false);
    
    // Custom shader for rope to show strands, abrasion, and broken wires
    const ropeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTension: { value: 0.0 }, // 0 to 1
        uAbrasion: { value: 0.0 }, // 0 to 1
        uBrokenWires: { value: 0.0 }, // count
        uBaseColor: { value: new THREE.Color(0x94a3b8) }, // slate-400 (greased steel)
        uStressColor: { value: new THREE.Color(0xef4444) }, // red-500
        uWearColor: { value: new THREE.Color(0xfcd34d) } // amber-300 (shiny worn metal)
      },
      vertexShader: `
        uniform float uTension;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Slight thinning under high tension
          float radiusScale = 1.0 - (uTension * 0.05);
          
          // We need to scale along the normal to thin the tube
          // This is a simplification, true tube thinning is complex
          pos -= normal * (1.0 - radiusScale) * 0.3;

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTension;
        uniform float uAbrasion;
        uniform float uBrokenWires;
        uniform vec3 uBaseColor;
        uniform vec3 uStressColor;
        uniform vec3 uWearColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Create strand pattern (helical)
          // vUv.x is along the tube, vUv.y is around the tube
          float strands = sin((vUv.x * 100.0 + vUv.y * 6.0) * 3.14159);
          
          vec3 color = uBaseColor;
          
          // Darken the grooves between strands
          color *= smoothstep(-1.0, 0.5, strands) * 0.5 + 0.5;

          // Tension stress color (mostly on the straight parts)
          float isStraight = step(0.8, abs(vNormal.y)); // Rough approximation
          color = mix(color, uStressColor, uTension * 0.5 * isStraight);

          // Abrasion (flattens and shines the outer surface)
          // Outer surface is where strands are highest (strands > 0.8)
          float wearArea = smoothstep(0.5, 1.0, strands);
          color = mix(color, uWearColor, uAbrasion * wearArea);

          // Broken wires (random bright/dark spots)
          if (uBrokenWires > 0.0) {
             float breakNoise = rand(vUv * 200.0);
             if (breakNoise > 0.99 - (uBrokenWires * 0.001)) {
                 color = vec3(1.0, 0.0, 0.0); // Highlight broken wires in red
             }
          }

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // High specularity on worn areas
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float specPower = mix(16.0, 64.0, uAbrasion * wearArea);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), specPower);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec, 1.0);
        }
      `
    });

    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    ropeGroup.add(rope);

    // --- Stress Particles (Visualizing tension) ---
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
       // Distribute along the straight parts of the rope
       const side = Math.random() > 0.5 ? 1 : -1;
       particlePos[i*3] = side * 5 + (Math.random() - 0.5) * 0.5;
       particlePos[i*3+1] = -10 + Math.random() * 15;
       particlePos[i*3+2] = (Math.random() - 0.5) * 0.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xef4444, // red-500
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let offset = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Rope Shader
      ropeMat.uniforms.uTension.value = clamp(currentState.tension / 2000, 0, 1);
      ropeMat.uniforms.uAbrasion.value = clamp(currentState.abrasion / 100, 0, 1);
      ropeMat.uniforms.uBrokenWires.value = currentState.brokenWires;

      // Simulate rope movement (scrolling UVs)
      // Speed depends on bending cycles (simplified)
      const speed = 0.5;
      offset -= speed * 0.016;
      
      // We need to update the UVs manually because it's a TubeGeometry
      const uvs = ropeGeo.attributes.uv.array as Float32Array;
      for(let i=0; i<uvs.length; i+=2) {
          // Only shift the U coordinate (along the tube)
          // We don't actually modify the buffer, we'd need a custom uniform for offset
          // Let's add an offset uniform to the shader instead of modifying buffer
      }
      
      // Actually, let's just rotate the sheave to simulate movement
      sheave.rotation.z -= speed * 0.05;

      // Tension Particles
      particleMat.opacity = clamp((currentState.tension - 1000) / 1000, 0, 0.8);
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
         positions[i*3+1] += speed * 0.1; // Move up
         if (positions[i*3+1] > 5) {
             positions[i*3+1] = -10;
         }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

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
      sheaveGeo.dispose();
      sheaveMat.dispose();
      ropeGeo.dispose();
      ropeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
