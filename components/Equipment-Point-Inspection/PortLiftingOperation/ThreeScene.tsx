import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortLiftingOperationProps } from './three-types';

export const ThreeScene: React.FC<PortLiftingOperationProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(40, 30, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Dock/Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Gantry Crane Group
    const craneGroup = new THREE.Group();
    scene.add(craneGroup);

    const craneColor = 0x0284c7; // sky-600

    // Legs
    const legGeo = new THREE.BoxGeometry(2, 30, 2);
    const legMat = new THREE.MeshStandardMaterial({ color: craneColor, metalness: 0.6 });
    
    const leg1 = new THREE.Mesh(legGeo, legMat);
    leg1.position.set(-10, 15, -10);
    leg1.castShadow = true;
    craneGroup.add(leg1);
    
    const leg2 = new THREE.Mesh(legGeo, legMat);
    leg2.position.set(10, 15, -10);
    leg2.castShadow = true;
    craneGroup.add(leg2);
    
    const leg3 = new THREE.Mesh(legGeo, legMat);
    leg3.position.set(-10, 15, 10);
    leg3.castShadow = true;
    craneGroup.add(leg3);
    
    const leg4 = new THREE.Mesh(legGeo, legMat);
    leg4.position.set(10, 15, 10);
    leg4.castShadow = true;
    craneGroup.add(leg4);

    // Main Beam
    const beamGeo = new THREE.BoxGeometry(40, 3, 4);
    const beam = new THREE.Mesh(beamGeo, legMat);
    beam.position.set(0, 31.5, 0);
    beam.castShadow = true;
    craneGroup.add(beam);

    // Trolley (moves along beam)
    const trolleyGroup = new THREE.Group();
    trolleyGroup.position.set(0, 30, 0);
    craneGroup.add(trolleyGroup);

    const trolleyGeo = new THREE.BoxGeometry(4, 2, 5);
    const trolleyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // amber-500
    const trolley = new THREE.Mesh(trolleyGeo, trolleyMat);
    trolley.castShadow = true;
    trolleyGroup.add(trolley);

    // Cables
    const cableMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
    const cableGeo1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.5, 0, -1.5), new THREE.Vector3(-1.5, -15, -1.5)]);
    const cable1 = new THREE.Line(cableGeo1, cableMat);
    trolleyGroup.add(cable1);
    
    const cableGeo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(1.5, 0, -1.5), new THREE.Vector3(1.5, -15, -1.5)]);
    const cable2 = new THREE.Line(cableGeo2, cableMat);
    trolleyGroup.add(cable2);
    
    const cableGeo3 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.5, 0, 1.5), new THREE.Vector3(-1.5, -15, 1.5)]);
    const cable3 = new THREE.Line(cableGeo3, cableMat);
    trolleyGroup.add(cable3);
    
    const cableGeo4 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(1.5, 0, 1.5), new THREE.Vector3(1.5, -15, 1.5)]);
    const cable4 = new THREE.Line(cableGeo4, cableMat);
    trolleyGroup.add(cable4);

    // Spreader / Hook
    const spreaderGeo = new THREE.BoxGeometry(4, 0.5, 4);
    const spreaderMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // red-500
    const spreader = new THREE.Mesh(spreaderGeo, spreaderMat);
    spreader.position.y = -15;
    spreader.castShadow = true;
    trolleyGroup.add(spreader);

    // Container (Load)
    const containerGeo = new THREE.BoxGeometry(12, 5, 5);
    const containerMat = new THREE.MeshStandardMaterial({ color: 0x10b981 }); // emerald-500
    const container = new THREE.Mesh(containerGeo, containerMat);
    container.position.y = -17.5; // Below spreader
    container.castShadow = true;
    trolleyGroup.add(container);

    // Wind Visualization (Particles)
    const windCount = 500;
    const windGeo = new THREE.BufferGeometry();
    const windPos = new Float32Array(windCount * 3);
    for (let i = 0; i < windCount * 3; i += 3) {
      windPos[i] = (Math.random() - 0.5) * 80;
      windPos[i + 1] = Math.random() * 40;
      windPos[i + 2] = (Math.random() - 0.5) * 80;
    }
    windGeo.setAttribute('position', new THREE.BufferAttribute(windPos, 3));
    const windMat = new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.2, transparent: true, opacity: 0.4 });
    const windParticles = new THREE.Points(windGeo, windMat);
    scene.add(windParticles);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { craneStatus, loadWeight, windSpeed, isAlert } = propsRef.current;

      // Trolley movement (simulated operation)
      trolleyGroup.position.x = Math.sin(time * 0.5) * 10;
      
      // Hoist movement (up and down)
      const hoistY = Math.sin(time * 0.8) * 5 - 10;
      spreader.position.y = hoistY;
      container.position.y = hoistY - 2.5;

      // Update cables
      cableGeo1.setFromPoints([new THREE.Vector3(-1.5, 0, -1.5), new THREE.Vector3(-1.5, hoistY, -1.5)]);
      cableGeo2.setFromPoints([new THREE.Vector3(1.5, 0, -1.5), new THREE.Vector3(1.5, hoistY, -1.5)]);
      cableGeo3.setFromPoints([new THREE.Vector3(-1.5, 0, 1.5), new THREE.Vector3(-1.5, hoistY, 1.5)]);
      cableGeo4.setFromPoints([new THREE.Vector3(1.5, 0, 1.5), new THREE.Vector3(1.5, hoistY, 1.5)]);

      // Wind effect on load (sway)
      const swayAngle = (windSpeed / 20) * Math.sin(time * 2); // Sway based on wind speed
      spreader.rotation.z = swayAngle;
      container.rotation.z = swayAngle;
      
      // Wind particles movement
      const positions = windGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < windCount * 3; i += 3) {
        positions[i] += windSpeed * 0.1; // Move along X axis based on wind
        if (positions[i] > 40) positions[i] = -40; // Reset
      }
      windGeo.attributes.position.needsUpdate = true;

      // Status Colors
      if (craneStatus === 2 || isAlert) {
        spreaderMat.color.setHex(0xef4444); // Red
        containerMat.color.setHex(0xef4444);
      } else if (craneStatus === 1 || loadWeight > 40 || windSpeed > 15) {
        spreaderMat.color.setHex(0xfacc15); // Yellow
        containerMat.color.setHex(0xfacc15);
      } else {
        spreaderMat.color.setHex(0x3b82f6); // Blue
        containerMat.color.setHex(0x10b981); // Emerald
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
