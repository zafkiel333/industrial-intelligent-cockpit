
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { IncidentSceneProps, IncidentPoint } from './three-types';

export const HydroIncidentThreeScene: React.FC<IncidentSceneProps> = ({ 
  activeIncidentId, onIncidentSelect, isReplaying, playbackTime 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const incidents: IncidentPoint[] = [
    { id: 'inc-shear-pin', name: '剪断销断裂', type: 'mechanical', position: [4, -2, 2], severity: 1.0, description: '导叶连杆机构过载' },
    { id: 'inc-bearing', name: '推力瓦烧损', type: 'thermal', position: [0, 2, 0], severity: 0.8, description: '油膜破裂导致金属接触' },
    { id: 'inc-stator', name: '定子匝间短路', type: 'electrical', position: [-3, 5, -3], severity: 0.9, description: '绝缘击穿引发局部过热' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050000, 0.02); // Dark red fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting: Dramatic / Warning style
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const redLight = new THREE.PointLight(0xff0000, 5, 50); // Warning light
    redLight.position.set(10, 10, 10);
    scene.add(redLight);
    const blueLight = new THREE.PointLight(0x0000ff, 2, 50); // Cool contrast
    blueLight.position.set(-10, -10, -10);
    scene.add(blueLight);

    // Group for the machine
    const machineGroup = new THREE.Group();
    scene.add(machineGroup);

    // --- Wireframe "Blueprint" Style Hydro Unit ---
    
    // Stator
    const statorGeo = new THREE.CylinderGeometry(5, 5, 4, 32, 2, true);
    const statorWire = new THREE.WireframeGeometry(statorGeo);
    const stator = new THREE.LineSegments(statorWire, new THREE.LineBasicMaterial({ color: 0x334155, opacity: 0.3, transparent: true }));
    stator.position.y = 4;
    machineGroup.add(stator);

    // Rotor (Solid but ghosted)
    const rotorGeo = new THREE.CylinderGeometry(4, 4, 3.5, 16);
    const rotorMat = new THREE.MeshBasicMaterial({ 
        color: 0x1e293b, 
        wireframe: true,
        transparent: true, 
        opacity: 0.1 
    });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.y = 4;
    machineGroup.add(rotor);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 16);
    const shaftMat = new THREE.MeshPhongMaterial({ color: 0x475569 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 0;
    machineGroup.add(shaft);

    // Turbine Runner
    const runnerGeo = new THREE.TorusGeometry(3.5, 1, 16, 32);
    const runnerMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.2 });
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    runner.rotation.x = Math.PI / 2;
    runner.position.y = -5;
    machineGroup.add(runner);

    // Incident Markers
    const markers: THREE.Mesh[] = [];
    const pulseWaves: THREE.Mesh[] = [];

    incidents.forEach(inc => {
        const markerGroup = new THREE.Group();
        markerGroup.position.set(...inc.position);

        const color = inc.id === activeIncidentId ? 0xff0000 : 0xffaa00;

        // Core Point
        const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
        const coreMat = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.userData = { id: inc.id };
        markerGroup.add(core);
        markers.push(core);

        // Alert Icon (Billboard) - Simplified as a plane
        // In a real app, use Sprite with icon texture
        
        // Pulse Wave (Expanding Sphere)
        const waveGeo = new THREE.SphereGeometry(0.6, 16, 16);
        const waveMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5, wireframe: true });
        const wave = new THREE.Mesh(waveGeo, waveMat);
        wave.userData = { speed: inc.severity * 0.1, scale: 1 };
        markerGroup.add(wave);
        pulseWaves.push(wave);

        // Connection Line to Center
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(-inc.position[0], -inc.position[1] + 4, -inc.position[2])]); // rough center
        const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.2 });
        const line = new THREE.Line(lineGeo, lineMat);
        markerGroup.add(line);

        machineGroup.add(markerGroup);
    });

    // Floor Grid (Holographic)
    const gridHelper = new THREE.GridHelper(50, 50, 0xef4444, 0x110000);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers);
      if (intersects.length > 0) {
        onIncidentSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Shaft rotation - Speed depends on 'playback' if recreating the failure
      // Normal speed -> High Vibration -> Stop
      let rotSpeed = 0.1;
      if (isReplaying) {
          if (playbackTime < 0.8) rotSpeed = 0.1 + Math.sin(time * 20) * 0.05 * playbackTime; // Vibrating
          else rotSpeed = Math.max(0, 0.1 - (playbackTime - 0.8) * 2); // Stopping
      }

      shaft.rotation.y += rotSpeed;
      rotor.rotation.y += rotSpeed;
      runner.rotation.z += rotSpeed; // Torus rotated X, so Z rotates around world Y axis local

      // Vibration Effect on whole group
      if (isReplaying && playbackTime > 0.5 && playbackTime < 0.9) {
          machineGroup.position.x = (Math.random() - 0.5) * 0.1;
          machineGroup.position.z = (Math.random() - 0.5) * 0.1;
      } else {
          machineGroup.position.set(0, 0, 0);
      }

      // Pulse Animation
      pulseWaves.forEach(w => {
          w.scale.multiplyScalar(1.02);
          (w.material as THREE.MeshBasicMaterial).opacity *= 0.96;
          if (w.scale.x > 5) {
              w.scale.set(1, 1, 1);
              (w.material as THREE.MeshBasicMaterial).opacity = 0.5;
          }
      });

      // Highlight Active
      markers.forEach(m => {
          m.rotation.x += 0.02;
          m.rotation.y += 0.03;
          if (m.userData.id === activeIncidentId) {
             m.scale.setScalar(1.5 + Math.sin(time * 5) * 0.2);
          } else {
             m.scale.setScalar(1);
          }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activeIncidentId, isReplaying, playbackTime]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
