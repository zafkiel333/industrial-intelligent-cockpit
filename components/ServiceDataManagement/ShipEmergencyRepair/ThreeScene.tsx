
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RepairSceneProps, IncidentMarker } from './three-types';

export const ShipEmergencyRepairThreeScene: React.FC<RepairSceneProps> = ({ activeIncidentId, onIncidentSelect, alertLevel = 1 }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const incidents: IncidentMarker[] = [
    { id: 'inc-01', position: [-5, 0, 0], type: 'mechanical', severity: 'critical', label: '主机连杆断裂风险' },
    { id: 'inc-02', position: [8, 2, -3], type: 'electrical', severity: 'high', label: '辅机配电板高温' },
    { id: 'inc-03', position: [12, -2, 0], type: 'leak', severity: 'medium', label: '艉轴密封泄漏' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0505, 0.02); // Reddish fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 30);

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
    controls.autoRotateSpeed = 0.2;

    // Emergency Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const redLight = new THREE.PointLight(0xff0000, 5, 50);
    redLight.position.set(0, 10, 0);
    scene.add(redLight);
    const blueLight = new THREE.PointLight(0x0000ff, 3, 50);
    blueLight.position.set(10, -5, 10);
    scene.add(blueLight);

    // Ship Group
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // Wireframe Ship Hull
    const hullGeo = new THREE.BoxGeometry(30, 6, 8, 10, 2, 2);
    const wireframeGeo = new THREE.WireframeGeometry(hullGeo);
    const hullMat = new THREE.LineBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.3 });
    const hull = new THREE.LineSegments(wireframeGeo, hullMat);
    shipGroup.add(hull);

    // Bridge
    const bridgeGeo = new THREE.BoxGeometry(6, 5, 6);
    const bridgeWire = new THREE.WireframeGeometry(bridgeGeo);
    const bridge = new THREE.LineSegments(bridgeWire, hullMat);
    bridge.position.set(-10, 5.5, 0);
    shipGroup.add(bridge);

    // Incident Markers
    const markers: THREE.Mesh[] = [];
    const pulseRings: THREE.Mesh[] = [];

    incidents.forEach(inc => {
        const markerGroup = new THREE.Group();
        markerGroup.position.set(...inc.position);

        const color = inc.severity === 'critical' ? 0xff0000 : inc.severity === 'high' ? 0xffaa00 : 0x00aaff;
        
        // Core
        const coreGeo = new THREE.OctahedronGeometry(0.8, 0);
        const coreMat = new THREE.MeshBasicMaterial({ color, wireframe: true });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.userData = { id: inc.id };
        markerGroup.add(core);
        markers.push(core);

        // Warning Sphere (Transparent shell)
        const shellGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const shellMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, wireframe: true });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        markerGroup.add(shell);

        // Expanding Ring (Pulse)
        const ringGeo = new THREE.RingGeometry(1.5, 1.6, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData = { speed: Math.random() * 0.05 + 0.02, offset: Math.random() };
        markerGroup.add(ring);
        pulseRings.push(ring);

        // Connector Line to Hull Center
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0, -inc.position[1], 0)]);
        const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5, dashSize: 0.2, gapSize: 0.1 });
        const line = new THREE.Line(lineGeo, lineMat);
        markerGroup.add(line);

        shipGroup.add(markerGroup);
    });

    // Scan Line Effect
    const scanPlaneGeo = new THREE.PlaneGeometry(10, 10);
    const scanPlaneMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        transparent: true, 
        opacity: 0.1, 
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending 
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    scanPlane.rotation.y = Math.PI / 2;
    scene.add(scanPlane);

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

      // Pulse Animations
      pulseRings.forEach(ring => {
          const s = (Math.sin(time * 5 * alertLevel + ring.userData.offset) + 1) * 0.5 + 1;
          ring.scale.set(s, s, s);
          ring.lookAt(camera.position); // Billboard effect
          (ring.material as THREE.MeshBasicMaterial).opacity = 1 - (s - 1);
      });

      // Markers Rotate
      markers.forEach(m => {
          m.rotation.y += 0.02;
          m.rotation.z += 0.01;
          if (m.userData.id === activeIncidentId) {
              m.scale.setScalar(1.5);
          } else {
              m.scale.setScalar(1);
          }
      });

      // Scan Line Movement
      scanPlane.position.x = Math.sin(time) * 15;

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
  }, [activeIncidentId, alertLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
