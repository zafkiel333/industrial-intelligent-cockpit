import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SternSealState } from './three-types';

interface ThreeSceneProps {
  state: SternSealState;
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
    scene.background = new THREE.Color(0x082f49); // sky-900 (underwater feel)
    scene.fog = new THREE.FogExp2(0x082f49, 0.05);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(10, 5, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xbae6fd, 1.0); // light blue light
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const sealGroup = new THREE.Group();
    scene.add(sealGroup);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(2, 2, 20, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    shaft.rotation.z = Math.PI / 2;
    sealGroup.add(shaft);

    // Stern Tube (Cutaway)
    const tubeGeo = new THREE.CylinderGeometry(3.5, 4, 10, 32, 1, true, 0, Math.PI);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5, side: THREE.DoubleSide });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.rotation.z = Math.PI / 2;
    tube.position.x = -5;
    sealGroup.add(tube);

    // Lip Seals (Rubber rings)
    const sealCount = 3;
    const seals: THREE.Mesh[] = [];
    const sealGeo = new THREE.TorusGeometry(2.1, 0.2, 16, 64);
    
    // Shader to show wear on the inner lip of the seal
    const sealMat = new THREE.ShaderMaterial({
        uniforms: {
            uWear: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0x111827) }, // black rubber
            uWearColor: { value: new THREE.Color(0xfacc15) }  // yellow warning
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
            uniform float uWear;
            uniform vec3 uBaseColor;
            uniform vec3 uWearColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                // Wear is on the inside (closest to shaft, radius ~2.1 - 0.2 = 1.9)
                float radius = length(vPosition.xy);
                float isInner = smoothstep(2.1, 1.9, radius);
                
                vec3 color = mix(uBaseColor, uWearColor, isInner * uWear);
                
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });

    for (let i = 0; i < sealCount; i++) {
        const seal = new THREE.Mesh(sealGeo, sealMat.clone());
        seal.rotation.y = Math.PI / 2;
        seal.position.x = i * 1.5 - 2;
        sealGroup.add(seal);
        seals.push(seal);
    }

    // Water particles (Right side)
    const waterParticleCount = 300;
    const waterGeo = new THREE.BufferGeometry();
    const waterPos = new Float32Array(waterParticleCount * 3);
    for(let i=0; i<waterParticleCount; i++) {
        waterPos[i*3] = 4 + Math.random() * 6; // x > 4
        waterPos[i*3+1] = (Math.random() - 0.5) * 8;
        waterPos[i*3+2] = (Math.random() - 0.5) * 8;
    }
    waterGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
    const waterMat = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x38bdf8, // sky-400
        transparent: true,
        opacity: 0.6
    });
    const waterSystem = new THREE.Points(waterGeo, waterMat);
    sealGroup.add(waterSystem);

    // Oil particles (Left side, inside tube)
    const oilParticleCount = 200;
    const oilGeo = new THREE.BufferGeometry();
    const oilPos = new Float32Array(oilParticleCount * 3);
    for(let i=0; i<oilParticleCount; i++) {
        oilPos[i*3] = -10 + Math.random() * 8; // x < -2
        // Constrain to inside tube
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.2 + Math.random() * 1.2;
        oilPos[i*3+1] = Math.cos(angle) * radius;
        oilPos[i*3+2] = Math.sin(angle) * radius;
    }
    oilGeo.setAttribute('position', new THREE.BufferAttribute(oilPos, 3));
    const oilMat = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xfde047, // yellow-300
        transparent: true,
        opacity: 0.8
    });
    const oilSystem = new THREE.Points(oilGeo, oilMat);
    sealGroup.add(oilSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Shaft rotation
      const speed = currentState.shaftSpeed * 0.05;
      shaft.rotation.x += speed * 0.016;

      // Update Seal Wear Shader
      const wearFactor = Math.max(0, Math.min(1, currentState.sealWear / 5)); // 5mm is max wear
      seals.forEach(seal => {
          (seal.material as THREE.ShaderMaterial).uniforms.uWear.value = wearFactor;
      });

      // Pressure dynamics (Water vs Oil)
      // Seawater pressure ~ draftDepth * 0.1 bar
      const waterPressure = currentState.draftDepth * 0.1;
      const pressureDiff = currentState.lubeOilPressure - waterPressure;

      // Water particles movement
      const wPositions = waterSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<waterParticleCount; i++) {
          wPositions[i*3+1] += Math.sin(time + i) * 0.02; // Bobbing
          
          // If oil pressure is lower than water pressure, water leaks IN (moves left)
          if (pressureDiff < 0 && wPositions[i*3] > -2) {
              wPositions[i*3] -= 0.05 * Math.abs(pressureDiff);
          } else if (wPositions[i*3] < 4) {
              // Push back out if pressure is fine
              wPositions[i*3] += 0.05;
          }
      }
      waterSystem.geometry.attributes.position.needsUpdate = true;

      // Oil particles movement
      const oPositions = oilSystem.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<oilParticleCount; i++) {
          // Swirl with shaft
          const y = oPositions[i*3+1];
          const z = oPositions[i*3+2];
          const angle = Math.atan2(z, y) + speed * 0.005;
          const radius = Math.sqrt(y*y + z*z);
          oPositions[i*3+1] = Math.cos(angle) * radius;
          oPositions[i*3+2] = Math.sin(angle) * radius;

          // If oil pressure is much higher than water AND seals are worn, oil leaks OUT (moves right)
          if (pressureDiff > 0.5 && wearFactor > 0.5) {
              if (Math.random() < wearFactor * 0.01) {
                  oPositions[i*3] += 0.1 * pressureDiff;
              }
          }

          // Reset leaked oil
          if (oPositions[i*3] > 4) {
              oPositions[i*3] = -10 + Math.random() * 8;
          }
      }
      oilSystem.geometry.attributes.position.needsUpdate = true;

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
      tubeGeo.dispose();
      tubeMat.dispose();
      sealGeo.dispose();
      seals.forEach(s => s.material.dispose());
      waterGeo.dispose();
      waterMat.dispose();
      oilGeo.dispose();
      oilMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
