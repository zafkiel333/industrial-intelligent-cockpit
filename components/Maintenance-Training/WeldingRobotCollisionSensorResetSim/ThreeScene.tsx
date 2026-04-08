import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WeldingRobotState } from './three-types';

interface ThreeSceneProps {
  state: WeldingRobotState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<WeldingRobotState>(state);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const jointsRef = useRef<THREE.Group[]>([]);

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
    camera.position.set(5, 4, 6);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Workpiece (Collision Target)
    const workpieceGeo = new THREE.BoxGeometry(1, 0.5, 1);
    const workpieceMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const workpiece = new THREE.Mesh(workpieceGeo, workpieceMat);
    workpiece.position.set(1.5, 0.25, 0);
    scene.add(workpiece);

    // Robot Arm Construction
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);
    robotGroupRef.current = robotGroup;
    jointsRef.current = [];

    const robotColor = 0xf59e0b; // Yellow
    const jointColor = 0x334155; // Dark grey

    // Base
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: jointColor });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.1;
    robotGroup.add(base);

    // Joint 1 (Waist)
    const j1Group = new THREE.Group();
    j1Group.position.y = 0.2;
    robotGroup.add(j1Group);
    jointsRef.current.push(j1Group);

    const link1Geo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 32);
    const link1Mat = new THREE.MeshStandardMaterial({ color: robotColor });
    const link1 = new THREE.Mesh(link1Geo, link1Mat);
    link1.position.y = 0.4;
    j1Group.add(link1);

    // Joint 2 (Shoulder)
    const j2Group = new THREE.Group();
    j2Group.position.y = 0.8;
    j1Group.add(j2Group);
    jointsRef.current.push(j2Group);

    const j2MeshGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 32);
    const j2Mesh = new THREE.Mesh(j2MeshGeo, baseMat);
    j2Mesh.rotation.x = Math.PI / 2;
    j2Group.add(j2Mesh);

    const link2Geo = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const link2 = new THREE.Mesh(link2Geo, link1Mat);
    link2.position.y = 0.75;
    j2Group.add(link2);

    // Joint 3 (Elbow)
    const j3Group = new THREE.Group();
    j3Group.position.y = 1.5;
    j2Group.add(j3Group);
    jointsRef.current.push(j3Group);

    const j3MeshGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 32);
    const j3Mesh = new THREE.Mesh(j3MeshGeo, baseMat);
    j3Mesh.rotation.x = Math.PI / 2;
    j3Group.add(j3Mesh);

    const link3Geo = new THREE.BoxGeometry(0.3, 1.2, 0.3);
    const link3 = new THREE.Mesh(link3Geo, link1Mat);
    link3.position.y = 0.6;
    link3.position.x = 0.1; // Offset slightly
    j3Group.add(link3);

    // Joint 4 (Wrist Roll)
    const j4Group = new THREE.Group();
    j4Group.position.y = 1.2;
    j4Group.position.x = 0.1;
    j3Group.add(j4Group);
    jointsRef.current.push(j4Group);

    const link4Geo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 32);
    const link4 = new THREE.Mesh(link4Geo, link1Mat);
    link4.position.y = 0.2;
    j4Group.add(link4);

    // Joint 5 (Wrist Pitch)
    const j5Group = new THREE.Group();
    j5Group.position.y = 0.4;
    j4Group.add(j5Group);
    jointsRef.current.push(j5Group);

    const j5MeshGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 32);
    const j5Mesh = new THREE.Mesh(j5MeshGeo, baseMat);
    j5Mesh.rotation.x = Math.PI / 2;
    j5Group.add(j5Mesh);

    // Joint 6 (Wrist Yaw / Tool Flange)
    const j6Group = new THREE.Group();
    j5Group.add(j6Group);
    jointsRef.current.push(j6Group);

    const flangeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32);
    const flange = new THREE.Mesh(flangeGeo, baseMat);
    flange.position.y = 0.1;
    j6Group.add(flange);

    // Welding Gun & Collision Sensor
    const toolGroup = new THREE.Group();
    toolGroup.position.y = 0.15;
    j6Group.add(toolGroup);

    // Sensor Mount (The part that trips)
    const sensorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x10b981 }); // Green normally
    const sensorMesh = new THREE.Mesh(sensorGeo, sensorMat);
    toolGroup.add(sensorMesh);

    // Gun Neck
    const neckGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16);
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.y = 0.35;
    neck.rotation.z = -Math.PI / 6; // Angle it
    toolGroup.add(neck);

    // Nozzle
    const nozzleGeo = new THREE.ConeGeometry(0.06, 0.15, 16);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xb45309 }); // Copper
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(0.12, 0.55, 0);
    nozzle.rotation.z = -Math.PI / 6;
    toolGroup.add(nozzle);

    // Collision Visualizer (Red sphere at tip)
    const collisionGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const collisionMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 });
    const collisionSphere = new THREE.Mesh(collisionGeo, collisionMat);
    collisionSphere.position.copy(nozzle.position);
    toolGroup.add(collisionSphere);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Apply Joint Angles
      if (jointsRef.current.length === 6) {
          jointsRef.current[0].rotation.y = THREE.MathUtils.degToRad(currentState.jointAngles[0]);
          jointsRef.current[1].rotation.z = THREE.MathUtils.degToRad(currentState.jointAngles[1]);
          jointsRef.current[2].rotation.z = THREE.MathUtils.degToRad(currentState.jointAngles[2]);
          jointsRef.current[3].rotation.y = THREE.MathUtils.degToRad(currentState.jointAngles[3]);
          jointsRef.current[4].rotation.z = THREE.MathUtils.degToRad(currentState.jointAngles[4]);
          jointsRef.current[5].rotation.y = THREE.MathUtils.degToRad(currentState.jointAngles[5]);
      }

      // Update Sensor Visuals
      if (currentState.collisionSensorStatus === 'Triggered') {
          sensorMat.color.setHex(0xef4444); // Red
          collisionMat.opacity = 0.5 + Math.sin(Date.now() * 0.01) * 0.5; // Pulsing red
          
          // Simulate mechanical deflection of the sensor mount
          toolGroup.rotation.x = Math.PI / 12; 
      } else if (currentState.collisionSensorStatus === 'Resetting') {
          sensorMat.color.setHex(0xf59e0b); // Orange
          collisionMat.opacity = 0;
          toolGroup.rotation.x = THREE.MathUtils.lerp(toolGroup.rotation.x, 0, 0.1); // Slowly return
      } else {
          sensorMat.color.setHex(0x10b981); // Green
          collisionMat.opacity = 0;
          toolGroup.rotation.x = 0;
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
