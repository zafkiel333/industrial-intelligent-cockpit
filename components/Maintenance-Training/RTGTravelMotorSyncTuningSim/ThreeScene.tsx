import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RTGTravelState } from './three-types';

interface ThreeSceneProps {
  state: RTGTravelState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<RTGTravelState>(state);

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
    camera.position.set(0, 15, 20);
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

    // Ground (Container Yard)
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // RTG Crane Structure
    const rtgGroup = new THREE.Group();
    
    // Main Beam
    const beamGeo = new THREE.BoxGeometry(16, 1, 2);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.5 }); // Yellow
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 8;
    rtgGroup.add(beam);

    // Left Leg
    const legGeo = new THREE.BoxGeometry(1, 8, 2);
    const leftLeg = new THREE.Mesh(legGeo, beamMat);
    leftLeg.position.set(-7.5, 4, 0);
    rtgGroup.add(leftLeg);

    // Right Leg
    const rightLeg = new THREE.Mesh(legGeo, beamMat);
    rightLeg.position.set(7.5, 4, 0);
    rtgGroup.add(rightLeg);

    // Wheels (Left side)
    const wheelGeo = new THREE.CylinderGeometry(1, 1, 0.5, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    
    const lWheel1 = new THREE.Mesh(wheelGeo, wheelMat);
    lWheel1.rotation.z = Math.PI / 2;
    lWheel1.position.set(-7.5, 1, 1.5);
    rtgGroup.add(lWheel1);
    
    const lWheel2 = new THREE.Mesh(wheelGeo, wheelMat);
    lWheel2.rotation.z = Math.PI / 2;
    lWheel2.position.set(-7.5, 1, -1.5);
    rtgGroup.add(lWheel2);

    // Wheels (Right side)
    const rWheel1 = new THREE.Mesh(wheelGeo, wheelMat);
    rWheel1.rotation.z = Math.PI / 2;
    rWheel1.position.set(7.5, 1, 1.5);
    rtgGroup.add(rWheel1);
    
    const rWheel2 = new THREE.Mesh(wheelGeo, wheelMat);
    rWheel2.rotation.z = Math.PI / 2;
    rWheel2.position.set(7.5, 1, -1.5);
    rtgGroup.add(rWheel2);

    scene.add(rtgGroup);

    // Track lines
    const trackGeo = new THREE.BoxGeometry(0.2, 0.1, 40);
    const trackMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const lTrack = new THREE.Mesh(trackGeo, trackMat);
    lTrack.position.set(-7.5, 0.05, 0);
    scene.add(lTrack);
    const rTrack = new THREE.Mesh(trackGeo, trackMat);
    rTrack.position.set(7.5, 0.05, 0);
    scene.add(rTrack);

    let animationFrameId: number;
    let currentZ = 0;
    let currentAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Calculate movement based on speeds
      const speedL = currentState.speedLeft * 0.001;
      const speedR = currentState.speedRight * 0.001;
      
      const avgSpeed = (speedL + speedR) / 2;
      const turnSpeed = (speedL - speedR) * 0.05; // Difference causes turning/skewing

      currentZ -= avgSpeed;
      if (currentZ < -15) currentZ = 15; // Loop back
      
      currentAngle += turnSpeed;
      // Limit skew angle visually
      currentAngle = Math.max(-Math.PI/8, Math.min(Math.PI/8, currentAngle));

      // Apply to RTG
      rtgGroup.position.z = currentZ;
      rtgGroup.rotation.y = currentAngle;

      // Rotate wheels
      lWheel1.rotation.x -= speedL * 2;
      lWheel2.rotation.x -= speedL * 2;
      rWheel1.rotation.x -= speedR * 2;
      rWheel2.rotation.x -= speedR * 2;

      // Camera follow slightly
      camera.position.z = currentZ + 20;
      camera.lookAt(0, 0, currentZ);

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
