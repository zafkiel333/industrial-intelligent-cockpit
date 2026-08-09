import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FirePumpSealState } from './three-types';

interface ThreeSceneProps {
  state: FirePumpSealState;
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
    scene.background = new THREE.Color(0x1a0505); // Very dark red/black
    scene.fog = new THREE.FogExp2(0x1a0505, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(8, 5, 10);

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

    const sealGroup = new THREE.Group();
    scene.add(sealGroup);

    // Pump Shaft
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 12, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.2 }); // gray-400
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    sealGroup.add(shaft);

    // Mechanical Seal Assembly
    // Stationary Ring (attached to housing)
    const statRingGeo = new THREE.TorusGeometry(1.2, 0.3, 16, 32);
    const statRingMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.5, roughness: 0.7 }); // gray-700 (Carbon/Ceramic)
    const statRing = new THREE.Mesh(statRingGeo, statRingMat);
    statRing.rotation.y = Math.PI / 2;
    statRing.position.x = -1;
    sealGroup.add(statRing);

    // Rotating Ring (attached to shaft)
    const rotRingGeo = new THREE.TorusGeometry(1.2, 0.3, 16, 32);
    
    // Shader for rotating ring to show heat and wear
    const rotRingMat = new THREE.ShaderMaterial({
        uniforms: {
            uTemp: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0xd1d5db) }, // gray-300 (Tungsten Carbide/SiC)
            uHeatColor: { value: new THREE.Color(0xef4444) } // red-500
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
            uniform vec3 uBaseColor;
            uniform vec3 uHeatColor;
            varying vec3 vNormal;
            void main() {
                vec3 color = mix(uBaseColor, uHeatColor, uTemp * 0.8);
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });
    const rotRing = new THREE.Mesh(rotRingGeo, rotRingMat);
    rotRing.rotation.y = Math.PI / 2;
    rotRing.position.x = -0.4; // Touching stationary ring
    sealGroup.add(rotRing);

    // Spring
    const springCurve = new THREE.CatmullRomCurve3(
        Array.from({length: 50}, (_, i) => {
            const t = i / 49;
            const angle = t * Math.PI * 20; // 10 coils
            return new THREE.Vector3(t * 2, Math.cos(angle) * 1.3, Math.sin(angle) * 1.3);
        })
    );
    const springGeo = new THREE.TubeGeometry(springCurve, 200, 0.1, 8, false);
    const springMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.6, roughness: 0.4 });
    const spring = new THREE.Mesh(springGeo, springMat);
    spring.position.x = -0.4;
    sealGroup.add(spring);

    // Housing Cutaway
    const housingGeo = new THREE.CylinderGeometry(2.5, 2.5, 6, 32, 1, false, 0, Math.PI);
    const housingMat = new THREE.MeshStandardMaterial({ 
        color: 0x7f1d1d, // red-900 (Fire pump color)
        metalness: 0.3, 
        roughness: 0.6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.rotation.z = Math.PI / 2;
    housing.position.x = -1;
    sealGroup.add(housing);

    // Water Leakage Particles
    const maxDrops = 100;
    const dropGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const dropMat = new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd, // blue-300
        transparent: true,
        opacity: 0.6,
        transmission: 0.9,
        roughness: 0.1
    });
    
    const drops: { mesh: THREE.Mesh, velocity: THREE.Vector3, active: boolean }[] = [];
    for(let i=0; i<maxDrops; i++) {
        const drop = new THREE.Mesh(dropGeo, dropMat);
        drop.visible = false;
        sealGroup.add(drop);
        drops.push({ mesh: drop, velocity: new THREE.Vector3(), active: false });
    }

    const clock = new THREE.Clock();
    let lastDropTime = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Shaft rotation (only when running, but let's assume it's running for visual effect, or slowly turning)
      const isRunning = currentState.waterPressure > 0.5;
      const speed = isRunning ? 0.5 : 0.01;
      shaft.rotation.x += speed;
      rotRing.rotation.x += speed;
      spring.rotation.x += speed;

      // Vibration
      const vib = currentState.vibration * 0.02;
      sealGroup.position.y = Math.sin(time * 30) * vib;
      sealGroup.position.z = Math.cos(time * 30) * vib;

      // Heat Shader Update
      // Normal temp ~30C, critical > 80C (dry running)
      const tempRatio = Math.max(0, Math.min(1, (currentState.sealTemperature - 20) / 60));
      rotRingMat.uniforms.uTemp.value = tempRatio;

      // Leakage Animation
      // leakageRate is drops/min. Convert to drops/sec
      const dropsPerSec = currentState.leakageRate / 60;
      const dropInterval = dropsPerSec > 0 ? 1 / dropsPerSec : Infinity;

      if (time - lastDropTime > dropInterval) {
          // Spawn a drop
          const inactiveDrop = drops.find(d => !d.active);
          if (inactiveDrop) {
              inactiveDrop.active = true;
              inactiveDrop.mesh.visible = true;
              // Spawn at the bottom of the seal interface
              inactiveDrop.mesh.position.set(-0.7, -1.2, (Math.random() - 0.5) * 0.5);
              inactiveDrop.velocity.set((Math.random() - 0.5) * 0.02, -0.05, (Math.random() - 0.5) * 0.02);
              lastDropTime = time;
          }
      }

      // Update active drops
      drops.forEach(drop => {
          if (drop.active) {
              drop.mesh.position.add(drop.velocity);
              drop.velocity.y -= 0.002; // Gravity
              
              // Reset if it falls too far
              if (drop.mesh.position.y < -4) {
                  drop.active = false;
                  drop.mesh.visible = false;
              }
          }
      });

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
      shaftMat.dispose();
      statRingGeo.dispose();
      statRingMat.dispose();
      rotRingGeo.dispose();
      rotRingMat.dispose();
      springGeo.dispose();
      springMat.dispose();
      housingGeo.dispose();
      housingMat.dispose();
      dropGeo.dispose();
      dropMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
