import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PlantRoofProps } from './three-types';

export const ThreeScene: React.FC<PlantRoofProps> = (props) => {
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
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    scene.add(directionalLight);

    // Roof Structure
    const roofGroup = new THREE.Group();
    
    // Main Roof Plane
    const roofGeo = new THREE.PlaneGeometry(40, 40, 10, 10);
    const roofMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, // slate-700
      roughness: 0.8,
      metalness: 0.2,
      wireframe: true
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = -Math.PI / 2;
    roofGroup.add(roof);

    // Solar Panels
    const panelGeo = new THREE.BoxGeometry(4, 0.2, 6);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.9, roughness: 0.1 }); // sky-500
    
    for (let i = -15; i <= 15; i += 8) {
      for (let j = -15; j <= 15; j += 10) {
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(i, 0.2, j);
        panel.rotation.x = Math.PI / 12; // tilted
        roofGroup.add(panel);
      }
    }

    // Drone
    const droneGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(1, 0.5, 1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc }); // slate-50
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    droneGroup.add(body);

    const propGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const propMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 }); // slate-400
    const propsList: THREE.Mesh[] = [];
    
    const propPositions = [
      [0.6, 0.3, 0.6], [-0.6, 0.3, 0.6], [0.6, 0.3, -0.6], [-0.6, 0.3, -0.6]
    ];

    propPositions.forEach(pos => {
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(pos[0], pos[1], pos[2]);
      droneGroup.add(prop);
      propsList.push(prop);
    });

    // Drone Scanner Beam
    const beamGeo = new THREE.ConeGeometry(3, 10, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({ 
      color: 0x38bdf8, // sky-400
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = -5;
    beam.rotation.x = Math.PI;
    droneGroup.add(beam);

    droneGroup.position.set(0, 10, 0);
    scene.add(droneGroup);
    scene.add(roofGroup);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { structuralIntegrity, isAlert } = propsRef.current;

      // Drone hover and patrol
      droneGroup.position.x = Math.sin(time * 0.5) * 15;
      droneGroup.position.z = Math.cos(time * 0.3) * 15;
      droneGroup.position.y = 10 + Math.sin(time * 2) * 0.5;
      
      // Drone tilt
      droneGroup.rotation.z = -Math.sin(time * 0.5) * 0.2;
      droneGroup.rotation.x = Math.cos(time * 0.3) * 0.2;

      // Propellers spin
      propsList.forEach(prop => {
        prop.rotation.y += 0.5;
      });

      // Alert visualization
      if (isAlert) {
        beamMat.color.setHex(0xf87171); // red-400
        roofMat.color.setHex(0x7f1d1d); // red-900 (simulating heat/damage)
      } else {
        beamMat.color.setHex(0x38bdf8); // sky-400
        roofMat.color.setHex(0x334155); // slate-700
      }

      // Structural integrity visualization (wireframe opacity)
      roofMat.wireframeLinewidth = (100 - structuralIntegrity) / 10 + 1;

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
