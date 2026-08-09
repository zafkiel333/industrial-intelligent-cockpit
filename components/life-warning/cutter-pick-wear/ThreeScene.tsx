import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CutterPickState } from './three-types';

interface ThreeSceneProps {
  state: CutterPickState;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xf59e0b, 2); // amber-500
    spotLight.position.set(0, -10, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Cutting Head Model ---
    const cuttingHeadGroup = new THREE.Group();
    scene.add(cuttingHeadGroup);

    // Drum
    const drumGeo = new THREE.CylinderGeometry(4, 4, 8, 32);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drum.rotation.z = Math.PI / 2;
    cuttingHeadGroup.add(drum);

    // Cutter Picks
    const pickCount = 24;
    const picks: THREE.Mesh[] = [];

    // Custom shader for picks to show wear and heat
    const pickMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uTemperature: { value: 25.0 }, // Celsius
        uBaseColor: { value: new THREE.Color(0x94a3b8) }, // slate-400 (steel)
        uTipColor: { value: new THREE.Color(0x1e293b) }, // slate-800 (carbide tip)
        uHotColor: { value: new THREE.Color(0xef4444) } // red-500 (glowing hot)
      },
      vertexShader: `
        uniform float uWear;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          
          // Deform geometry based on wear (shrink the tip)
          vec3 pos = position;
          if (pos.y > 0.0) {
             pos.y -= uWear * 1.0; // Reduce length
             pos.x *= (1.0 - uWear * 0.5); // Round off
             pos.z *= (1.0 - uWear * 0.5);
          }

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform float uTemperature;
        uniform vec3 uBaseColor;
        uniform vec3 uTipColor;
        uniform vec3 uHotColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // Tip is darker (carbide)
          float tipFactor = smoothstep(0.6, 0.8, vUv.y);
          vec3 color = mix(uBaseColor, uTipColor, tipFactor);

          // Heat mapping (normalize temp 50-300C)
          float heatFactor = clamp((uTemperature - 50.0) / 250.0, 0.0, 1.0);
          // Heat is concentrated at the tip
          color = mix(color, uHotColor, heatFactor * tipFactor);

          // Basic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Specular
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec * (1.0 - uWear*tipFactor), 1.0);
        }
      `
    });

    const pickGeo = new THREE.CylinderGeometry(0.2, 0.5, 2, 16);
    // Adjust UVs so y goes from 0 at bottom to 1 at top for the shader
    const uvs = pickGeo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
        const y = pickGeo.attributes.position.getY(i);
        uvs.setY(i, (y + 1) / 2); // Box is height 2, from -1 to 1. Map to 0-1
    }

    // Distribute picks spirally around the drum
    for (let i = 0; i < pickCount; i++) {
       const angle = (i / pickCount) * Math.PI * 8; // 4 full turns
       const xPos = -3.5 + (i / pickCount) * 7; // Spread along drum length
       
       const pickGroup = new THREE.Group();
       
       // Pick Holder
       const holderGeo = new THREE.BoxGeometry(0.8, 1, 0.8);
       const holder = new THREE.Mesh(holderGeo, drumMat);
       holder.position.y = 4.2; // On surface
       pickGroup.add(holder);

       // Pick
       const pick = new THREE.Mesh(pickGeo, pickMat.clone());
       pick.position.y = 5.2; // Above holder
       pickGroup.add(pick);
       picks.push(pick);

       pickGroup.position.x = xPos;
       pickGroup.rotation.x = angle;
       
       cuttingHeadGroup.add(pickGroup);
    }

    // --- Rock Face (Coal/Rock) ---
    const rockFaceGeo = new THREE.BoxGeometry(10, 10, 2);
    const rockFaceMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 }); // stone-900 (coal)
    const rockFace = new THREE.Mesh(rockFaceGeo, rockFaceMat);
    rockFace.position.set(0, 0, -5);
    scene.add(rockFace);

    // --- Sparks Particle System ---
    const sparkCount = 500;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVel = new Float32Array(sparkCount * 3);
    const sparkLife = new Float32Array(sparkCount);
    
    for(let i=0; i<sparkCount; i++) {
       sparkPos[i*3] = 0; sparkPos[i*3+1] = 1000; sparkPos[i*3+2] = 0;
       sparkLife[i] = 0;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    
    const sparkMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xfde047, // yellow-300
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const sparkSystem = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Pick Shader (Wear and Heat)
      // Max wear depth might be ~30mm. Normalize to 0-1
      const wearFactor = clamp(currentState.wearDepth / 30, 0, 1);
      picks.forEach(p => {
         const mat = p.material as THREE.ShaderMaterial;
         mat.uniforms.uWear.value = wearFactor;
         mat.uniforms.uTemperature.value = currentState.temperature;
      });

      // Rotate Drum
      // Speed based on cutting speed (visual only)
      const rps = currentState.cuttingSpeed;
      cuttingHeadGroup.rotation.x -= rps * 0.016;

      // Animate Sparks (Friction with rock face)
      const positions = sparkSystem.geometry.attributes.position.array as Float32Array;
      
      // Spark amount based on rock hardness and speed
      const activeSparks = Math.floor(clamp((currentState.rockHardness / 100) * sparkCount * (currentState.cuttingSpeed / 3), 0, sparkCount));

      for(let i=0; i<sparkCount; i++) {
         if (sparkLife[i] > 0) {
            positions[i*3] += sparkVel[i*3];
            positions[i*3+1] += sparkVel[i*3+1];
            positions[i*3+2] += sparkVel[i*3+2];
            
            sparkVel[i*3+1] -= 0.01; // Gravity
            sparkLife[i] -= 0.016;
            
            if (sparkLife[i] <= 0) {
               positions[i*3+1] = 1000; // Hide
            }
         } else if (i < activeSparks && Math.random() > 0.5) {
            // Spawn new spark near the cutting interface (z ~ -4)
            // Find a pick that is currently cutting (pointing towards rock face)
            // Simplified: spawn randomly along the drum length near z=-4, y=0
            positions[i*3] = (Math.random() - 0.5) * 8;
            positions[i*3+1] = (Math.random() - 0.5) * 4;
            positions[i*3+2] = -4;
            
            // Velocity outwards and down
            sparkVel[i*3] = (Math.random() - 0.5) * 0.2;
            sparkVel[i*3+1] = -0.1 - Math.random() * 0.2;
            sparkVel[i*3+2] = 0.1 + Math.random() * 0.3;

            sparkLife[i] = 0.2 + Math.random() * 0.5;
         }
      }
      sparkSystem.geometry.attributes.position.needsUpdate = true;

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
      drumGeo.dispose();
      drumMat.dispose();
      pickGeo.dispose();
      pickMat.dispose();
      rockFaceGeo.dispose();
      rockFaceMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
