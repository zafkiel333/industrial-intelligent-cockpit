import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ServoRepairState } from './three-types';

interface ThreeSceneProps {
  state: ServoRepairState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ServoRepairState>(state);

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
    camera.position.set(5, 5, 8);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Robot Base
    const baseGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
    const robotMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.3, roughness: 0.4 }); // Orange
    const base = new THREE.Mesh(baseGeo, robotMat);
    scene.add(base);

    // Joint 1
    const joint1Geo = new THREE.CylinderGeometry(1, 1, 1.5, 32);
    const joint1 = new THREE.Mesh(joint1Geo, robotMat);
    joint1.position.y = 1;
    base.add(joint1);

    // Arm 1
    const arm1Geo = new THREE.BoxGeometry(0.8, 3, 0.8);
    const arm1 = new THREE.Mesh(arm1Geo, robotMat);
    arm1.position.y = 1.5;
    joint1.add(arm1);

    // Joint 2 (Elbow)
    const joint2Geo = new THREE.SphereGeometry(0.8, 32, 32);
    const joint2 = new THREE.Mesh(joint2Geo, robotMat);
    joint2.position.y = 1.5;
    arm1.add(joint2);

    // Arm 2
    const arm2Geo = new THREE.BoxGeometry(0.6, 2.5, 0.6);
    const arm2 = new THREE.Mesh(arm2Geo, robotMat);
    arm2.position.y = 1.25;
    joint2.add(arm2);

    // Joint 3 (Wrist) - Where the servo is being replaced
    const joint3Group = new THREE.Group();
    joint3Group.position.y = 1.25;
    arm2.add(joint3Group);

    const wristHousingGeo = new THREE.BoxGeometry(1, 1, 1);
    const wristHousing = new THREE.Mesh(wristHousingGeo, robotMat);
    joint3Group.add(wristHousing);

    // Servo Motor (Target)
    const motorGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32);
    motorGeo.rotateZ(Math.PI / 2);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }); // Dark grey
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.set(0.5, 0, 0); // Sticking out the side
    joint3Group.add(motor);

    // Cover
    const coverGeo = new THREE.BoxGeometry(0.2, 0.8, 0.8);
    const coverMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.position.set(0.9, 0, 0);
    joint3Group.add(cover);

    // Cable
    const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 1);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.set(0.5, -0.5, 0);
    joint3Group.add(cable);

    // Tool/End Effector
    const toolGeo = new THREE.ConeGeometry(0.3, 1, 16);
    const toolMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const tool = new THREE.Mesh(toolGeo, toolMat);
    tool.position.y = 0.8;
    joint3Group.add(tool);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Base rotation
      joint1.rotation.y = currentState.robotAngle * (Math.PI / 180);

      // Idle animation if power is on
      if (!currentState.isPowerOff && currentState.isCalibrated) {
        const time = Date.now() * 0.001;
        joint2.rotation.z = Math.sin(time) * 0.2;
        joint3Group.rotation.x = Math.cos(time * 1.5) * 0.2;
      } else {
        // Reset to neutral if power off or not calibrated
        joint2.rotation.z = THREE.MathUtils.lerp(joint2.rotation.z, 0, 0.1);
        joint3Group.rotation.x = THREE.MathUtils.lerp(joint3Group.rotation.x, 0, 0.1);
      }

      // Visibility based on state
      cover.visible = !currentState.isCoverRemoved || currentState.isCoverInstalled;
      cable.visible = !currentState.isCableDisconnected || currentState.isCableConnected;
      
      if (currentState.isMotorRemoved && !currentState.isNewMotorInstalled) {
        motor.visible = false;
      } else {
        motor.visible = true;
        // Highlight new motor
        if (currentState.isNewMotorInstalled && !currentState.isCoverInstalled) {
            motorMat.color.setHex(0x3b82f6); // Blue highlight for new motor
        } else {
            motorMat.color.setHex(0x334155);
        }
      }

      // Animate parts moving away
      if (currentState.isCoverRemoved && !currentState.isCoverInstalled) {
        cover.position.x = THREE.MathUtils.lerp(cover.position.x, 2, 0.1);
        cover.material.opacity = THREE.MathUtils.lerp(cover.material.opacity, 0, 0.1);
        cover.material.transparent = true;
      } else {
        cover.position.x = 0.9;
        cover.material.opacity = 1;
        cover.material.transparent = false;
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
