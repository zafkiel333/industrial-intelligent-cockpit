
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

// Simple Node Graph for the mine layout
interface MineNode {
    id: number;
    x: number;
    y: number;
    z: number;
    neighbors: number[];
}

const NODES: MineNode[] = [
    { id: 0, x: 0, y: 0, z: 0, neighbors: [1, 2, 3] }, // Hub
    { id: 1, x: -15, y: 0, z: -5, neighbors: [0, 4] }, // West Wing
    { id: 2, x: 15, y: 0, z: -5, neighbors: [0, 5] }, // East Wing
    { id: 3, x: 0, y: -5, z: 20, neighbors: [0, 6] }, // Deep ramp
    { id: 4, x: -25, y: 2, z: -15, neighbors: [1, 7] }, // Face A
    { id: 5, x: 25, y: 2, z: -15, neighbors: [2, 7] }, // Face B
    { id: 6, x: 0, y: -10, z: 35, neighbors: [3] }, // Sump
    { id: 7, x: 0, y: 5, z: -25, neighbors: [4, 5] }, // Ventilation Shaft (Escape)
];

export const initMineEvacuationScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Environment (Dark Cave)
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  group.add(ambient);
  
  // Tactical Grid Floor
  const grid = new THREE.GridHelper(80, 40, 0x1e293b, 0x0f172a);
  grid.position.y = -12;
  group.add(grid);

  // 2. Tunnel Network Structure
  animatables.evacTunnels = new THREE.Group();
  const tunnelMat = new THREE.MeshBasicMaterial({ 
      color: 0x334155, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15 
  });
  disposables.push(tunnelMat);

  // Build tunnels between neighbors
  const processedEdges = new Set<string>();
  
  NODES.forEach(node => {
      node.neighbors.forEach(nId => {
          const neighbor = NODES.find(n => n.id === nId)!;
          const edgeKey = [node.id, nId].sort().join('-');
          if (processedEdges.has(edgeKey)) return;
          processedEdges.add(edgeKey);

          const start = new THREE.Vector3(node.x, node.y, node.z);
          const end = new THREE.Vector3(neighbor.x, neighbor.y, neighbor.z);
          const path = new THREE.LineCurve3(start, end);
          
          const tubeGeo = new THREE.TubeGeometry(path, 10, 1.5, 8, false);
          disposables.push(tubeGeo);
          const tube = new THREE.Mesh(tubeGeo, tunnelMat);
          animatables.evacTunnels!.add(tube);
          
          // Floor inside tube
          const floorGeo = new THREE.TubeGeometry(path, 10, 1.4, 4, false);
          floorGeo.scale(1, 0.1, 1);
          floorGeo.translate(0, -1, 0);
          disposables.push(floorGeo);
          const floorMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, opacity: 0.5, transparent: true });
          disposables.push(floorMat);
          const floor = new THREE.Mesh(floorGeo, floorMat);
          animatables.evacTunnels!.add(floor);
      });
  });
  group.add(animatables.evacTunnels);

  // 3. Safe Zones (Exit / Shelter)
  animatables.evacSafeZones = [];
  const safeGeo = new THREE.BoxGeometry(4, 4, 4);
  const safeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true, transparent: true, opacity: 0.3 });
  disposables.push(safeGeo, safeMat);
  
  // Safe Zone at Node 7 (Vent Shaft)
  const safeZone = new THREE.Mesh(safeGeo, safeMat);
  const n7 = NODES.find(n => n.id === 7)!;
  safeZone.position.set(n7.x, n7.y, n7.z);
  group.add(safeZone);
  animatables.evacSafeZones.push(safeZone as unknown as THREE.Group);
  
  // Safe Beacon
  const beaconGeo = new THREE.CylinderGeometry(0, 0.5, 2);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  disposables.push(beaconGeo, beaconMat);
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(n7.x, n7.y + 3, n7.z);
  group.add(beacon);

  // 4. Agents (Miners)
  animatables.evacAgents = [];
  const agentGeo = new THREE.SphereGeometry(0.4);
  const agentMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Amber
  disposables.push(agentGeo, agentMat);
  
  // Spawn agents at working faces (Node 4, 5, 6)
  const spawnNodes = [4, 5, 6];
  for(let i=0; i<15; i++) {
      const startNodeId = spawnNodes[Math.floor(Math.random() * spawnNodes.length)];
      const startNode = NODES.find(n => n.id === startNodeId)!;
      
      const agentGroup = new THREE.Group();
      // Random offset around node
      const x = startNode.x + (Math.random() - 0.5) * 3;
      const z = startNode.z + (Math.random() - 0.5) * 3;
      agentGroup.position.set(x, startNode.y, z);
      
      const mesh = new THREE.Mesh(agentGeo, agentMat);
      agentGroup.add(mesh);
      
      // Halo
      const haloGeo = new THREE.RingGeometry(0.5, 0.6, 16);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true });
      disposables.push(haloGeo, haloMat);
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.lookAt(0, 1, 0); // Up
      agentGroup.add(halo);

      group.add(agentGroup);
      
      // Store state
      agentGroup.userData = {
          currentNode: startNodeId,
          targetNode: startNodeId, // Initially idle
          progress: 0,
          speed: 0.05 + Math.random() * 0.05,
          status: 'IDLE' // IDLE, MOVING, SAFE, TRAPPED
      };
      animatables.evacAgents.push(agentGroup);
  }

  // 5. Hazards (Initially Hidden)
  animatables.evacHazards = [];
  const hazardGeo = new THREE.SphereGeometry(3, 16, 16);
  const hazardMat = new THREE.MeshBasicMaterial({ 
      color: 0xef4444, 
      wireframe: true,
      transparent: true, 
      opacity: 0.0
  });
  disposables.push(hazardGeo, hazardMat);
  
  // Potential hazard at Node 0 (Hub - Blocking central access)
  const hazard = new THREE.Mesh(hazardGeo, hazardMat);
  hazard.position.set(0, 0, 0);
  hazard.visible = false;
  group.add(hazard);
  animatables.evacHazards.push(hazard as unknown as THREE.Group);

  // 6. Path Lines (Dynamic)
  animatables.evacPaths = [];
  // Pool of lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.5 });
  disposables.push(lineMat);
  
  for(let i=0; i<15; i++) {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
      const line = new THREE.Line(geo, lineMat);
      line.frustumCulled = false;
      line.visible = false;
      group.add(line);
      animatables.evacPaths.push(line);
  }
};

