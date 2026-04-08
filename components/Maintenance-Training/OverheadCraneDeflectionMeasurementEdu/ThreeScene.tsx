import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OverheadCraneState } from './three-types';

interface ThreeSceneProps {
  state: OverheadCraneState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<OverheadCraneState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Factory Environment
    const floorGeo = new THREE.PlaneGeometry(40, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -5;
    scene.add(floor);

    // Runway Beams
    const runwayGeo = new THREE.BoxGeometry(40, 1, 1);
    const runwayMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
    const runway1 = new THREE.Mesh(runwayGeo, runwayMat);
    runway1.position.set(0, 5, -8);
    scene.add(runway1);
    const runway2 = new THREE.Mesh(runwayGeo, runwayMat);
    runway2.position.set(0, 5, 8);
    scene.add(runway2);

    // Crane Bridge Group
    const craneGroup = new THREE.Group();
    scene.add(craneGroup);

    // Main Girder (with deflection)
    const girderLength = 16;
    const girderSegments = 20;
    const girderGeo = new THREE.BoxGeometry(1, 1.5, girderLength, 1, 1, girderSegments);
    const girderMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 }); // Yellow
    const girder = new THREE.Mesh(girderGeo, girderMat);
    craneGroup.add(girder);

    // End Carriages
    const endCarriageGeo = new THREE.BoxGeometry(3, 1.2, 1.5);
    const endCarriageMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const ec1 = new THREE.Mesh(endCarriageGeo, endCarriageMat);
    ec1.position.set(0, 0, -8);
    craneGroup.add(ec1);
    const ec2 = new THREE.Mesh(endCarriageGeo, endCarriageMat);
    ec2.position.set(0, 0, 8);
    craneGroup.add(ec2);

    // Trolley
    const trolleyGroup = new THREE.Group();
    craneGroup.add(trolleyGroup);

    const trolleyGeo = new THREE.BoxGeometry(1.5, 1, 2);
    const trolleyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue
    const trolleyMesh = new THREE.Mesh(trolleyGeo, trolleyMat);
    trolleyMesh.position.y = 1;
    trolleyGroup.add(trolleyMesh);

    // Hoist Rope & Hook
    const ropeGeo = new THREE.CylinderGeometry(0.05, 0.05, 1);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.position.y = -0.5;
    trolleyGroup.add(rope);

    const hookGeo = new THREE.TorusGeometry(0.3, 0.1, 8, 16, Math.PI);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    hook.rotation.z = Math.PI;
    hook.position.y = -1;
    trolleyGroup.add(hook);

    // Load
    const loadGeo = new THREE.BoxGeometry(2, 2, 2);
    const loadMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const load = new THREE.Mesh(loadGeo, loadMat);
    load.position.y = -2.5;
    trolleyGroup.add(load);

    // Laser Measurement System (Visual)
    const laserDeviceGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const laserDeviceMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
    const laserDevice = new THREE.Mesh(laserDeviceGeo, laserDeviceMat);
    laserDevice.position.set(0, -5, 0); // On the floor, center
    scene.add(laserDevice);

    const laserBeamGeo = new THREE.CylinderGeometry(0.02, 0.02, 10);
    const laserBeamMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });
    const laserBeam = new THREE.Mesh(laserBeamGeo, laserBeamMat);
    laserBeam.position.set(0, 0, 0);
    scene.add(laserBeam);

    // Target Reflector on Girder Center
    const reflectorGeo = new THREE.PlaneGeometry(0.4, 0.4);
    const reflectorMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const reflector = new THREE.Mesh(reflectorGeo, reflectorMat);
    reflector.rotation.x = Math.PI / 2;
    reflector.position.set(0, -0.76, 0); // Bottom of girder
    craneGroup.add(reflector);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Bridge Position
      craneGroup.position.x = currentState.bridgePosition;

      // Update Trolley Position (-8 to 8 range based on 0-100%)
      const trolleyZ = ((currentState.trolleyPosition / 100) * 16) - 8;
      trolleyGroup.position.z = trolleyZ;

      // Apply Deflection to Girder Geometry
      // Deflection is max at center, 0 at ends. Parabolic approximation.
      const maxDeflection = currentState.mainGirderDeflection / 1000; // Convert mm to m for visual scale (exaggerated slightly if needed, but keeping 1:1 for now, maybe multiply by 10 for visibility)
      const visualExaggeration = 5; // Make it visible
      
      const positions = girderGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
          const z = positions.getZ(i);
          // Normalized position -1 to 1
          const normalizedZ = z / (girderLength / 2);
          // Parabola: y = -a * x^2 + a
          const deflectionY = -maxDeflection * visualExaggeration * (1 - normalizedZ * normalizedZ);
          
          // Base Y is either 0.75 or -0.75 depending on vertex
          const baseY = positions.getY(i) > 0 ? 0.75 : -0.75;
          positions.setY(i, baseY + deflectionY);
      }
      positions.needsUpdate = true;

      // Update Trolley Y position based on local girder deflection
      const trolleyNormalizedZ = trolleyZ / (girderLength / 2);
      const trolleyDeflectionY = -maxDeflection * visualExaggeration * (1 - trolleyNormalizedZ * trolleyNormalizedZ);
      trolleyGroup.position.y = trolleyDeflectionY;

      // Update Reflector Position
      reflector.position.y = -0.76 - (maxDeflection * visualExaggeration);

      // Update Load
      load.visible = currentState.loadWeight > 0;
      if (currentState.isLifting) {
          rope.scale.y = 2 + Math.sin(Date.now() * 0.005) * 0.5;
          rope.position.y = -0.5 * rope.scale.y;
          hook.position.y = -rope.scale.y;
          load.position.y = -rope.scale.y - 1.5;
      } else {
          rope.scale.y = 3;
          rope.position.y = -1.5;
          hook.position.y = -3;
          load.position.y = -4.5;
      }

      // Update Laser Beam
      // Laser points from device to reflector
      const devicePos = new THREE.Vector3();
      laserDevice.getWorldPosition(devicePos);
      
      const reflectorPos = new THREE.Vector3();
      reflector.getWorldPosition(reflectorPos);

      const distance = devicePos.distanceTo(reflectorPos);
      laserBeam.scale.y = distance / 10; // Base geometry is 10 units long
      laserBeam.position.copy(devicePos).lerp(reflectorPos, 0.5);
      laserBeam.lookAt(reflectorPos);
      laserBeam.rotateX(Math.PI / 2); // Align cylinder

      if (currentState.laserSensorStatus === 'Error') {
          laserBeam.visible = false;
          laserDeviceMat.color.setHex(0xef4444);
      } else if (currentState.laserSensorStatus === 'Warning') {
          laserBeam.visible = true;
          laserBeamMat.color.setHex(0xf59e0b);
          laserDeviceMat.color.setHex(0xf59e0b);
      } else {
          laserBeam.visible = true;
          laserBeamMat.color.setHex(0x10b981);
          laserDeviceMat.color.setHex(0x10b981);
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
