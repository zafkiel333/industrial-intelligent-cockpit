import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AGVLidarState } from './three-types';

interface ThreeSceneProps {
  state: AGVLidarState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AGVLidarState>(state);

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

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    scene.add(gridHelper);

    // AGV Body
    const agvGroup = new THREE.Group();
    scene.add(agvGroup);

    const bodyGeo = new THREE.BoxGeometry(3, 1, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.5 }); // Blue AGV
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    agvGroup.add(body);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const createWheel = (x: number, z: number) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.5, z);
      agvGroup.add(wheel);
    };
    createWheel(-1.7, 1.5);
    createWheel(1.7, 1.5);
    createWheel(-1.7, -1.5);
    createWheel(1.7, -1.5);

    // Lidar Sensor (Top center)
    const lidarGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 16);
    const lidarMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }); // Amber
    const lidar = new THREE.Mesh(lidarGeo, lidarMat);
    lidar.position.set(0, 1.3, 0);
    agvGroup.add(lidar);

    // Lidar Scan Plane (Visualizing the scan area)
    const scanGeo = new THREE.CircleGeometry(stateRef.current.scanRadius, 64);
    const scanMat = new THREE.MeshBasicMaterial({ 
      color: 0x22c55e, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.x = -Math.PI / 2;
    scanPlane.position.y = 1.3;
    agvGroup.add(scanPlane);

    // Lidar Beam (Scanning line)
    const beamGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0, 0, -stateRef.current.scanRadius)]);
    const beamMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 2 });
    const beam = new THREE.Line(beamGeo, beamMat);
    beam.position.y = 1.3;
    agvGroup.add(beam);

    // Obstacles
    const obstacleMeshes: THREE.Mesh[] = [];
    const obsGeo = new THREE.BoxGeometry(1, 2, 1);
    const obsMatNormal = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const obsMatDetected = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 });

    stateRef.current.obstacles.forEach(obs => {
      const mesh = new THREE.Mesh(obsGeo, obsMatNormal);
      mesh.position.set(obs.x, 1, obs.y);
      scene.add(mesh);
      obstacleMeshes.push(mesh);
    });

    // Calibration Target (Reflective pole)
    const targetGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
    const targetMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.2 });
    const target = new THREE.Mesh(targetGeo, targetMat);
    target.position.set(0, 1.5, -8); // Directly in front at distance 8
    scene.add(target);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update AGV Position
      agvGroup.position.x = currentState.agvPosition.x;
      agvGroup.position.z = currentState.agvPosition.y;

      // Update Lidar Beam Rotation
      // Apply calibration offset to the visual beam
      const effectiveAngle = currentState.lidarAngle + currentState.calibrationOffset;
      beam.rotation.y = -effectiveAngle * (Math.PI / 180);

      // Update Scan Plane color based on mode
      if (currentState.calibrationMode) {
        scanMat.color.setHex(0x3b82f6); // Blue in calibration mode
        beamMat.color.setHex(0x3b82f6);
      } else {
        scanMat.color.setHex(currentState.isCalibrated ? 0x22c55e : 0xf59e0b); // Green if calibrated, Orange if not
        beamMat.color.setHex(currentState.isCalibrated ? 0x22c55e : 0xf59e0b);
      }

      // Update Obstacles (Simple collision/detection visual)
      currentState.obstacles.forEach((obs, index) => {
        if (obstacleMeshes[index]) {
          obstacleMeshes[index].material = obs.detected ? obsMatDetected : obsMatNormal;
        }
      });

      // Highlight target if beam hits it (simplified check)
      if (currentState.calibrationMode) {
         // Target is at (0, -8) relative to origin. AGV is at origin.
         // Angle to target is 0 degrees (straight ahead).
         // If effective angle is close to 0, it hits.
         const normalizedAngle = ((effectiveAngle % 360) + 360) % 360;
         if (normalizedAngle < 2 || normalizedAngle > 358) {
            targetMat.emissive.setHex(0x3b82f6);
            targetMat.emissiveIntensity = 0.8;
         } else {
            targetMat.emissiveIntensity = 0;
         }
      } else {
         targetMat.emissiveIntensity = 0;
      }

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
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
