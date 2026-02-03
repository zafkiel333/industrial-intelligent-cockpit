
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PortMapAnimatables, PortNode } from './three-types';

interface ThreeSceneProps {
  progress?: number; // 0-1 voyage progress
  riskAccumulation?: number; // 0-1
  selectedPort?: string;
}

const PORTS: PortNode[] = [
  { id: 'SHA', name: 'Shanghai (Dep)', lat: 31.23, lon: 121.47, type: 'Major', capabilities: ['Full'] },
  { id: 'SIN', name: 'Singapore', lat: 1.35, lon: 103.82, type: 'Major', capabilities: ['DryDock', 'Spares'] },
  { id: 'SUEZ', name: 'Suez Canal', lat: 29.97, lon: 32.55, type: 'Minor', capabilities: ['Emergency'] },
  { id: 'RTM', name: 'Rotterdam (Arr)', lat: 51.92, lon: 4.47, type: 'Major', capabilities: ['Full'] },
];

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  progress = 0.3,
  riskAccumulation = 0.2,
  selectedPort
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Helper to convert lat/lon to Vector3 on sphere
  const latLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(20, 10, 10);
    scene.add(sunLight);

    const dataLight = new THREE.PointLight(0x0ea5e9, 10, 50);
    dataLight.position.set(-10, 5, -5);
    scene.add(dataLight);

    const animatables: PortMapAnimatables = {};
    const disposables: any[] = [];
    const earthRadius = 6;

    // --- 1. The Globe (Wireframe Earth) ---
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    animatables.earthGroup = earthGroup;

    const earthGeo = new THREE.IcosahedronGeometry(earthRadius, 3);
    const earthMat = new THREE.MeshBasicMaterial({ 
        color: 0x1e3a8a, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);
    disposables.push(earthGeo, earthMat);

    // Inner core for depth
    const coreGeo = new THREE.SphereGeometry(earthRadius - 0.1, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    earthGroup.add(core);
    disposables.push(coreGeo, coreMat);

    // --- 2. Ports ---
    const portsGroup = new THREE.Group();
    earthGroup.add(portsGroup);
    animatables.portMarkers = portsGroup;

    const portGeo = new THREE.CylinderGeometry(0.1, 0, 0.8, 8);
    portGeo.rotateX(Math.PI / 2);
    
    PORTS.forEach(port => {
        const pos = latLonToVector3(port.lat, port.lon, earthRadius);
        const isSelected = port.id === selectedPort;
        const color = isSelected ? 0xf59e0b : (port.type === 'Major' ? 0x10b981 : 0x64748b);
        
        const mat = new THREE.MeshBasicMaterial({ color });
        const marker = new THREE.Mesh(portGeo, mat);
        marker.position.copy(pos);
        marker.lookAt(0, 0, 0);
        portsGroup.add(marker);

        // Name label (Simple ring for now)
        if (port.type === 'Major') {
            const ringGeo = new THREE.RingGeometry(0.2, 0.25, 16);
            const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.copy(pos.clone().multiplyScalar(1.02));
            ring.lookAt(0,0,0);
            portsGroup.add(ring);
            disposables.push(ringGeo, ringMat);
        }
        disposables.push(mat);
    });
    disposables.push(portGeo);

    // --- 3. Route Line (Bézier Curve on Sphere) ---
    // Simplified route points
    const routePoints = PORTS.map(p => latLonToVector3(p.lat, p.lon, earthRadius));
    const curve = new THREE.CatmullRomCurve3(routePoints);
    const points = curve.getPoints(100);
    const routeGeo = new THREE.BufferGeometry().setFromPoints(points);
    const routeMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6 });
    const routeLine = new THREE.Line(routeGeo, routeMat);
    earthGroup.add(routeLine);
    animatables.routeLine = routeLine;
    disposables.push(routeGeo, routeMat);

    // --- 4. Ship Marker ---
    const shipGeo = new THREE.ConeGeometry(0.15, 0.5, 8);
    shipGeo.rotateX(Math.PI / 2);
    const shipMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0x0ea5e9,
        emissiveIntensity: 1 
    });
    const ship = new THREE.Mesh(shipGeo, shipMat);
    earthGroup.add(ship);
    animatables.shipMarker = ship;
    disposables.push(shipGeo, shipMat);

    // --- 5. Risk Atmosphere (Red glow indicating accumulated risk) ---
    const riskGeo = new THREE.SphereGeometry(earthRadius + 0.5, 32, 32);
    const riskMat = new THREE.MeshBasicMaterial({ 
        color: 0xef4444, 
        transparent: true, 
        opacity: 0,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const riskSphere = new THREE.Mesh(riskGeo, riskMat);
    scene.add(riskSphere);
    animatables.riskAtmosphere = riskSphere;
    disposables.push(riskGeo, riskMat);

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Ship Movement along path
      if (animatables.shipMarker) {
          const point = curve.getPointAt(progress);
          const tangent = curve.getTangentAt(progress);
          animatables.shipMarker.position.copy(point);
          animatables.shipMarker.lookAt(point.clone().add(tangent));
          
          // Pulse effect
          animatables.shipMarker.scale.setScalar(1 + Math.sin(time * 5) * 0.2);
      }

      // Risk visualization
      if (animatables.riskAtmosphere) {
          animatables.riskAtmosphere.material.opacity = riskAccumulation * 0.15 * (0.8 + Math.sin(time * 2) * 0.2);
          animatables.riskAtmosphere.rotation.y -= 0.002;
      }

      // Route dashed effect
      // Not easily done with basic Line, simulating via color pulse
      routeMat.opacity = 0.4 + Math.sin(time * 3) * 0.2;

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
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [progress, riskAccumulation, selectedPort]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
