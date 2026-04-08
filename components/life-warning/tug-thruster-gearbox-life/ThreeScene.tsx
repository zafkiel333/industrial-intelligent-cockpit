import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThrusterGearboxState } from './three-types';

interface ThreeSceneProps {
  state: ThrusterGearboxState;
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
    scene.background = new THREE.Color(0x18181b); // zinc-900
    scene.fog = new THREE.FogExp2(0x18181b, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const gearboxGroup = new THREE.Group();
    scene.add(gearboxGroup);

    // Gearbox Housing (Wireframe/Transparent)
    const housingGeo = new THREE.BoxGeometry(10, 12, 8);
    const housingMat = new THREE.MeshStandardMaterial({ 
        color: 0x3f3f46, 
        transparent: true, 
        opacity: 0.2,
        wireframe: true
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    gearboxGroup.add(housing);

    // Input Shaft (Vertical)
    const inputShaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xa1a1aa, metalness: 0.8, roughness: 0.2 });
    const inputShaft = new THREE.Mesh(inputShaftGeo, metalMat);
    inputShaft.position.y = 4;
    gearboxGroup.add(inputShaft);

    // Upper Bevel Gear
    const upperGearGeo = new THREE.ConeGeometry(3, 2, 16);
    // Shader to show stress/wear on gear teeth
    const gearMat = new THREE.ShaderMaterial({
        uniforms: {
            uStress: { value: 0.0 },
            uWear: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0x71717a) },
            uStressColor: { value: new THREE.Color(0xe11d48) }, // red
            uWearColor: { value: new THREE.Color(0xfacc15) } // yellow
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uStress;
            uniform float uWear;
            uniform vec3 uBaseColor;
            uniform vec3 uStressColor;
            uniform vec3 uWearColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                // Stress is higher at the edges (teeth)
                float edgeFactor = smoothstep(1.0, 3.0, length(vPosition.xz));
                
                vec3 color = mix(uBaseColor, uStressColor, uStress * edgeFactor);
                color = mix(color, uWearColor, uWear * edgeFactor);
                
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });
    const upperGear = new THREE.Mesh(upperGearGeo, gearMat.clone());
    upperGear.position.y = 1;
    upperGear.rotation.x = Math.PI; // Point down
    gearboxGroup.add(upperGear);

    // Lower Bevel Gear (Horizontal axis)
    const lowerGearGeo = new THREE.ConeGeometry(4, 2.5, 16);
    const lowerGear = new THREE.Mesh(lowerGearGeo, gearMat.clone());
    lowerGear.position.y = -1;
    lowerGear.position.z = 2.5;
    lowerGear.rotation.x = -Math.PI / 2; // Point forward
    gearboxGroup.add(lowerGear);

    // Output Shaft (Horizontal)
    const outputShaftGeo = new THREE.CylinderGeometry(1, 1, 8, 32);
    const outputShaft = new THREE.Mesh(outputShaftGeo, metalMat);
    outputShaft.rotation.x = Math.PI / 2;
    outputShaft.position.y = -1;
    outputShaft.position.z = 6;
    gearboxGroup.add(outputShaft);

    // Lube Oil Bath (Bottom of housing)
    const oilGeo = new THREE.BoxGeometry(9.8, 3, 7.8);
    const oilMat = new THREE.MeshPhysicalMaterial({
        color: 0xd97706, // amber
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 2
    });
    const oilBath = new THREE.Mesh(oilGeo, oilMat);
    oilBath.position.y = -4.5;
    gearboxGroup.add(oilBath);

    // Metal Particles in Oil
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
        particlePos[i*3] = (Math.random() - 0.5) * 9;
        particlePos[i*3+1] = -5.5 + Math.random() * 2;
        particlePos[i*3+2] = (Math.random() - 0.5) * 7;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x94a3b8, // silver/metal
        transparent: true,
        opacity: 0.0 // Initially invisible
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    gearboxGroup.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Gear Rotation
      const speed = currentState.inputSpeed * 0.05;
      inputShaft.rotation.y -= speed * 0.016;
      upperGear.rotation.y -= speed * 0.016;
      
      // Gear ratio 3:4 roughly
      const outSpeed = speed * 0.75;
      lowerGear.rotation.y += outSpeed * 0.016;
      outputShaft.rotation.y += outSpeed * 0.016;

      // Update Gear Shader (Stress from torque, Wear from particles)
      const stressRatio = Math.max(0, Math.min(1, currentState.torque / 100)); // Max ~100 kN.m
      const wearRatio = Math.max(0, Math.min(1, currentState.metalParticles / 500)); // Max ~500 ppm

      (upperGear.material as THREE.ShaderMaterial).uniforms.uStress.value = stressRatio;
      (upperGear.material as THREE.ShaderMaterial).uniforms.uWear.value = wearRatio;
      (lowerGear.material as THREE.ShaderMaterial).uniforms.uStress.value = stressRatio;
      (lowerGear.material as THREE.ShaderMaterial).uniforms.uWear.value = wearRatio;

      // Update Oil Color based on Temp and Particles
      const tempRatio = Math.max(0, Math.min(1, (currentState.oilTemp - 40) / 60));
      // Hotter = darker, more particles = darker/grayer
      oilMat.color.setRGB(
          0.8 - tempRatio * 0.2 - wearRatio * 0.3,
          0.5 - tempRatio * 0.3 - wearRatio * 0.3,
          0.1 + wearRatio * 0.2
      );

      // Animate Particles
      particleMat.opacity = wearRatio; // Show particles as ppm increases
      const pPos = particleSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
          // Swirl in oil
          pPos[i*3] += Math.sin(time + i) * 0.02 * (speed > 0 ? 1 : 0);
          pPos[i*3+2] += Math.cos(time + i) * 0.02 * (speed > 0 ? 1 : 0);
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

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
      housingGeo.dispose();
      housingMat.dispose();
      inputShaftGeo.dispose();
      metalMat.dispose();
      upperGearGeo.dispose();
      lowerGearGeo.dispose();
      (upperGear.material as THREE.Material).dispose();
      (lowerGear.material as THREE.Material).dispose();
      outputShaftGeo.dispose();
      oilGeo.dispose();
      oilMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
