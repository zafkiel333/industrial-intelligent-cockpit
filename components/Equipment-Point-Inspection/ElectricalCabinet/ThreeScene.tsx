import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ElectricalCabinetProps } from './three-types';

export const ThreeScene: React.FC<ElectricalCabinetProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // slate-900
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Cabinet Body
    const cabinetGeo = new THREE.BoxGeometry(10, 16, 6);
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4 }); // slate-400
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.position.y = 8;
    scene.add(cabinet);

    // Cabinet Interior (Darker)
    const interiorGeo = new THREE.BoxGeometry(9.6, 15.6, 5.8);
    const interiorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b }); // slate-800
    const interior = new THREE.Mesh(interiorGeo, interiorMat);
    interior.position.set(0, 0, 0.1); // Slightly forward to show inside when door opens
    cabinet.add(interior);

    // Cabinet Door
    const doorGroup = new THREE.Group();
    doorGroup.position.set(-5, 8, 3); // Hinge position (left side, front)
    scene.add(doorGroup);

    const doorGeo = new THREE.BoxGeometry(10, 16, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.5, roughness: 0.3 }); // slate-300
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(5, 0, 0); // Offset so it rotates around the hinge
    doorGroup.add(door);

    // Components inside (Breakers, Contactors, Busbars)
    const componentsGroup = new THREE.Group();
    componentsGroup.position.set(0, 0, 2.5); // Front of interior
    interior.add(componentsGroup);

    // Busbars (Copper)
    const busbarGeo = new THREE.BoxGeometry(8, 0.5, 0.5);
    const busbarMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 }); // amber-700
    for (let i = 0; i < 3; i++) {
      const busbar = new THREE.Mesh(busbarGeo, busbarMat);
      busbar.position.set(0, 5 - i * 1.5, 0);
      componentsGroup.add(busbar);
    }

    // Breakers
    const breakerGeo = new THREE.BoxGeometry(1.5, 2, 1);
    const breakerMat = new THREE.MeshStandardMaterial({ color: 0x334155 }); // slate-700
    const hotBreakerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0 }); // Red for heat
    
    const breakers: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      // Make one breaker the "hot" one
      const mat = i === 2 ? hotBreakerMat : breakerMat;
      const breaker = new THREE.Mesh(breakerGeo, mat);
      breaker.position.set(-3 + i * 2, 0, 0);
      componentsGroup.add(breaker);
      breakers.push(breaker);
    }

    // Wiring (Lines)
    const wireMat = new THREE.LineBasicMaterial({ color: 0x3b82f6 }); // blue-500
    for(let i=0; i<4; i++) {
      const points = [];
      points.push(new THREE.Vector3(-3 + i * 2, 1, 0));
      points.push(new THREE.Vector3(-3 + i * 2, 3.5, 0));
      const wireGeo = new THREE.BufferGeometry().setFromPoints(points);
      const wire = new THREE.Line(wireGeo, wireMat);
      componentsGroup.add(wire);
    }

    // Thermal Visualization (Heatmap overlay on interior)
    const heatGeo = new THREE.PlaneGeometry(9.6, 15.6);
    const heatMat = new THREE.MeshBasicMaterial({ 
      color: 0xef4444, 
      transparent: true, 
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const heatOverlay = new THREE.Mesh(heatGeo, heatMat);
    heatOverlay.position.set(0, 0, 2.8); // Just in front of components
    interior.add(heatOverlay);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { temperature, current, voltage, isAlert, doorOpen } = propsRef.current;

      // 1. Animate Door
      const targetRotation = doorOpen ? -Math.PI / 1.5 : 0;
      doorGroup.rotation.y += (targetRotation - doorGroup.rotation.y) * 0.1;

      // 2. Thermal Visualization
      // Map temperature (e.g., 30-80C) to opacity
      const tempOpacity = Math.max(0, Math.min(0.8, (temperature - 40) / 40));
      heatMat.opacity = tempOpacity;
      
      // The "hot" breaker glows based on temperature
      if (temperature > 60) {
        hotBreakerMat.emissiveIntensity = (temperature - 60) / 20;
      } else {
        hotBreakerMat.emissiveIntensity = 0;
      }

      // 3. Current Visualization (Pulse wires if current is high)
      if (current > 150) {
        wireMat.color.setHex(0xef4444); // Red
        // Pulse effect
        if (Math.sin(time * 10) > 0) {
          wireMat.opacity = 1;
        } else {
          wireMat.opacity = 0.5;
        }
        wireMat.transparent = true;
      } else {
        wireMat.color.setHex(0x3b82f6); // Blue
        wireMat.transparent = false;
      }

      // 4. Alert Colors on Cabinet Exterior
      if (isAlert) {
        cabinetMat.color.setHex(0xfca5a5); // Tint red
      } else if (temperature > 65 || current > 180) {
        cabinetMat.color.setHex(0xfef08a); // Tint yellow
      } else {
        cabinetMat.color.setHex(0x94a3b8); // Normal slate
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
