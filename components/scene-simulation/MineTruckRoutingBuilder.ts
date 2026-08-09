
import * as THREE from 'three';
import { SimAnimatables } from './three-types';

export const initMineTruckRoutingScene = (
  group: THREE.Group,
  animatables: SimAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // 1. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  group.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(20, 50, 20);
  group.add(dirLight);

  // 2. Terrain: Open Pit (Inverted Cone with Terraces)
  const pitGeo = new THREE.CylinderGeometry(40, 10, 30, 64, 10, true);
  const pos = pitGeo.attributes.position;
  // Deform to look like benches
  for(let i=0; i<pos.count; i++){
      const y = pos.getY(i);
      const r = Math.sqrt(pos.getX(i)**2 + pos.getZ(i)**2);
      // Add noise
      const noise = Math.random() * 0.5;
      if (y > 0) pos.setY(i, y + noise);
  }
  pitGeo.computeVertexNormals();
  const pitMat = new THREE.MeshStandardMaterial({ 
      color: 0x3f3f46, 
      roughness: 1.0, 
      metalness: 0.1,
      side: THREE.DoubleSide,
      flatShading: true
  });
  disposables.push(pitGeo, pitMat);
  const pit = new THREE.Mesh(pitGeo, pitMat);
  pit.position.y = -15; // Sink it
  group.add(pit);
  animatables.routingTerrain = pit;

  // 3. Roads (Spiral Path)
  const pathPoints = [];
  // Spiral from bottom (-30) to top (0)
  for(let i=0; i<=200; i++) {
      const t = i/200;
      const angle = t * Math.PI * 6; // 3 loops
      const radius = 12 + t * 25;
      const height = -30 + t * 30;
      pathPoints.push(new THREE.Vector3(Math.cos(angle)*radius, height + 0.5, Math.sin(angle)*radius));
  }
  const mainRoadCurve = new THREE.CatmullRomCurve3(pathPoints);
  
  // Visual Road
  const roadGeo = new THREE.TubeGeometry(mainRoadCurve, 200, 1.5, 8, false);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 }); // Asphalt/Dirt
  disposables.push(roadGeo, roadMat);
  const road = new THREE.Mesh(roadGeo, roadMat);
  group.add(road);

  // Road Waypoints (Visual Lines)
  const lineGeo = new THREE.BufferGeometry().setFromPoints(mainRoadCurve.getPoints(200));
  const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.3 });
  disposables.push(lineGeo, lineMat);
  const roadLine = new THREE.Line(lineGeo, lineMat);
  roadLine.position.y = 0.2;
  group.add(roadLine);

  animatables.haulRoads = [road];

  // 4. Loading Points (Shovels at bottom) & Dump Points (Top)
  animatables.loadPoints = [];
  animatables.dumpPoints = [];
  
  const markerGeo = new THREE.CylinderGeometry(0, 1, 3, 16);
  const loadMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true });
  const dumpMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true });
  disposables.push(markerGeo, loadMat, dumpMat);

  // Load Point
  const loadPt = new THREE.Mesh(markerGeo, loadMat);
  loadPt.position.set(pathPoints[0].x, pathPoints[0].y + 2, pathPoints[0].z);
  group.add(loadPt);
  animatables.loadPoints.push(loadPt as unknown as THREE.Group);

  // Dump Point
  const dumpPt = new THREE.Mesh(markerGeo, dumpMat);
  dumpPt.position.set(pathPoints[pathPoints.length-1].x, pathPoints[pathPoints.length-1].y + 2, pathPoints[pathPoints.length-1].z);
  group.add(dumpPt);
  animatables.dumpPoints.push(dumpPt as unknown as THREE.Group);

  // 5. Mining Trucks
  animatables.miningTrucks = [];
  const truckGeo = new THREE.BoxGeometry(1.5, 1.2, 2.5);
  const truckMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // Safety Orange
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.5);
  wheelGeo.rotateZ(Math.PI/2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  
  disposables.push(truckGeo, truckMat, wheelGeo, wheelMat);

  for(let i=0; i<8; i++) {
      const truckGroup = new THREE.Group();
      
      const body = new THREE.Mesh(truckGeo, truckMat);
      body.position.y = 1;
      truckGroup.add(body);
      
      // Wheels
      const w1 = new THREE.Mesh(wheelGeo, wheelMat); w1.position.set(1, 0.5, 1); truckGroup.add(w1);
      const w2 = new THREE.Mesh(wheelGeo, wheelMat); w2.position.set(-1, 0.5, 1); truckGroup.add(w2);
      const w3 = new THREE.Mesh(wheelGeo, wheelMat); w3.position.set(1, 0.5, -1); truckGroup.add(w3);
      const w4 = new THREE.Mesh(wheelGeo, wheelMat); w4.position.set(-1, 0.5, -1); truckGroup.add(w4);
      
      // Status Light (Halo)
      const haloGeo = new THREE.RingGeometry(1.5, 1.8, 32);
      haloGeo.rotateX(-Math.PI/2);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      disposables.push(haloGeo, haloMat);
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.y = 0.2;
      truckGroup.add(halo);

      group.add(truckGroup);

      animatables.miningTrucks.push({
          mesh: truckGroup,
          path: mainRoadCurve,
          t: i * (1/8), // Evenly spaced initially
          speed: 0.0005 + Math.random() * 0.0002,
          id: `T-${100+i}`,
          state: i % 2 === 0 ? 'HAUL' : 'RETURN'
      });
  }
};

export const animateMineTruckRoutingScene = (animatables: SimAnimatables, time: number, simData: any) => {
    const congestionLevel = simData?.congestionLevel || 0; // 0-100
    const useAI = simData?.useAI || false;

    if (animatables.miningTrucks) {
        animatables.miningTrucks.forEach((truck, i) => {
            // Logic: High congestion slows down trucks, AI mitigates it slightly
            let speedMod = 1.0;
            if (congestionLevel > 50) {
                // If jammed, trucks slow down drastically unless AI is active
                speedMod = useAI ? 0.8 : 0.2; 
            } else if (congestionLevel > 20) {
                speedMod = useAI ? 1.0 : 0.6;
            }

            // Move
            truck.t += truck.speed * speedMod;
            if (truck.t > 1) truck.t = 0;

            // Update Transform
            const pos = truck.path.getPointAt(truck.t);
            const tangent = truck.path.getTangentAt(truck.t);
            truck.mesh.position.copy(pos);
            truck.mesh.lookAt(pos.clone().add(tangent));

            // Status Color (Halo)
            const halo = truck.mesh.children[5] as THREE.Mesh;
            const haloMat = halo.material as THREE.MeshBasicMaterial;

            // If congestion high and not AI, show Red (stuck). If AI, show Yellow (rerouting). If fast, Green.
            if (speedMod < 0.3) {
                haloMat.color.setHex(0xef4444); // Red
                // Pulse
                haloMat.opacity = 0.5 + Math.sin(time * 10) * 0.3;
            } else if (speedMod < 0.8) {
                haloMat.color.setHex(0xfacc15); // Yellow
                haloMat.opacity = 0.5;
            } else {
                haloMat.color.setHex(0x22c55e); // Green
                haloMat.opacity = 0.3;
            }
        });
    }

    // Load/Dump Points pulse
    if (animatables.loadPoints) {
        animatables.loadPoints.forEach(p => p.rotation.y = time);
    }
    if (animatables.dumpPoints) {
        animatables.dumpPoints.forEach(p => p.rotation.y = -time);
    }
};
