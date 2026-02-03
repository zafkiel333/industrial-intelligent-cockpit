
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CollaborationSceneProps, NetworkNode, DataLink } from './three-types';

export const ShipShoreThreeScene: React.FC<CollaborationSceneProps> = ({ activeLinkId, onLinkSelect, globalTraffic = 1 }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: NetworkNode[] = [
    { id: 'shore-hq', type: 'shore', name: 'Global Support HQ', position: [0, 0, 0], status: 'online' },
    { id: 'sat-01', type: 'satellite', name: 'SAT-LEO-1', position: [-8, 12, -8], status: 'online' },
    { id: 'sat-02', type: 'satellite', name: 'SAT-GEO-2', position: [8, 15, 5], status: 'online' },
    { id: 'ship-01', type: 'ship', name: 'COSCO STAR', position: [-12, 0, 8], status: 'online', connectionType: 'VSAT' },
    { id: 'ship-02', type: 'ship', name: 'EVER GIVEN', position: [10, 0, 12], status: 'syncing', connectionType: '5G' },
    { id: 'ship-03', type: 'ship', name: 'MSC GULSUN', position: [5, 0, -10], status: 'online', connectionType: 'VSAT' },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 25, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Cosmic Lighting
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x22d3ee, 5, 100);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);

    // Digital Ocean Grid
    const gridGeo = new THREE.PlaneGeometry(100, 100, 40, 40);
    const gridMat = new THREE.MeshBasicMaterial({ 
      color: 0x1e3a8a, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15 
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    scene.add(grid);

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeMeshes: THREE.Mesh[] = [];
    const linkLines: THREE.Line[] = [];
    const packets: THREE.Mesh[] = [];

    // Create Nodes
    nodes.forEach(node => {
      const group = new THREE.Group();
      group.position.set(...node.position);

      let geo, mat;
      if (node.type === 'shore') {
        // Shore HQ: Tower
        geo = new THREE.CylinderGeometry(0, 2, 6, 4);
        mat = new THREE.MeshPhongMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.8, wireframe: true });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.5, 32), new THREE.MeshBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.5 }));
        group.add(base);
      } else if (node.type === 'satellite') {
        // Satellite: Sphere with wings
        geo = new THREE.IcosahedronGeometry(1, 1);
        mat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true });
        const wings = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 1), new THREE.MeshBasicMaterial({ color: 0xca8a04 }));
        group.add(wings);
      } else {
        // Ship: Tetrahedron
        geo = new THREE.ConeGeometry(1, 2, 3);
        mat = new THREE.MeshPhongMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.5 });
        group.rotation.x = Math.PI / 2; // Lay flat
        group.rotation.z = Math.PI; // Point forward
        
        // Ripple ring
        const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.6, 16), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 }));
        ring.rotation.x = -Math.PI/2;
        group.add(ring);
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { id: node.id, type: node.type };
      group.add(mesh);
      nodeMeshes.push(mesh);
      nodeGroup.add(group);
    });

    // Determine Links (Ship -> Sat, Sat -> Shore)
    const links: {start: THREE.Vector3, end: THREE.Vector3, type: string}[] = [];
    const ships = nodes.filter(n => n.type === 'ship');
    const sats = nodes.filter(n => n.type === 'satellite');
    const shore = nodes.find(n => n.type === 'shore');

    if (shore) {
        // Sat -> Shore
        sats.forEach(sat => {
            links.push({ start: new THREE.Vector3(...sat.position), end: new THREE.Vector3(...shore.position), type: 'backhaul' });
        });
        // Ship -> Sat (Find closest)
        ships.forEach(ship => {
            const shipPos = new THREE.Vector3(...ship.position);
            // Simple logic: connect to first sat for visual
            const satPos = new THREE.Vector3(...sats[0].position);
            links.push({ start: shipPos, end: satPos, type: 'uplink' });
        });
    }

    // Draw Links & Packets
    links.forEach(link => {
        const points = [link.start, link.end];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineDashedMaterial({ 
            color: link.type === 'backhaul' ? 0x3b82f6 : 0x22d3ee, 
            dashSize: 1, 
            gapSize: 0.5,
            opacity: 0.4,
            transparent: true
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        scene.add(line);
        linkLines.push(line);

        // Data Packets
        const packetCount = 3;
        for(let i=0; i<packetCount; i++) {
            const pGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const p = new THREE.Mesh(pGeo, pMat);
            p.userData = { start: link.start, end: link.end, progress: i / packetCount, speed: 0.01 + Math.random()*0.01 };
            scene.add(p);
            packets.push(p);
        }
    });

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Rotate Satellites
      nodeGroup.children.forEach(group => {
          const mesh = group.children[0] as THREE.Mesh;
          if (mesh.userData.type === 'satellite') {
              group.position.x = Math.sin(time * 0.2 + parseInt(mesh.userData.id.slice(-1))) * 15;
              group.position.z = Math.cos(time * 0.2 + parseInt(mesh.userData.id.slice(-1))) * 15;
              group.lookAt(0,0,0);
          }
          if (mesh.userData.type === 'ship') {
              // Bobbing
              group.position.y = Math.sin(time * 2 + parseInt(mesh.userData.id.slice(-1))) * 0.2;
          }
      });

      // Move Packets
      packets.forEach(p => {
          p.userData.progress += p.userData.speed * globalTraffic;
          if (p.userData.progress > 1) p.userData.progress = 0;
          p.position.lerpVectors(p.userData.start, p.userData.end, p.userData.progress);
          p.rotation.x += 0.1;
          p.rotation.y += 0.1;
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
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [globalTraffic]);

  return <div ref={mountRef} className="w-full h-full relative cursor-move" />;
};
