import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CylinderHeadState } from './three-types';

interface ThreeSceneProps {
  state: CylinderHeadState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<CylinderHeadState>(state);

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
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Engine Block (Lower part)
    const blockGeo = new THREE.BoxGeometry(6, 4, 6);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.y = -2;
    scene.add(block);

    // Cylinder Liner (Inside block)
    const linerGeo = new THREE.CylinderGeometry(2, 2, 4.1, 32);
    const linerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const liner = new THREE.Mesh(linerGeo, linerMat);
    liner.position.y = -2;
    scene.add(liner);

    // Cylinder Head Group
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.5;
    
    // Main Head Body
    const headGeo = new THREE.CylinderGeometry(2.5, 2.5, 1.5, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    headGroup.add(head);

    // Valves (Exhaust/Intake)
    const valveGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
    const valveMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    const valve1 = new THREE.Mesh(valveGeo, valveMat);
    valve1.position.set(1, 0.5, 0);
    headGroup.add(valve1);
    const valve2 = new THREE.Mesh(valveGeo, valveMat);
    valve2.position.set(-1, 0.5, 0);
    headGroup.add(valve2);

    scene.add(headGroup);

    // Bolts
    const boltCount = 8;
    const bolts: THREE.Mesh[] = [];
    const boltGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 16);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    
    for (let i = 0; i < boltCount; i++) {
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      const angle = (i / boltCount) * Math.PI * 2;
      bolt.position.set(Math.cos(angle) * 2.2, 0.5, Math.sin(angle) * 2.2);
      scene.add(bolt); // Add to scene, not headGroup, so we can animate them independently
      bolts.push(bolt);
    }

    // Pipes (Cooling water, fuel)
    const pipeGroup = new THREE.Group();
    const pipeGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.5, 1, 0),
        new THREE.Vector3(4, 1, 0),
        new THREE.Vector3(4, -2, 0)
      ]),
      20, 0.15, 8, false
    );
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 }); // Blue for water
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipeGroup.add(pipe);

    const fuelPipeGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.5, 0),
        new THREE.Vector3(0, 3, 0),
        new THREE.Vector3(-3, 3, 0)
      ]),
      20, 0.1, 8, false
    );
    const fuelPipeMat = new THREE.MeshStandardMaterial({ color: 0xeab308 }); // Yellow for fuel
    const fuelPipe = new THREE.Mesh(fuelPipeGeo, fuelPipeMat);
    pipeGroup.add(fuelPipe);

    scene.add(pipeGroup);

    // Crane Hook (Visible when lifting)
    const hookGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5 });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    hook.position.set(0, 8, 0);
    scene.add(hook);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Animation logic based on step
      if (currentState.step === 0) {
        // Normal
        pipeGroup.position.x = THREE.MathUtils.lerp(pipeGroup.position.x, 0, 0.1);
        bolts.forEach(b => b.position.y = THREE.MathUtils.lerp(b.position.y, 0.5, 0.1));
        headGroup.position.y = THREE.MathUtils.lerp(headGroup.position.y, 0.5, 0.1);
        hook.position.y = THREE.MathUtils.lerp(hook.position.y, 8, 0.1);
      } else if (currentState.step === 1) {
        // Remove pipes
        pipeGroup.position.x = THREE.MathUtils.lerp(pipeGroup.position.x, 3, 0.05); // Move away
        bolts.forEach(b => b.position.y = THREE.MathUtils.lerp(b.position.y, 0.5, 0.1));
        headGroup.position.y = THREE.MathUtils.lerp(headGroup.position.y, 0.5, 0.1);
        hook.position.y = THREE.MathUtils.lerp(hook.position.y, 8, 0.1);
      } else if (currentState.step === 2) {
        // Loosen bolts
        pipeGroup.position.x = 3;
        bolts.forEach(b => b.position.y = THREE.MathUtils.lerp(b.position.y, 2, 0.05)); // Lift bolts
        headGroup.position.y = THREE.MathUtils.lerp(headGroup.position.y, 0.5, 0.1);
        hook.position.y = THREE.MathUtils.lerp(hook.position.y, 4, 0.05); // Lower hook
      } else if (currentState.step === 3) {
        // Lift head
        pipeGroup.position.x = 3;
        bolts.forEach(b => b.position.y = 2);
        hook.position.y = THREE.MathUtils.lerp(hook.position.y, 6, 0.05); // Lift hook
        headGroup.position.y = THREE.MathUtils.lerp(headGroup.position.y, 4.5, 0.05); // Lift head with hook
      } else if (currentState.step === 4) {
        // Inspect (Rotate head)
        pipeGroup.position.x = 3;
        bolts.forEach(b => b.position.y = 2);
        hook.position.y = 6;
        headGroup.position.y = 4.5;
        headGroup.rotation.y += 0.01; // Slowly rotate for inspection
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, Math.PI / 4, 0.05); // Tilt to see bottom
      }

      // Slowly rotate scene
      if (currentState.step < 4) {
        scene.rotation.y = Math.sin(Date.now() * 0.0002) * 0.2;
        headGroup.rotation.y = 0;
        headGroup.rotation.x = 0;
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
