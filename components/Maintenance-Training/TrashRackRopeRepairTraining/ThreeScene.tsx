import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RopeState } from './three-types';

interface ThreeSceneProps {
  state: RopeState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<RopeState>(state);

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
    camera.position.set(10, 8, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Water Surface
    const waterGeo = new THREE.PlaneGeometry(20, 20);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.6, roughness: 0.1 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    scene.add(water);

    // Trash Rack (Grid)
    const rackGeo = new THREE.BoxGeometry(8, 6, 0.2);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x475569, wireframe: true });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, -1, -2);
    scene.add(rack);

    // Gantry Crane Structure
    const craneGroup = new THREE.Group();
    
    const beamGeo = new THREE.BoxGeometry(10, 0.5, 1);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.5 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 5;
    craneGroup.add(beam);

    const legGeo = new THREE.BoxGeometry(0.5, 8, 1);
    const legL = new THREE.Mesh(legGeo, beamMat);
    legL.position.set(-4.5, 1, 0);
    craneGroup.add(legL);
    
    const legR = new THREE.Mesh(legGeo, beamMat);
    legR.position.set(4.5, 1, 0);
    craneGroup.add(legR);

    // Hoist Trolley
    const trolleyGeo = new THREE.BoxGeometry(1.5, 1, 1.5);
    const trolleyMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const trolley = new THREE.Mesh(trolleyGeo, trolleyMat);
    trolley.position.y = 4.5;
    craneGroup.add(trolley);

    // Ropes and Grab
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const ropeL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), ropeMat);
    const ropeR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), ropeMat);
    
    const grabGeo = new THREE.BoxGeometry(2, 1, 1);
    const grabMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const grab = new THREE.Mesh(grabGeo, grabMat);

    scene.add(craneGroup);
    scene.add(ropeL);
    scene.add(ropeR);
    scene.add(grab);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Water animation
      water.position.y = -2 + Math.sin(Date.now() * 0.001) * 0.1;

      // Calculate hoist position (0 to 100 -> y=4 to y=-1)
      const targetY = 4 - (currentState.hoistPos / 100) * 5;
      const ropeLength = 4.5 - targetY;

      if (currentState.isBroken) {
        // Broken state: Right rope snapped, grab hanging from left
        ropeL.geometry.dispose();
        ropeL.geometry = new THREE.CylinderGeometry(0.05, 0.05, ropeLength);
        ropeL.position.set(-0.5, 4.5 - ropeLength / 2, 0);

        ropeR.geometry.dispose();
        ropeR.geometry = new THREE.CylinderGeometry(0.05, 0.05, 1); // Short broken piece
        ropeR.position.set(0.5, 4, 0);

        grab.position.set(-0.5, targetY - 0.5, 0);
        grab.rotation.z = Math.PI / 6; // Hanging crooked
      } else {
        // Normal/Repaired state
        ropeL.geometry.dispose();
        ropeL.geometry = new THREE.CylinderGeometry(0.05, 0.05, ropeLength);
        ropeL.position.set(-0.5, 4.5 - ropeLength / 2, 0);

        ropeR.geometry.dispose();
        ropeR.geometry = new THREE.CylinderGeometry(0.05, 0.05, ropeLength);
        ropeR.position.set(0.5, 4.5 - ropeLength / 2, 0);

        grab.position.set(0, targetY - 0.5, 0);
        grab.rotation.z = 0;
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