export const animateMineEvacuationScene = (animatables: SimAnimatables, time: number, simData: any) => {
    // simData: { status: 'NORMAL' | 'EMERGENCY', hazardLoc: 'HUB' }
    const isEmergency = simData?.status === 'EMERGENCY';
    
    // 1. Hazard Animation
    if (animatables.evacHazards) {
        const hazard = animatables.evacHazards[0] as unknown as THREE.Mesh;
        if (isEmergency) {
            hazard.visible = true;
            const scale = 1 + Math.sin(time * 2) * 0.2;
            hazard.scale.setScalar(scale);
            (hazard.material as THREE.Material).opacity = 0.4;
            // Rotate
            hazard.rotation.y += 0.01;
            hazard.rotation.z += 0.02;
        } else {
            hazard.visible = false;
        }
    }

    // 2. Agents Logic
    if (animatables.evacAgents) {
        animatables.evacAgents.forEach((agent, i) => {
            const data = agent.userData;
            const mesh = agent.children[0] as THREE.Mesh;
            const halo = agent.children[1] as THREE.Mesh;

            if (isEmergency && data.status !== 'SAFE' && data.status !== 'TRAPPED') {
                data.status = 'MOVING';
                (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff); // Panic white
                (halo.material as THREE.MeshBasicMaterial).color.setHex(0x22c55e); // Path finding active

                // Simple Logic: Move towards Node 7 (Safe) avoiding Node 0 if hazardous
                // Pathfinding hardcoded for demo: 
                // From 4 -> 7 (Direct)
                // From 5 -> 7 (Direct)
                // From 6 -> 3 -> 0 (Blocked!) -> Trapped? OR 6->3... wait 0 is blocked. 
                // If 0 blocked, 6 is trapped unless alternate route exists (none in this graph).
                // From 1, 2 -> 4, 5 -> 7 (Avoid 0)

                let nextNodeId = -1;

                // Determine next hop
                if (data.currentNode === 7) {
                    data.status = 'SAFE';
                } else if (data.currentNode === 4 || data.currentNode === 5) {
                    nextNodeId = 7;
                } else if (data.currentNode === 1) {
                    nextNodeId = 4;
                } else if (data.currentNode === 2) {
                    nextNodeId = 5;
                } else if (data.currentNode === 6 || data.currentNode === 3) {
                    // Path goes through 0. If 0 is hazard, get trapped or move close then stop.
                    // For drama, move to 0 then stop.
                    if (data.currentNode === 6) nextNodeId = 3;
                    else if (data.currentNode === 3) nextNodeId = 0;
                    
                    if (nextNodeId === 0) {
                         // Approaching hazard
                         data.status = 'TRAPPED';
                         (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xef4444); // Red
                         (halo.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
                    }
                } else if (data.currentNode === 0) {
                    data.status = 'TRAPPED';
                }

                // Execute Move
                if (nextNodeId !== -1 && data.status === 'MOVING') {
                    // Interpolate
                    const currentPos = new THREE.Vector3().copy(agent.position);
                    const targetNode = NODES.find(n => n.id === nextNodeId)!;
                    const targetPos = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z);
                    
                    const dist = currentPos.distanceTo(targetPos);
                    if (dist < 0.5) {
                        data.currentNode = nextNodeId;
                    } else {
                        const dir = targetPos.sub(currentPos).normalize();
                        agent.position.add(dir.multiplyScalar(data.speed * 2)); // Run fast
                    }
                    
                    // Draw Path Line
                    if (animatables.evacPaths && animatables.evacPaths[i]) {
                        const line = animatables.evacPaths[i];
                        line.visible = true;
                        const attr = line.geometry.attributes.position;
                        attr.setXYZ(0, agent.position.x, agent.position.y, agent.position.z);
                        attr.setXYZ(1, targetNode.x, targetNode.y, targetNode.z);
                        attr.needsUpdate = true;
                    }
                } else {
                    if (animatables.evacPaths && animatables.evacPaths[i]) animatables.evacPaths[i].visible = false;
                }

            } else if (!isEmergency) {
                // Idle movement
                data.status = 'IDLE';
                (mesh.material as THREE.MeshBasicMaterial).color.setHex(0xfacc15); // Reset
                (halo.material as THREE.MeshBasicMaterial).color.setHex(0xfacc15);
                agent.position.y = NODES.find(n => n.id === data.currentNode)!.y + Math.sin(time * 2 + i) * 0.2;
                if (animatables.evacPaths && animatables.evacPaths[i]) animatables.evacPaths[i].visible = false;
            } else if (data.status === 'SAFE') {
                (mesh.material as THREE.MeshBasicMaterial).color.setHex(0x22c55e);
                (halo.material as THREE.MeshBasicMaterial).color.setHex(0x22c55e);
                if (animatables.evacPaths && animatables.evacPaths[i]) animatables.evacPaths[i].visible = false;
            }
        });
    }

    // 3. Pulse Safe Zones
    if (animatables.evacSafeZones) {
        animatables.evacSafeZones.forEach(zone => {
            const scale = 1 + Math.sin(time * 3) * 0.05;
            zone.scale.setScalar(scale);
        });
    }
};
