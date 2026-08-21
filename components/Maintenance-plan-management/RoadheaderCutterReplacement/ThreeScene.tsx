import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoadheaderCutterReplacementProps } from './three-types';

export const ThreeScene: React.FC<RoadheaderCutterReplacementProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0x00ffff, 2);
    spotLight.position.set(0, 20, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // Roadheader Arm
    const armGroup = new THREE.Group();
    const armGeo = new THREE.BoxGeometry(3, 3, 15);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.6, roughness: 0.4 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.z = -7.5;
    armGroup.add(arm);
    scene.add(armGroup);

    // Cutter Head (Rotating part)
    const cutterGroup = new THREE.Group();
    cutterGroup.position.z = 1;
    
    const headGeo = new THREE.SphereGeometry(3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.rotation.x = Math.PI / 2;
    cutterGroup.add(head);

    // Cutter Teeth
    const toothGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
    const toothMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.9, roughness: 0.1 });
    const teeth: THREE.Mesh[] = [];

    for (let i = 0; i < 40; i++) {
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      const phi = Math.acos(-1 + (2 * i) / 40);
      const theta = Math.sqrt(40 * Math.PI) * phi;
      
      tooth.position.setFromSphericalCoords(3, phi, theta);
      tooth.lookAt(0, 0, 0);
      tooth.rotateX(Math.PI / 2);
      
      if (tooth.position.z > 0) { // Only add teeth to the front half
        teeth.push(tooth);
        cutterGroup.add(tooth);
      }
    }

    armGroup.add(cutterGroup);

    // Rock face (Target)
    const rockGeo = new THREE.BoxGeometry(20, 15, 5);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.9 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(0, 0, 6);
    scene.add(rock);

    // Sparks (Particles)
    const sparkGeo = new THREE.BufferGeometry();
    const sparkCount = 100;
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVel = [];
    for(let i = 0; i < sparkCount; i++) {
      sparkPos[i*3] = 0;
      sparkPos[i*3+1] = 0;
      sparkPos[i*3+2] = 4;
      sparkVel.push({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        z: -Math.random() * 5
      });
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0xffaa00,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { cutterSpeed, wearLevel, isReplacing } = propsRef.current;

      if (isReplacing) {
        // Replacement mode: arm retracts, head detaches
        armGroup.position.z = Math.max(-5, armGroup.position.z - delta * 2);
        cutterGroup.position.y = Math.max(-5, cutterGroup.position.y - delta * 2);
        cutterGroup.rotation.z = 0;
        sparks.visible = false;
        
        // Highlight teeth for replacement
        teeth.forEach(t => t.material.color.setHex(0xff3300));
      } else {
        // Normal mode: arm extends, head rotates
        armGroup.position.z = Math.min(0, armGroup.position.z + delta * 2);
        cutterGroup.position.y = Math.min(0, cutterGroup.position.y + delta * 2);
        cutterGroup.rotation.z += cutterSpeed * delta;
        
        // Wear color effect
        const wearColor = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xff0000), wearLevel / 100);
        teeth.forEach(t => t.material.color.copy(wearColor));
        
        // Sparks animation
        sparks.visible = cutterSpeed > 0;
        const positions = sparkGeo.attributes.position.array as Float32Array;
        for(let i = 0; i < sparkCount; i++) {
          positions[i*3] += sparkVel[i].x * delta;
          positions[i*3+1] += sparkVel[i].y * delta;
          positions[i*3+2] += sparkVel[i].z * delta;
          
          // Reset spark
          if (Math.random() < 0.1) {
            positions[i*3] = (Math.random() - 0.5) * 4;
            positions[i*3+1] = (Math.random() - 0.5) * 4;
            positions[i*3+2] = 4;
          }
        }
        sparkGeo.attributes.position.needsUpdate = true;
        
        // Arm sweeping motion
        armGroup.rotation.y = Math.sin(time * 0.5) * 0.2;
        armGroup.rotation.x = Math.sin(time * 0.3) * 0.1;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      armGeo.dispose();
      armMat.dispose();
      headGeo.dispose();
      headMat.dispose();
      toothGeo.dispose();
      toothMat.dispose();
      rockGeo.dispose();
      rockMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
