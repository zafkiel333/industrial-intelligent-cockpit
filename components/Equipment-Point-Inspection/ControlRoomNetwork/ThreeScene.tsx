import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ControlRoomNetworkProps } from './three-types';

export const ThreeScene: React.FC<ControlRoomNetworkProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617'); // slate-950
    scene.fog = new THREE.FogExp2('#020617', 0.02);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 20, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Network Nodes (Servers/Devices)
    const nodesGroup = new THREE.Group();
    const nodeGeo = new THREE.BoxGeometry(2, 4, 2);
    const nodeMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, // slate-800
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });

    const nodes: THREE.Mesh[] = [];
    const nodePositions: THREE.Vector3[] = [];
    const nodeCount = 12;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 15;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const node = new THREE.Mesh(nodeGeo, nodeMat.clone());
      node.position.set(x, 0, z);
      
      // Add a glowing core to each node
      const coreGeo = new THREE.BoxGeometry(1.8, 3.8, 1.8);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // sky-400
      const core = new THREE.Mesh(coreGeo, coreMat);
      node.add(core);

      nodesGroup.add(node);
      nodes.push(node);
      nodePositions.push(new THREE.Vector3(x, 0, z));
    }

    // Central Hub
    const hubGeo = new THREE.CylinderGeometry(4, 4, 2, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.y = -2;
    nodesGroup.add(hub);

    const hubCoreGeo = new THREE.SphereGeometry(2, 32, 32);
    const hubCoreMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 }); // indigo-400
    const hubCore = new THREE.Mesh(hubCoreGeo, hubCoreMat);
    hubCore.position.y = 1;
    hub.add(hubCore);

    scene.add(nodesGroup);

    // Data Packets (Particles)
    const packetCount = 200;
    const packetGeo = new THREE.BufferGeometry();
    const packetPos = new Float32Array(packetCount * 3);
    const packetColors = new Float32Array(packetCount * 3);
    
    // Initialize packets at hub
    for (let i = 0; i < packetCount * 3; i += 3) {
      packetPos[i] = 0;
      packetPos[i+1] = 0;
      packetPos[i+2] = 0;
      
      packetColors[i] = 0.2; // R
      packetColors[i+1] = 0.7; // G
      packetColors[i+2] = 1.0; // B
    }

    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
    packetGeo.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));

    const packetMat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const packetSystem = new THREE.Points(packetGeo, packetMat);
    scene.add(packetSystem);

    // Connections (Lines)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 });
    nodePositions.forEach(pos => {
      const points = [];
      points.push(new THREE.Vector3(0, 0, 0)); // Hub
      points.push(pos);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
    });

    const clock = new THREE.Clock();
    let animationId: number;

    // Packet state tracking
    const packetStates = Array(packetCount).fill(0).map(() => ({
      targetNode: Math.floor(Math.random() * nodeCount),
      progress: Math.random(),
      speed: 0.01 + Math.random() * 0.02,
      isThreat: false
    }));

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { networkTraffic, serverLoad, securityThreats, isAlert } = propsRef.current;

      // Update Hub Core color based on server load
      const loadRatio = serverLoad / 100;
      hubCoreMat.color.setHSL(0.6 - (loadRatio * 0.6), 0.8, 0.5); // Blue to Red
      hubCore.scale.setScalar(1 + Math.sin(time * 5) * 0.05 * loadRatio);

      // Update Nodes
      nodes.forEach((node, index) => {
        const core = node.children[0] as THREE.Mesh;
        const coreMat = core.material as THREE.MeshBasicMaterial;
        
        // Simulate node activity
        const activity = Math.sin(time * 2 + index) * 0.5 + 0.5;
        coreMat.opacity = 0.3 + activity * 0.7;
        
        // If alert, some nodes turn red
        if (isAlert && index % 3 === 0) {
          coreMat.color.setHex(0xf87171); // red-400
        } else {
          coreMat.color.setHex(0x38bdf8); // sky-400
        }
      });

      // Update Packets
      const positions = packetGeo.attributes.position.array as Float32Array;
      const colors = packetGeo.attributes.color.array as Float32Array;
      
      // Determine how many threats to show based on securityThreats value
      const threatThreshold = securityThreats / 100;

      for (let i = 0; i < packetCount; i++) {
        const state = packetStates[i];
        
        // Adjust speed based on network traffic
        const currentSpeed = state.speed * (networkTraffic / 50);
        state.progress += currentSpeed;

        if (state.progress >= 1) {
          state.progress = 0;
          state.targetNode = Math.floor(Math.random() * nodeCount);
          // Randomly assign threat status based on probability
          state.isThreat = Math.random() < threatThreshold;
        }

        const targetPos = nodePositions[state.targetNode];
        
        // Interpolate position from hub to node
        positions[i * 3] = targetPos.x * state.progress;
        positions[i * 3 + 1] = Math.sin(state.progress * Math.PI) * 5; // Arc trajectory
        positions[i * 3 + 2] = targetPos.z * state.progress;

        // Set color based on threat status
        if (state.isThreat || isAlert) {
          colors[i * 3] = 1.0; // R
          colors[i * 3 + 1] = 0.2; // G
          colors[i * 3 + 2] = 0.2; // B
        } else {
          colors[i * 3] = 0.2; // R
          colors[i * 3 + 1] = 0.7; // G
          colors[i * 3 + 2] = 1.0; // B
        }
      }
      
      packetGeo.attributes.position.needsUpdate = true;
      packetGeo.attributes.color.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
