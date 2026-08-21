import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ShipLoaderState } from './three-types';

interface ThreeSceneProps {
  state: ShipLoaderState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ShipLoaderState>(state);

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
    camera.position.set(0, 5, 20);
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

    // Boom (Support structure)
    const boomGeo = new THREE.BoxGeometry(10, 1, 2);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    boom.position.y = 5;
    scene.add(boom);

    // Chute (The part that tilts)
    const chuteGroup = new THREE.Group();
    chuteGroup.position.set(0, 4, 0); // Pivot point
    scene.add(chuteGroup);

    const chuteGeo = new THREE.CylinderGeometry(1, 0.5, 6, 16);
    const chuteMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.4 }); // Yellow
    const chute = new THREE.Mesh(chuteGeo, chuteMat);
    chute.position.y = -3; // Hang down from pivot
    chuteGroup.add(chute);

    // Ropes (Left and Right)
    const ropeMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
    
    const ropeLeftGeo = new THREE.BufferGeometry();
    const ropeLeft = new THREE.Line(ropeLeftGeo, ropeMat);
    scene.add(ropeLeft);

    const ropeRightGeo = new THREE.BufferGeometry();
    const ropeRight = new THREE.Line(ropeRightGeo, ropeMat);
    scene.add(ropeRight);

    // Winch Drums (Visual representation on boom)
    const drumGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    
    const drumLeft = new THREE.Mesh(drumGeo, drumMat);
    drumLeft.rotation.x = Math.PI / 2;
    drumLeft.position.set(-4, 5.5, 0);
    scene.add(drumLeft);

    const drumRight = new THREE.Mesh(drumGeo, drumMat);
    drumRight.rotation.x = Math.PI / 2;
    drumRight.position.set(4, 5.5, 0);
    scene.add(drumRight);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update Chute Angle
      chuteGroup.rotation.z = currentState.chuteAngle * (Math.PI / 180);

      // Calculate attachment points on the chute
      const attachLeft = new THREE.Vector3(-1, -2, 0); // Local to chuteGroup
      const attachRight = new THREE.Vector3(1, -2, 0);
      
      attachLeft.applyMatrix4(chuteGroup.matrixWorld);
      attachRight.applyMatrix4(chuteGroup.matrixWorld);

      // Update Ropes
      ropeLeftGeo.setFromPoints([drumLeft.position, attachLeft]);
      ropeRightGeo.setFromPoints([drumRight.position, attachRight]);

      // Visual feedback for tension (color change if unbalanced)
      if (!currentState.isBalanced) {
        if (currentState.ropeTensionLeft > currentState.ropeTensionRight + 10) {
           ropeMat.color.setHex(0xef4444); // Red if too tight
        } else if (currentState.ropeTensionRight > currentState.ropeTensionLeft + 10) {
           ropeMat.color.setHex(0xef4444);
        } else {
           ropeMat.color.setHex(0x94a3b8);
        }
      } else {
        ropeMat.color.setHex(0x22c55e); // Green if balanced
      }

      // Rotate drums if motor running
      if (currentState.motorRunning) {
        const speed = 0.1;
        if (currentState.motorDirection === 'left') {
           drumLeft.rotation.y += speed;
           drumRight.rotation.y -= speed;
        } else if (currentState.motorDirection === 'right') {
           drumLeft.rotation.y -= speed;
           drumRight.rotation.y += speed;
        }
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
