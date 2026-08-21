import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { PowerModuleState } from './three-types';

interface ThreeSceneProps {
  state: PowerModuleState;
}

// 2026-08-21：新增励磁功率模块、散热器与母排的可旋转三维寿命场景。

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268);
    scene.fog = new THREE.FogExp2(0x315268, 0.025);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(10, 9, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.target.set(0, 0.8, 0);

    scene.add(new THREE.HemisphereLight(0xd9f3ff, 0x183247, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(7, 12, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const warmLight = new THREE.PointLight(0xffb24a, 22, 20);
    warmLight.position.set(-3, 4, 2);
    scene.add(warmLight);

    const group = new THREE.Group();
    scene.add(group);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.55, 8),
      new THREE.MeshStandardMaterial({ color: 0x8ca5b5, metalness: 0.75, roughness: 0.3 }),
    );
    base.position.y = -1.15;
    base.receiveShadow = true;
    group.add(base);

    const heatSinkMaterial = new THREE.MeshStandardMaterial({ color: 0x6f8797, metalness: 0.9, roughness: 0.25 });
    for (let index = -5; index <= 5; index += 1) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 7.2), heatSinkMaterial);
      fin.position.set(index, -0.35, 0);
      group.add(fin);
    }

    const moduleMaterials: THREE.MeshStandardMaterial[] = [];
    const moduleMeshes: THREE.Mesh[] = [];
    for (let row = 0; row < 2; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        const isRiskModule = row === 0 && column === 1;
        const material = new THREE.MeshStandardMaterial({
          color: isRiskModule ? 0xd68422 : 0x176e86,
          metalness: 0.35,
          roughness: 0.35,
          emissive: isRiskModule ? 0x7a2600 : 0x002a38,
          emissiveIntensity: isRiskModule ? 0.42 : 0.12,
        });
        moduleMaterials.push(material);
        const module = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.7, 2.35), material);
        module.position.set((column - 1) * 3.45, 0.45, (row - 0.5) * 3.2);
        module.castShadow = true;
        module.receiveShadow = true;
        group.add(module);
        moduleMeshes.push(module);

        const terminalMaterial = new THREE.MeshStandardMaterial({ color: 0xdba64d, metalness: 0.9, roughness: 0.2 });
        [-0.7, 0, 0.7].forEach(offset => {
          const terminal = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.6, 0.55), terminalMaterial);
          terminal.position.set(module.position.x + offset, 1.08, module.position.z);
          group.add(terminal);
        });
      }
    }

    const busbarMaterial = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.92, roughness: 0.18 });
    [-2.65, 2.65].forEach(z => {
      const busbar = new THREE.Mesh(new THREE.BoxGeometry(11, 0.22, 0.48), busbarMaterial);
      busbar.position.set(0, 1.5, z);
      group.add(busbar);
    });

    const grid = new THREE.GridHelper(28, 28, 0x7da4b8, 0x496d82);
    grid.position.y = -1.45;
    scene.add(grid);

    let frameId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const current = stateRef.current;
      const risk = Math.min(1, Math.max(0, current.agingFactor + current.thermalResistanceRise / 40));
      const riskMaterial = moduleMaterials[1];
      riskMaterial.color.setHSL(0.09 - risk * 0.08, 0.78, 0.48);
      riskMaterial.emissiveIntensity = 0.25 + risk * (0.45 + Math.sin(clock.getElapsedTime() * 2.4) * 0.08);
      moduleMeshes[1].scale.y = 1 + Math.min(0.08, current.thermalSwing / 1000);
      controls.update();
      renderer.render(scene, camera);
    };

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material.dispose());
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" />;
};
