import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PortGateAutomationProps } from './three-types';

export const ThreeScene: React.FC<PortGateAutomationProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2a2a); // Dark green/grey

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Ground/Road
    const roadGeo = new THREE.PlaneGeometry(50, 20);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Lane markings
    const lineGeo = new THREE.PlaneGeometry(2, 0.5);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = -20; i <= 20; i += 4) {
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(i, 0.01, 0);
      line.rotation.x = -Math.PI / 2;
      scene.add(line);
    }

    // Gate Infrastructure
    const gateGroup = new THREE.Group();
    scene.add(gateGroup);

    // Pillars
    const pillarGeo = new THREE.BoxGeometry(2, 8, 2);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.5 });
    
    const pillar1 = new THREE.Mesh(pillarGeo, pillarMat);
    pillar1.position.set(0, 4, 6);
    gateGroup.add(pillar1);
    
    const pillar2 = new THREE.Mesh(pillarGeo, pillarMat);
    pillar2.position.set(0, 4, -6);
    gateGroup.add(pillar2);

    // Overhead structure
    const overheadGeo = new THREE.BoxGeometry(2, 1, 14);
    const overhead = new THREE.Mesh(overheadGeo, pillarMat);
    overhead.position.set(0, 8.5, 0);
    gateGroup.add(overhead);

    // Barrier Arm
    const barrierGeo = new THREE.BoxGeometry(0.5, 0.5, 10);
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    // Pivot point
    const barrierPivot = new THREE.Group();
    barrierPivot.position.set(0, 3, 5);
    barrier.position.set(0, 0, -5); // Offset so it rotates from the end
    barrierPivot.add(barrier);
    gateGroup.add(barrierPivot);

    // Sensors/Cameras (OCR, RFID)
    const sensorGeo = new THREE.BoxGeometry(1, 1, 1);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const sensors: THREE.Mesh[] = [];

    // Top cameras (Container OCR)
    const cam1 = new THREE.Mesh(sensorGeo, sensorMat);
    cam1.position.set(0, 8, 3);
    cam1.rotation.y = -Math.PI / 4;
    gateGroup.add(cam1);
    sensors.push(cam1);

    const cam2 = new THREE.Mesh(sensorGeo, sensorMat);
    cam2.position.set(0, 8, -3);
    cam2.rotation.y = Math.PI / 4;
    gateGroup.add(cam2);
    sensors.push(cam2);

    // Side readers (RFID/License Plate)
    const reader1 = new THREE.Mesh(sensorGeo, sensorMat);
    reader1.position.set(0, 4, 5);
    gateGroup.add(reader1);
    sensors.push(reader1);

    // Sensor scan beams (visible during inspection)
    const beamGeo = new THREE.ConeGeometry(2, 10, 16);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    const beams: THREE.Mesh[] = [];

    sensors.forEach(sensor => {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.copy(sensor.position);
      beam.position.y -= 5;
      beam.visible = false;
      gateGroup.add(beam);
      beams.push(beam);
    });

    // Truck
    const truckGroup = new THREE.Group();
    scene.add(truckGroup);

    const cabGeo = new THREE.BoxGeometry(4, 4, 4);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x0055ff });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(2, 2, 0);
    truckGroup.add(cab);

    const trailerGeo = new THREE.BoxGeometry(12, 4.5, 4);
    const trailerMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const trailer = new THREE.Mesh(trailerGeo, trailerMat);
    trailer.position.set(-6, 2.25, 0);
    truckGroup.add(trailer);

    const wheelGeo = new THREE.CylinderGeometry(1, 1, 0.5, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const wheelPositions = [
      [2, 1, 2.25], [2, 1, -2.25],
      [-2, 1, 2.25], [-2, 1, -2.25],
      [-10, 1, 2.25], [-10, 1, -2.25]
    ];
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.rotation.x = Math.PI / 2;
      truckGroup.add(wheel);
    });

    let animationId: number;
    let currentGateAngle = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const { truckPosition, gateStatus, isInspecting } = propsRef.current;

      // Move truck
      truckGroup.position.x = truckPosition;

      // Animate gate barrier
      const targetAngle = (gateStatus === 'open' || gateStatus === 'opening') ? Math.PI / 2 : 0;
      currentGateAngle += (targetAngle - currentGateAngle) * 0.1;
      barrierPivot.rotation.x = currentGateAngle;

      // Inspection mode
      if (isInspecting) {
        beams.forEach(beam => beam.visible = true);
        sensors.forEach(s => (s.material as THREE.MeshStandardMaterial).emissive.setHex(0x00ff00));
      } else {
        beams.forEach(beam => beam.visible = false);
        sensors.forEach(s => (s.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000));
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
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    if (mountRef.current) resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      roadGeo.dispose();
      roadMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      pillarGeo.dispose();
      pillarMat.dispose();
      overheadGeo.dispose();
      barrierGeo.dispose();
      barrierMat.dispose();
      sensorGeo.dispose();
      sensorMat.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      cabGeo.dispose();
      cabMat.dispose();
      trailerGeo.dispose();
      trailerMat.dispose();
      wheelGeo.dispose();
      wheelMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
