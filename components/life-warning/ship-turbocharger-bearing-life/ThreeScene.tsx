import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TurbochargerState } from './three-types';

interface ThreeSceneProps {
  state: TurbochargerState;
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
    scene.background = new THREE.Color(0x0f172a); // slate-900
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Heat light from turbine side
    const heatLight = new THREE.PointLight(0xff3300, 2, 20);
    heatLight.position.set(5, 0, 0);
    scene.add(heatLight);

    const turboGroup = new THREE.Group();
    scene.add(turboGroup);

    const rotorGroup = new THREE.Group();
    turboGroup.add(rotorGroup);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    shaft.rotation.z = Math.PI / 2;
    rotorGroup.add(shaft);

    // Turbine Wheel (Hot side - Right)
    const turbineGeo = new THREE.CylinderGeometry(3, 1, 2, 32);
    // Shader for turbine to glow red hot
    const turbineMat = new THREE.ShaderMaterial({
        uniforms: {
            uTemp: { value: 0.0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTemp;
            varying vec3 vNormal;
            void main() {
                vec3 baseColor = vec3(0.3, 0.3, 0.3);
                vec3 hotColor = vec3(1.0, 0.2, 0.0);
                vec3 color = mix(baseColor, hotColor, uTemp);
                
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                
                gl_FragColor = vec4(color * diff + (hotColor * uTemp * 0.5), 1.0);
            }
        `
    });
    const turbine = new THREE.Mesh(turbineGeo, turbineMat);
    turbine.rotation.z = -Math.PI / 2;
    turbine.position.x = 5;
    rotorGroup.add(turbine);

    // Compressor Wheel (Cold side - Left)
    const compressorGeo = new THREE.CylinderGeometry(1, 3, 2, 32);
    const compressorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.3 });
    const compressor = new THREE.Mesh(compressorGeo, compressorMat);
    compressor.rotation.z = -Math.PI / 2;
    compressor.position.x = -5;
    rotorGroup.add(compressor);

    // Bearings (Center)
    const bearingGeo = new THREE.TorusGeometry(0.8, 0.3, 16, 32);
    const bearingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 }); // Bronze/Brass color
    
    const bearing1 = new THREE.Mesh(bearingGeo, bearingMat);
    bearing1.rotation.y = Math.PI / 2;
    bearing1.position.x = 2;
    turboGroup.add(bearing1);

    const bearing2 = new THREE.Mesh(bearingGeo, bearingMat);
    bearing2.rotation.y = Math.PI / 2;
    bearing2.position.x = -2;
    turboGroup.add(bearing2);

    // Lube Oil Particles
    const oilCount = 200;
    const oilGeo = new THREE.BufferGeometry();
    const oilPos = new Float32Array(oilCount * 3);
    for(let i=0; i<oilCount; i++) {
        oilPos[i*3] = (Math.random() - 0.5) * 6; // Between bearings
        oilPos[i*3+1] = (Math.random() - 0.5) * 2;
        oilPos[i*3+2] = (Math.random() - 0.5) * 2;
    }
    oilGeo.setAttribute('position', new THREE.BufferAttribute(oilPos, 3));
    const oilMat = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xfcd34d, // amber-300
        transparent: true,
        opacity: 0.6
    });
    const oilSystem = new THREE.Points(oilGeo, oilMat);
    turboGroup.add(oilSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Rotor rotation (Extremely fast)
      const speed = currentState.rotorSpeed / 1000; // Scale down for visual
      rotorGroup.rotation.x += speed * 0.1;

      // Vibration effect (applied to rotor group)
      const vibAmount = currentState.vibration * 0.02;
      rotorGroup.position.y = Math.sin(time * 50) * vibAmount;
      rotorGroup.position.z = Math.cos(time * 43) * vibAmount;

      // Heat effect on turbine
      const tempFactor = Math.max(0, Math.min(1, (currentState.exhaustTemp - 300) / 400)); // 300C to 700C
      turbineMat.uniforms.uTemp.value = tempFactor;
      heatLight.intensity = tempFactor * 3;

      // Lube oil dynamics (Pressure affects spray)
      const positions = oilSystem.geometry.attributes.position.array as Float32Array;
      const sprayForce = currentState.lubeOilPressure / 5; // Normal ~3-4 bar
      
      for(let i=0; i<oilCount; i++) {
          // Oil sprays out from shaft
          positions[i*3+1] += (Math.random() - 0.5) * sprayForce * 0.2;
          positions[i*3+2] += (Math.random() - 0.5) * sprayForce * 0.2;
          positions[i*3] += (Math.random() - 0.5) * 0.1;

          // Gravity/Drain
          positions[i*3+1] -= 0.05;

          // Reset if it falls too far
          if (positions[i*3+1] < -2 || Math.abs(positions[i*3+2]) > 2) {
              positions[i*3] = (Math.random() - 0.5) * 6;
              positions[i*3+1] = 0;
              positions[i*3+2] = 0;
          }
      }
      oilSystem.geometry.attributes.position.needsUpdate = true;
      
      // Oil color darkens if temp is too high or pressure is low (simulating degradation)
      if (currentState.lubeOilPressure < 1.5 || currentState.exhaustTemp > 650) {
          oilMat.color.setHex(0x78350f); // amber-900 (burnt oil)
      } else {
          oilMat.color.setHex(0xfcd34d); // clean oil
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
      shaftGeo.dispose();
      metalMat.dispose();
      turbineGeo.dispose();
      turbineMat.dispose();
      compressorGeo.dispose();
      compressorMat.dispose();
      bearingGeo.dispose();
      bearingMat.dispose();
      oilGeo.dispose();
      oilMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
