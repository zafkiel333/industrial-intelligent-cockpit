import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ImpellerState } from './three-types';

interface ThreeSceneProps {
  state: ImpellerState;
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
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.05);

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
    controls.enablePan = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x10b981, 2); // emerald-500
    spotLight.position.set(0, 15, 0);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // --- Impeller Model ---
    const impellerGroup = new THREE.Group();
    scene.add(impellerGroup);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 5;
    impellerGroup.add(shaft);

    // Hub
    const hubGeo = new THREE.CylinderGeometry(2, 2, 1, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    impellerGroup.add(hub);

    // Blades
    const bladeCount = 6;
    const blades: THREE.Mesh[] = [];
    
    // Custom shader for blades to show wear (edge rounding/thinning) and impact
    const bladeMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uImpact: { value: 0.0 }, // Based on particle size/density
        uBaseColor: { value: new THREE.Color(0x1e293b) }, // dark rubber/polyurethane
        uWearColor: { value: new THREE.Color(0x9ca3af) }, // exposed metal/worn rubber
        uImpactColor: { value: new THREE.Color(0x34d399) } // emerald-400
      },
      vertexShader: `
        uniform float uWear;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Wear deformation: blades get thinner and shorter at the outer edges
          // Assuming blade extends along X axis
          float edgeFactor = smoothstep(0.0, 4.0, pos.x);
          
          // Shrink X (length)
          pos.x -= edgeFactor * uWear * 0.5;
          // Shrink Z (thickness)
          pos.z *= 1.0 - (edgeFactor * uWear * 0.8);

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform float uImpact;
        uniform vec3 uBaseColor;
        uniform vec3 uWearColor;
        uniform vec3 uImpactColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Wear color at the edges
          float edgeFactor = smoothstep(0.5, 1.0, vUv.x);
          
          // Noise for pitted wear surface
          float noise = rand(vUv * 50.0);
          float pittedWear = uWear * (0.5 + noise * 0.5);
          
          vec3 color = mix(uBaseColor, uWearColor, pittedWear * edgeFactor);
          
          // Impact glow
          color = mix(color, uImpactColor, uImpact * edgeFactor * noise);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          gl_FragColor = vec4(color * diff, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const bladeGeo = new THREE.BoxGeometry(4, 1.5, 0.2);
    // Adjust UVs so x goes from 0 (hub) to 1 (tip)
    const posAttr = bladeGeo.attributes.position;
    const uvAttr = bladeGeo.attributes.uv;
    for(let i=0; i<posAttr.count; i++) {
        uvAttr.setX(i, (posAttr.getX(i) + 2) / 4.0);
    }

    for (let i = 0; i < bladeCount; i++) {
       const angle = (i / bladeCount) * Math.PI * 2;
       const blade = new THREE.Mesh(bladeGeo, bladeMat.clone());
       
       // Position so one end is at hub
       blade.position.set(Math.cos(angle) * 3, 0, Math.sin(angle) * 3);
       blade.rotation.y = -angle;
       
       // Pitch angle for pumping
       blade.rotation.x = 0.2;
       
       impellerGroup.add(blade);
       blades.push(blade);
    }

    // --- Slurry and Bubbles ---
    // Slurry background
    const slurryGeo = new THREE.CylinderGeometry(8, 8, 4, 32, 1, true);
    const slurryMat = new THREE.MeshBasicMaterial({
       color: 0x0f172a, // slate-900
       transparent: true,
       opacity: 0.6,
       side: THREE.DoubleSide
    });
    const slurry = new THREE.Mesh(slurryGeo, slurryMat);
    scene.add(slurry);

    // Bubbles/Particles
    const particleCount = 800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
       const radius = 2 + Math.random() * 6;
       const angle = Math.random() * Math.PI * 2;
       particlePos[i*3] = Math.cos(angle) * radius;
       particlePos[i*3+1] = (Math.random() - 0.5) * 4;
       particlePos[i*3+2] = Math.sin(angle) * radius;
       
       particleSizes[i] = Math.random(); // 0 to 1
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uParticleSize: { value: 1.0 }, // Base size from state
        uColor: { value: new THREE.Color(0xa7f3d0) } // emerald-200
      },
      vertexShader: `
        uniform float uParticleSize;
        attribute float aSize;
        varying float vAlpha;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          // Size depends on distance and base size
          gl_PointSize = (aSize * uParticleSize * 20.0) * (10.0 / -mvPosition.z);
          vAlpha = aSize;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          // Circular particle
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if(ll > 0.5) discard;
          
          gl_FragColor = vec4(uColor, vAlpha * 0.8 * (1.0 - ll*2.0));
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Blade Shaders
      const wearFactor = clamp(currentState.wearDepth / 20, 0, 1);
      const impactFactor = clamp((currentState.slurryDensity / 50) * (currentState.particleSize / 2), 0, 1);
      
      blades.forEach(blade => {
         const mat = blade.material as THREE.ShaderMaterial;
         mat.uniforms.uWear.value = wearFactor;
         mat.uniforms.uImpact.value = impactFactor;
      });

      // Rotate Impeller
      const speed = (currentState.rotationSpeed / 60) * Math.PI * 2; // rad/s
      impellerGroup.rotation.y -= speed * 0.016;

      // Update Particles (Slurry flow)
      particleMat.uniforms.uParticleSize.value = currentState.particleSize;
      
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
         let x = positions[i*3];
         let y = positions[i*3+1];
         let z = positions[i*3+2];

         // Swirl around impeller
         const angle = Math.atan2(z, x) - speed * 0.01;
         const radius = Math.sqrt(x*x + z*z);
         
         // Centrifugal force pushes outward
         const newRadius = radius + (speed * 0.02);
         
         x = Math.cos(angle) * newRadius;
         z = Math.sin(angle) * newRadius;
         
         // Move up (bubbles/flotation)
         y += 0.05 + (Math.random() * 0.05);

         // Reset if out of bounds
         if (newRadius > 8 || y > 2) {
            const resetRadius = 2 + Math.random();
            const resetAngle = Math.random() * Math.PI * 2;
            x = Math.cos(resetAngle) * resetRadius;
            z = Math.sin(resetAngle) * resetRadius;
            y = -2;
         }

         positions[i*3] = x;
         positions[i*3+1] = y;
         positions[i*3+2] = z;
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
      shaftGeo.dispose();
      shaftMat.dispose();
      hubGeo.dispose();
      hubMat.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      slurryGeo.dispose();
      slurryMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
