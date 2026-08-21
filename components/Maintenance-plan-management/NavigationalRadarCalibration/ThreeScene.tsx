import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { NavigationalRadarCalibrationProps } from './three-types';

export const ThreeScene: React.FC<NavigationalRadarCalibrationProps> = (props) => {
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ff00, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const radarGroup = new THREE.Group();

    // Radar Mast/Base
    const mastGeo = new THREE.CylinderGeometry(0.5, 0.8, 8, 16);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.8, roughness: 0.2 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 4;
    radarGroup.add(mast);

    // Radar Antenna (Scanner)
    const antennaGroup = new THREE.Group();
    antennaGroup.position.y = 8.5;

    const scannerGeo = new THREE.BoxGeometry(8, 0.5, 0.8);
    const scannerMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.5 });
    const scanner = new THREE.Mesh(scannerGeo, scannerMat);
    antennaGroup.add(scanner);

    // Motor housing
    const motorGeo = new THREE.CylinderGeometry(1, 1, 1, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.y = -0.5;
    antennaGroup.add(motor);

    radarGroup.add(antennaGroup);
    scene.add(radarGroup);

    // Radar Wave Effect (Sweep)
    const sweepGeo = new THREE.PlaneGeometry(20, 20);
    const sweepMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    // Create a wedge shape for the sweep
    const positions = sweepGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        if (x < 0) {
            positions.setX(i, 0); // Collapse left side to center
        } else {
            // Taper the right side
            positions.setY(i, y * (1 - x/20));
        }
    }
    sweepGeo.computeVertexNormals();

    const sweep = new THREE.Mesh(sweepGeo, sweepMat);
    sweep.rotation.x = -Math.PI / 2;
    sweep.position.y = 8.2;
    scene.add(sweep);

    // Calibration Targets (Ships/Buoys)
    const targets: THREE.Mesh[] = [];
    const targetGeo = new THREE.BoxGeometry(1, 1, 2);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    const targetPositions = [
        {x: 8, z: -8},
        {x: -10, z: -5},
        {x: 5, z: 12}
    ];

    targetPositions.forEach(pos => {
        const target = new THREE.Mesh(targetGeo, targetMat);
        target.position.set(pos.x, 0.5, pos.z);
        target.visible = false; // Only visible when swept
        targets.push(target);
        scene.add(target);
    });

    // Radar Screen Grid (Floor)
    const gridHelper = new THREE.PolarGridHelper(15, 16, 8, 64, 0x00ff00, 0x003300);
    gridHelper.position.y = 0.1;
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { rotationSpeed, isCalibrating, signalStrength } = propsRef.current;

      // Rotate Antenna
      const speed = isCalibrating ? rotationSpeed * 0.5 : rotationSpeed; // Slower during calibration
      antennaGroup.rotation.y -= (speed * Math.PI / 30) * delta; // RPM to rad/s
      
      // Sync sweep with antenna
      sweep.rotation.z = antennaGroup.rotation.y;

      // Adjust sweep opacity based on signal strength
      sweepMat.opacity = 0.1 + (signalStrength / 100) * 0.3;

      if (isCalibrating) {
        // Calibration mode: highlight targets when sweep passes over them
        const sweepAngle = (antennaGroup.rotation.y % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        
        targets.forEach(target => {
            const targetAngle = Math.atan2(-target.position.z, target.position.x);
            const normalizedTargetAngle = (targetAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            
            // Check if sweep is pointing at target (approximate wedge)
            const angleDiff = Math.abs(sweepAngle - normalizedTargetAngle);
            if (angleDiff < 0.2 || angleDiff > Math.PI * 2 - 0.2) {
                target.visible = true;
                target.material.color.setHex(0xffffff); // Flash white
            } else {
                target.visible = true;
                target.material.color.setHex(0x005500); // Dim green otherwise
            }
        });
      } else {
        targets.forEach(t => t.visible = false);
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
      mastGeo.dispose();
      mastMat.dispose();
      scannerGeo.dispose();
      scannerMat.dispose();
      motorGeo.dispose();
      motorMat.dispose();
      sweepGeo.dispose();
      sweepMat.dispose();
      targetGeo.dispose();
      targetMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
