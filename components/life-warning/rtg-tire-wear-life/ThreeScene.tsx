import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TireState } from './three-types';

interface ThreeSceneProps {
  state: TireState;
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
    camera.position.set(12, 8, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x10b981, 2); // emerald-500
    spotLight.position.set(0, 15, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const tireGroup = new THREE.Group();
    scene.add(tireGroup);

    // Tire Geometry
    const tireRadius = 4;
    const tireTube = 1.5;
    const tireGeo = new THREE.TorusGeometry(tireRadius, tireTube, 64, 100);
    
    // Shader to show tread wear, deformation (bulge), and temperature
    const tireMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uTemp: { value: 0.0 }, // 0 to 1
        uDeform: { value: 0.0 }, // 0 to 1 (load/pressure)
        uBaseColor: { value: new THREE.Color(0x27272a) }, // Dark rubber
        uHotColor: { value: new THREE.Color(0xef4444) } // Red heat
      },
      vertexShader: `
        uniform float uDeform;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Deformation at the bottom (contact patch)
          // Torus is centered at 0,0,0. Bottom is approx y = -(radius + tube)
          float bottomDist = pos.y + 5.5; 
          if (bottomDist < 1.0) {
              // Bulge outwards on X and Z
              float bulge = (1.0 - max(0.0, bottomDist)) * uDeform * 0.5;
              pos.x += sign(pos.x) * bulge;
              pos.z += sign(pos.z) * bulge;
              // Flatten bottom
              pos.y = max(-5.5 + uDeform * 0.2, pos.y);
          }

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform float uTemp;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vec3 color = uBaseColor;
          
          // Tread pattern (grooves)
          // vUv.x goes around the tube, vUv.y goes around the torus
          float groove1 = sin(vUv.y * 200.0) * sin(vUv.x * 20.0);
          float groove2 = cos(vUv.y * 150.0 + vUv.x * 10.0);
          float tread = max(groove1, groove2);
          
          // As wear increases, tread depth decreases
          float currentTread = max(0.0, tread - uWear);
          
          if (currentTread > 0.5) {
              color *= 0.8; // Darker in grooves
          }

          // Heat mapping (hotter at the shoulders and contact patch)
          // We don't have world pos here easily without varying, but we can use vUv
          // Heat builds up generally
          color = mix(color, uHotColor, uTemp * 0.6);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.1);
          
          // Rubber is not very shiny
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 16.0) * 0.2;
          
          gl_FragColor = vec4(color * diff + vec3(spec), 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tireGroup.add(tire);

    // Wheel Rim
    const rimGeo = new THREE.CylinderGeometry(2.6, 2.6, 2.8, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.4 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    tireGroup.add(rim);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5.5;
    scene.add(ground);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Tire Rotation (Simulate driving)
      // Speed depends on load (heavier = slower usually, but let's just make it constant for visual)
      tireGroup.rotation.z -= 0.02;

      // Update Shader Uniforms
      // Wear: 60mm is new, 0mm is bald.
      const wearFactor = Math.max(0, Math.min(1, (60 - currentState.treadDepth) / 60));
      tireMat.uniforms.uWear.value = wearFactor;
      
      // Temp: 20C is normal, 90C is hot
      const tempFactor = Math.max(0, Math.min(1, (currentState.temperature - 20) / 70));
      tireMat.uniforms.uTemp.value = tempFactor;

      // Deformation: High load + Low pressure = High deformation
      const loadFactor = currentState.load / 40; // 40t is max
      const pressureFactor = 10 / Math.max(1, currentState.pressure); // 10 bar is normal
      const deformFactor = Math.min(1.0, loadFactor * pressureFactor * 0.5);
      tireMat.uniforms.uDeform.value = deformFactor;

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
      tireGeo.dispose();
      tireMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
