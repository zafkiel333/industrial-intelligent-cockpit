import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { PressureVesselState } from './three-types';

interface ThreeSceneProps {
  state: PressureVesselState;
}

// 2026-08-21：新增压力容器壳体、焊缝与疲劳风险带三维场景。

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
    scene.fog = new THREE.FogExp2(0x315268, 0.026);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(11, 7, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 0.6, 0);

    scene.add(new THREE.HemisphereLight(0xe4f6ff, 0x10283b, 2.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(9, 12, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const warningLight = new THREE.PointLight(0xff9a35, 10, 18);
    warningLight.position.set(-3, 3, 5);
    scene.add(warningLight);

    const vesselGroup = new THREE.Group();
    vesselGroup.rotation.z = Math.PI / 2;
    vesselGroup.position.y = 0.5;
    scene.add(vesselGroup);

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c8196,
      metalness: 0.82,
      roughness: 0.26,
    });
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 9, 64), shellMaterial);
    shell.castShadow = true;
    shell.receiveShadow = true;
    vesselGroup.add(shell);

    const capMaterial = new THREE.MeshStandardMaterial({ color: 0x226b80, metalness: 0.85, roughness: 0.25 });
    [-4.5, 4.5].forEach(y => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(3, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), capMaterial);
      cap.scale.y = 0.72;
      cap.position.y = y;
      cap.rotation.x = y < 0 ? Math.PI : 0;
      vesselGroup.add(cap);
    });

    const weldMaterial = new THREE.MeshStandardMaterial({ color: 0x9fb4bf, metalness: 0.95, roughness: 0.18 });
    [-3.2, 0, 3.2].forEach(y => {
      const weld = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.09, 12, 64), weldMaterial);
      weld.rotation.x = Math.PI / 2;
      weld.position.y = y;
      vesselGroup.add(weld);
    });

    const riskMaterial = new THREE.MeshStandardMaterial({
      color: 0xe18b2c,
      emissive: 0x6d2300,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.35,
    });
    const riskBand = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.16, 16, 64), riskMaterial);
    riskBand.rotation.x = Math.PI / 2;
    riskBand.position.y = 3.2;
    vesselGroup.add(riskBand);

    const nozzleMaterial = new THREE.MeshStandardMaterial({ color: 0x8fa7b5, metalness: 0.9, roughness: 0.22 });
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.3, 28), nozzleMaterial);
    nozzle.position.set(0, 0, 4.05);
    nozzle.rotation.x = Math.PI / 2;
    vesselGroup.add(nozzle);

    const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x5c7484, metalness: 0.7, roughness: 0.35 });
    [-2.8, 2.8].forEach(x => {
      const support = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.4, 4.6), supportMaterial);
      support.position.set(x, -2.5, 0);
      scene.add(support);
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 7), supportMaterial);
    base.position.y = -3.8;
    base.receiveShadow = true;
    scene.add(base);

    const grid = new THREE.GridHelper(28, 28, 0x7da4b8, 0x496d82);
    grid.position.y = -4.05;
    scene.add(grid);

    let frameId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const current = stateRef.current;
      const risk = Math.min(1, Math.max(0, current.fatigueUsage));
      riskMaterial.color.setHSL(0.1 - risk * 0.09, 0.82, 0.49);
      riskMaterial.emissiveIntensity = 0.25 + risk * (0.42 + Math.sin(clock.getElapsedTime() * 2.2) * 0.08);
      warningLight.intensity = 6 + current.acousticEvents * 1.5;
      shell.scale.x = shell.scale.z = 1 + Math.min(0.012, current.pressure / 1000);
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
