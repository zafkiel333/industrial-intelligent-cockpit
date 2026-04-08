import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WiringState } from './three-types';

interface ThreeSceneProps {
  state: WiringState;
  onTerminalClick: (id: string) => void;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state, onTerminalClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<WiringState>(state);
  const onTerminalClickRef = useRef(onTerminalClick);

  useEffect(() => {
    stateRef.current = state;
    onTerminalClickRef.current = onTerminalClick;
  }, [state, onTerminalClick]);

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
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 10);
    scene.add(dirLight);

    // Cabinet Backplate
    const plateGeo = new THREE.PlaneGeometry(8, 6);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.2, roughness: 0.8 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    scene.add(plate);

    // DIN Rail
    const railGeo = new THREE.BoxGeometry(7, 0.4, 0.2);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.4 });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, 0, 0.1);
    scene.add(rail);

    // Terminals
    const terminals: { mesh: THREE.Mesh, id: string }[] = [];
    const terminalGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const terminalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.1, roughness: 0.9 });
    const screwGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
    const screwMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

    const terminalIds = ['X1-1', 'X1-2', 'X1-3', 'X1-4', 'X2-1', 'X2-2'];
    const startX = -2.5;

    terminalIds.forEach((id, index) => {
      const group = new THREE.Group();
      
      const block = new THREE.Mesh(terminalGeo, terminalMat.clone());
      group.add(block);

      const screwTop = new THREE.Mesh(screwGeo, screwMat);
      screwTop.position.set(0, 0.4, 0.2);
      screwTop.rotation.x = Math.PI / 2;
      group.add(screwTop);

      const screwBottom = new THREE.Mesh(screwGeo, screwMat);
      screwBottom.position.set(0, -0.4, 0.2);
      screwBottom.rotation.x = Math.PI / 2;
      group.add(screwBottom);

      group.position.set(startX + index * 0.5, 0, 0.3);
      
      // Store reference for raycasting
      block.userData = { id, isTerminal: true };
      terminals.push({ mesh: block, id });
      
      scene.add(group);
    });

    // Wires
    const createWire = (start: THREE.Vector3, end: THREE.Vector3, color: number) => {
      const points = [];
      points.push(start);
      points.push(new THREE.Vector3(start.x, start.y + 1, start.z));
      points.push(new THREE.Vector3(end.x, end.y + 1, end.z));
      points.push(end);
      
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      const wire = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(wire);
      return wire;
    };

    // Add some visual wires
    createWire(new THREE.Vector3(-2.5, 0.4, 0.5), new THREE.Vector3(-2.0, 0.4, 0.5), 0xef4444); // Red wire X1-1 to X1-2
    createWire(new THREE.Vector3(-1.5, 0.4, 0.5), new THREE.Vector3(-1.0, 0.4, 0.5), 0x3b82f6); // Blue wire X1-3 to X1-4

    // Probes (Red and Black)
    const probeGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 16);
    const redProbeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const blackProbeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    
    const redProbe = new THREE.Mesh(probeGeo, redProbeMat);
    const blackProbe = new THREE.Mesh(probeGeo, blackProbeMat);
    
    // Initially hide probes
    redProbe.visible = false;
    blackProbe.visible = false;
    
    scene.add(redProbe);
    scene.add(blackProbe);

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object;
        if (obj.userData.isTerminal) {
          onTerminalClickRef.current(obj.userData.id);
          break;
        }
      }
    };

    mountRef.current.addEventListener('click', onMouseClick);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Update terminal highlights
      terminals.forEach(t => {
        const mat = t.mesh.material as THREE.MeshStandardMaterial;
        if (t.id === currentState.probes.red) {
          mat.emissive.setHex(0xef4444);
          mat.emissiveIntensity = 0.5;
          // Move red probe
          redProbe.visible = true;
          redProbe.position.copy(t.mesh.parent!.position);
          redProbe.position.z += 0.5;
          redProbe.position.y -= 0.5;
          redProbe.rotation.z = Math.PI / 6;
        } else if (t.id === currentState.probes.black) {
          mat.emissive.setHex(0x38bdf8);
          mat.emissiveIntensity = 0.5;
          // Move black probe
          blackProbe.visible = true;
          blackProbe.position.copy(t.mesh.parent!.position);
          blackProbe.position.z += 0.5;
          blackProbe.position.y -= 0.5;
          blackProbe.rotation.z = -Math.PI / 6;
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      });

      if (!currentState.probes.red) redProbe.visible = false;
      if (!currentState.probes.black) blackProbe.visible = false;

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
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onMouseClick);
      }
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
