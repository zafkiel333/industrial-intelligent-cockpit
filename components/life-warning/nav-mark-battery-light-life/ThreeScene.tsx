import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { NavMarkState } from './three-types';

interface ThreeSceneProps {
  state: NavMarkState;
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
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Sun light (represents charging)
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.0);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);

    const buoyGroup = new THREE.Group();
    scene.add(buoyGroup);

    // Water surface
    const waterGeo = new THREE.PlaneGeometry(50, 50, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Buoy Body
    const bodyGeo = new THREE.CylinderGeometry(2, 2, 6, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }); // Red buoy
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1;
    buoyGroup.add(body);

    // Tower structure
    const towerGeo = new THREE.CylinderGeometry(0.5, 2, 8, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 }); // Yellow tower
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 8;
    buoyGroup.add(tower);

    // Solar Panels
    const panelGeo = new THREE.BoxGeometry(3, 3, 0.1);
    
    // Shader for solar panel to show charging energy
    const panelMat = new THREE.ShaderMaterial({
        uniforms: {
            uCharge: { value: 0.0 },
            uTime: { value: 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uCharge;
            uniform float uTime;
            varying vec2 vUv;
            void main() {
                vec3 baseColor = vec3(0.05, 0.1, 0.3); // Dark blue panel
                
                // Grid lines
                float gridX = step(0.95, fract(vUv.x * 10.0));
                float gridY = step(0.95, fract(vUv.y * 10.0));
                vec3 gridColor = vec3(0.8);
                
                vec3 color = mix(baseColor, gridColor, max(gridX, gridY) * 0.5);
                
                // Energy flow effect
                float flow = sin(vUv.y * 20.0 - uTime * 5.0) * 0.5 + 0.5;
                vec3 chargeColor = vec3(0.2, 0.8, 0.2); // Green energy
                
                color += chargeColor * flow * uCharge * 0.5;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    const panel1 = new THREE.Mesh(panelGeo, panelMat);
    panel1.position.set(0, 10, 1.5);
    panel1.rotation.x = -Math.PI / 6;
    buoyGroup.add(panel1);

    const panel2 = new THREE.Mesh(panelGeo, panelMat.clone());
    panel2.position.set(0, 10, -1.5);
    panel2.rotation.x = Math.PI / 6;
    panel2.rotation.y = Math.PI;
    buoyGroup.add(panel2);

    // LED Light
    const lightGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightMesh = new THREE.Mesh(lightGeo, lightMat);
    lightMesh.position.y = 12.5;
    buoyGroup.add(lightMesh);

    const pointLight = new THREE.PointLight(0xffffff, 0, 50);
    pointLight.position.y = 12.5;
    buoyGroup.add(pointLight);

    // Battery Hologram (Inside the body, visible via wireframe or overlay)
    const batteryGeo = new THREE.BoxGeometry(2, 3, 2);
    const batteryMat = new THREE.ShaderMaterial({
        uniforms: {
            uCapacity: { value: 1.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uCapacity;
            varying vec2 vUv;
            void main() {
                vec3 emptyColor = vec3(0.2, 0.0, 0.0);
                vec3 fullColor = vec3(0.0, 0.8, 0.2);
                
                // Fill level
                float fill = step(vUv.y, uCapacity);
                vec3 color = mix(emptyColor, fullColor, fill);
                
                // Add some scanlines
                float scanline = sin(vUv.y * 50.0) * 0.1 + 0.9;
                
                gl_FragColor = vec4(color * scanline, 0.8);
            }
        `,
        transparent: true,
        depthTest: false // Render over the body
    });
    const battery = new THREE.Mesh(batteryGeo, batteryMat);
    battery.position.y = 1;
    buoyGroup.add(battery);

    const clock = new THREE.Clock();
    let flashTimer = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Buoy bobbing in water
      buoyGroup.position.y = Math.sin(time * 2) * 0.5;
      buoyGroup.rotation.z = Math.sin(time * 1.5) * 0.1;
      buoyGroup.rotation.x = Math.cos(time * 1.2) * 0.1;

      // Water waves
      const positions = water.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i+1];
          positions[i+2] = Math.sin(x * 0.5 + time) * 0.5 + Math.cos(y * 0.5 + time) * 0.5;
      }
      water.geometry.attributes.position.needsUpdate = true;

      // Solar Charge Effect
      const chargeFactor = currentState.chargeRate / 100; // Assuming 100W max
      sunLight.intensity = chargeFactor * 2;
      (panel1.material as THREE.ShaderMaterial).uniforms.uCharge.value = chargeFactor;
      (panel1.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      (panel2.material as THREE.ShaderMaterial).uniforms.uCharge.value = chargeFactor;
      (panel2.material as THREE.ShaderMaterial).uniforms.uTime.value = time;

      // Battery Level
      batteryMat.uniforms.uCapacity.value = currentState.batteryCapacity / 100;

      // LED Flashing Logic (e.g., 1s ON, 3s OFF)
      flashTimer += 0.016;
      if (flashTimer > 4) flashTimer = 0;
      
      const isFlashing = flashTimer < 1.0;
      const fluxFactor = currentState.ledLuminousFlux / 100;
      
      if (isFlashing && currentState.batteryCapacity > 5) {
          // Color shifts to yellow/red as LED degrades
          const r = 1.0;
          const g = fluxFactor;
          const b = fluxFactor;
          lightMat.color.setRGB(r, g, b);
          pointLight.color.setRGB(r, g, b);
          pointLight.intensity = 5 * fluxFactor;
      } else {
          lightMat.color.setHex(0x111111);
          pointLight.intensity = 0;
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
      waterGeo.dispose();
      waterMat.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      towerGeo.dispose();
      towerMat.dispose();
      panelGeo.dispose();
      panelMat.dispose();
      lightGeo.dispose();
      lightMat.dispose();
      batteryGeo.dispose();
      batteryMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
