import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DredgerPumpState } from './three-types';

interface ThreeSceneProps {
  state: DredgerPumpState;
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
    scene.background = new THREE.Color(0x111827); // gray-900
    scene.fog = new THREE.FogExp2(0x111827, 0.02);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Volute (Casing) - Cross section
    const voluteShape = new THREE.Shape();
    voluteShape.absarc(0, 0, 8, 0, Math.PI * 2, false);
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, 6, 0, Math.PI * 2, true);
    voluteShape.holes.push(holePath);

    const extrudeSettings = { depth: 4, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.2, bevelThickness: 0.2 };
    const voluteGeo = new THREE.ExtrudeGeometry(voluteShape, extrudeSettings);
    
    // Shader for liner wear (inner surface color change)
    const voluteMat = new THREE.ShaderMaterial({
        uniforms: {
            uWear: { value: 0.0 }, // 0 (new) to 1 (worn)
            uBaseColor: { value: new THREE.Color(0x334155) }, // slate-700
            uWearColor: { value: new THREE.Color(0xf43f5e) }  // rose-500
        },
        vertexShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uWear;
            uniform vec3 uBaseColor;
            uniform vec3 uWearColor;
            varying vec3 vPosition;
            varying vec3 vNormal;

            void main() {
                // Determine if we are on the inner surface (radius ~6)
                float radius = length(vPosition.xy);
                float isInner = smoothstep(6.5, 5.5, radius); // 1 if inner, 0 if outer
                
                // Wear is concentrated at certain angles (e.g., bottom/discharge side)
                float angle = atan(vPosition.y, vPosition.x);
                float wearZone = smoothstep(-0.5, 1.0, sin(angle - 1.0)); // Bias wear to one side
                
                float actualWear = uWear * isInner * wearZone;
                
                vec3 color = mix(uBaseColor, uWearColor, actualWear);
                
                // Basic lighting
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });

    const volute = new THREE.Mesh(voluteGeo, voluteMat);
    volute.position.z = -2;
    pumpGroup.add(volute);

    // Impeller
    const impellerGroup = new THREE.Group();
    pumpGroup.add(impellerGroup);

    const hubGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const hub = new THREE.Mesh(hubGeo, metalMat);
    hub.rotation.x = Math.PI / 2;
    impellerGroup.add(hub);

    // Blades
    const bladeCount = 4;
    for (let i = 0; i < bladeCount; i++) {
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(1.5, -0.5);
        bladeShape.quadraticCurveTo(3, 1, 5.5, 2);
        bladeShape.lineTo(5.5, -2);
        bladeShape.quadraticCurveTo(3, -1, 1.5, 0.5);

        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 1.5, bevelEnabled: false });
        const blade = new THREE.Mesh(bladeGeo, metalMat);
        
        blade.rotation.z = (i / bladeCount) * Math.PI * 2;
        blade.position.z = -0.75;
        impellerGroup.add(blade);
    }

    // Slurry Particles (Sand/Rocks)
    const particleCount = 1500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleAngles = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);

    for(let i=0; i<particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 3.5; // Between hub and volute
        particlePos[i*3] = Math.cos(angle) * radius;
        particlePos[i*3+1] = Math.sin(angle) * radius;
        particlePos[i*3+2] = (Math.random() - 0.5) * 3;
        
        particleAngles[i] = angle;
        particleRadii[i] = radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({
        size: 0.3,
        color: 0xa16207, // yellow-700 (mud/sand)
        transparent: true,
        opacity: 0.8
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    pumpGroup.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Impeller rotation
      const speed = currentState.flowVelocity * 0.5;
      impellerGroup.rotation.z -= speed * 0.016;

      // Slurry dynamics
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const densityFactor = currentState.slurryDensity / 1500; // Normal ~1200, max ~1500
      
      // Adjust particle size based on state
      particleMat.size = 0.1 + (currentState.particleSize / 50) * 0.4;
      
      // Adjust color based on density (darker = denser)
      particleMat.color.setRGB(
          0.63 - densityFactor * 0.2,
          0.38 - densityFactor * 0.2,
          0.03
      );

      for(let i=0; i<particleCount; i++) {
          // Particles rotate and move outwards
          particleAngles[i] -= speed * 0.016 * (6 / particleRadii[i]); // Faster near center
          particleRadii[i] += speed * 0.05;

          // If they hit the volute wall, they slide along it and exit
          if (particleRadii[i] > 5.8) {
              particleRadii[i] = 5.8;
              // Exit logic (top right)
              if (particleAngles[i] < 0 && particleAngles[i] > -Math.PI/2) {
                  particleRadii[i] += 0.2; // Fly out
              }
          }

          // Reset particles that flew out
          if (particleRadii[i] > 8) {
              particleRadii[i] = 1.5 + Math.random(); // Enter at center
              particleAngles[i] = Math.random() * Math.PI * 2;
          }

          positions[i*3] = Math.cos(particleAngles[i]) * particleRadii[i];
          positions[i*3+1] = Math.sin(particleAngles[i]) * particleRadii[i];
          
          // Add some turbulence based on particle size
          const turbulence = (currentState.particleSize / 50) * 0.2;
          positions[i*3] += (Math.random() - 0.5) * turbulence;
          positions[i*3+1] += (Math.random() - 0.5) * turbulence;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Update Volute Wear Shader
      // Original thickness ~50mm, worn is < 20mm
      const wearRatio = Math.max(0, Math.min(1, (50 - currentState.linerThickness) / 30));
      voluteMat.uniforms.uWear.value = wearRatio;

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
      voluteGeo.dispose();
      voluteMat.dispose();
      hubGeo.dispose();
      metalMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
