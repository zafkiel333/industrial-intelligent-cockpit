
import * as THREE from 'three';
import { TruckEdgeAnimatables, EdgeScenarioState } from './three-types';

export const initTruckEdgeScene = (
  group: THREE.Group, 
  animatables: TruckEdgeAnimatables,
  disposables: { dispose: () => void }[]
) => {
  // --- 材质库 ---
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.6 }); // 工程黄
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9 });
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 1.0 });
  const obstacleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.1, metalness: 0.2 });
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.2 });
  const pathMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 2 });
  const replanMat = new THREE.LineDashedMaterial({ color: 0xf472b6, dashSize: 0.5, gapSize: 0.2, linewidth: 2 });
  const commsMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.0 }); // Initial hidden

  disposables.push(bodyMat, tireMat, groundMat, obstacleMat, sensorMat, pathMat, replanMat, commsMat);

  // 1. 地形 (Road)
  const roadGeo = new THREE.PlaneGeometry(60, 60, 40, 40);
  roadGeo.rotateX(-Math.PI / 2);
  // 制造一些起伏
  const pos = roadGeo.attributes.position;
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      if (Math.abs(x) > 6) { // Roadside banks
          pos.setY(i, Math.random() * 2 + 1);
      } else {
          pos.setY(i, Math.random() * 0.1); // Road surface noise
      }
  }
  roadGeo.computeVertexNormals();
  disposables.push(roadGeo);
  const road = new THREE.Mesh(roadGeo, groundMat);
  road.position.y = -0.5;
  group.add(road);

  // 2. 无人矿卡 (Autonomous Truck)
  const truckGroup = new THREE.Group();
  group.add(truckGroup);
  animatables.truckGroup = truckGroup;

  // Chassis
  const chassisGeo = new THREE.BoxGeometry(3.5, 1.5, 6);
  chassisGeo.translate(0, 1.5, 0);
  disposables.push(chassisGeo);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  truckGroup.add(chassis);

  // Cabin (Offset)
  const cabGeo = new THREE.BoxGeometry(1.5, 1.2, 1.5);
  cabGeo.translate(-0.8, 3, 2);
  disposables.push(cabGeo);
  const cab = new THREE.Mesh(cabGeo, new THREE.MeshStandardMaterial({color: 0xffffff}));
  truckGroup.add(cab);

  // Dump Body
  const dumpGeo = new THREE.BoxGeometry(3.8, 2, 5);
  dumpGeo.translate(0, 3, -0.5);
  disposables.push(dumpGeo);
  const dump = new THREE.Mesh(dumpGeo, bodyMat);
  truckGroup.add(dump);

  // Wheels
  animatables.wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(1, 1, 1, 24);
  wheelGeo.rotateZ(Math.PI/2);
  disposables.push(wheelGeo);
  
  const wheelPos = [
      {x: -2, z: 2}, {x: 2, z: 2}, // Front
      {x: -2, z: -2}, {x: 2, z: -2} // Rear
  ];
  wheelPos.forEach(p => {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      w.position.set(p.x, 1, p.z);
      truckGroup.add(w);
      animatables.wheels!.push(w);
  });

  // Sensor Pack (Roof)
  const sensorGroup = new THREE.Group();
  sensorGroup.position.set(0, 4, 2);
  truckGroup.add(sensorGroup);
  
  // Lidar Spinner
  const lidarGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3);
  const lidar = new THREE.Mesh(lidarGeo, new THREE.MeshBasicMaterial({color: 0x000000}));
  sensorGroup.add(lidar);
  animatables.sensorBox = sensorGroup;

  // 3. 障碍物 (Rock)
  const obsGroup = new THREE.Group();
  const rockGeo = new THREE.DodecahedronGeometry(1.5, 0);
  disposables.push(rockGeo);
  const rock = new THREE.Mesh(rockGeo, obstacleMat);
  obsGroup.add(rock);
  obsGroup.position.set(0, 1, 15); // Ahead
  group.add(obsGroup);
  animatables.obstacle = obsGroup;

  // 4. Lidar Point Cloud (Visual effect)
  const pCount = 500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x00ff00, size: 0.1 });
  disposables.push(pGeo, pMat);
  const points = new THREE.Points(pGeo, pMat);
  truckGroup.add(points); // Move with truck
  animatables.lidarPoints = points;

  // 5. Radar Cone
  const coneGeo = new THREE.ConeGeometry(4, 10, 32, 1, true);
  coneGeo.rotateX(-Math.PI/2);
  coneGeo.translate(0, 0, 5); // Extend forward
  disposables.push(coneGeo);
  const cone = new THREE.Mesh(coneGeo, sensorMat);
  cone.position.set(0, 1, 3);
  truckGroup.add(cone);
  animatables.radarCone = cone;
  cone.visible = false;

  // 6. Paths
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(0, 0.2, 40)
  ]);
  const line = new THREE.Line(lineGeo, pathMat);
  group.add(line);
  animatables.pathLine = line;

  // Re-planning path (Curve around obstacle)
  const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(0, 0.2, 10),
      new THREE.Vector3(4, 0.2, 15), // Avoid
      new THREE.Vector3(0, 0.2, 25),
      new THREE.Vector3(0, 0.2, 40),
  ]);
  const curvePts = curve.getPoints(50);
  const replanGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
  const replanLine = new THREE.Line(replanGeo, replanMat);
  replanLine.computeLineDistances();
  replanLine.visible = false;
  group.add(replanLine);
  animatables.replanningLine = replanLine;

  // 7. Comm Link (Beam up)
  const beamGeo = new THREE.CylinderGeometry(0.1, 2, 20, 8, 1, true);
  beamGeo.translate(0, 10, 0);
  disposables.push(beamGeo);
  const beam = new THREE.Mesh(beamGeo, commsMat);
  truckGroup.add(beam);
  animatables.communicationLink = beam;

  // Grid
  const gridHelper = new THREE.GridHelper(60, 30, 0x334155, 0x0f172a);
  gridHelper.position.y = -0.4;
  group.add(gridHelper);
};

export const animateTruckEdgeScene = (
  animatables: TruckEdgeAnimatables, 
  state: EdgeScenarioState,
  time: number
) => {
  // Reset
  if (animatables.radarCone) animatables.radarCone.visible = false;
  if (animatables.replanningLine) animatables.replanningLine.visible = false;
  if (animatables.communicationLink) (animatables.communicationLink.material as THREE.Material).opacity = 0;
  if (animatables.pathLine) animatables.pathLine.visible = true;

  // Lidar Spin
  if (animatables.sensorBox) animatables.sensorBox.rotation.y -= 0.2;
  
  // Lidar Cloud Animation
  if (animatables.lidarPoints) {
      const pos = animatables.lidarPoints.geometry.attributes.position.array as Float32Array;
      const count = pos.length / 3;
      // Simulate scanning pattern
      for(let i=0; i<count; i++) {
          const angle = (i / count) * Math.PI * 2 + time * 5;
          const r = 5 + Math.random() * 10;
          pos[i*3] = Math.sin(angle) * r;
          pos[i*3+1] = (Math.random()-0.5) * 2; // Y spread
          pos[i*3+2] = Math.cos(angle) * r;
      }
      animatables.lidarPoints.geometry.attributes.position.needsUpdate = true;
  }

  // State Logic
  if (state === 'CRUISING') {
      // Wheels spin
      if (animatables.wheels) animatables.wheels.forEach(w => w.rotation.x += 0.1);
      // Truck moves relative to floor? Or floor moves?
      // Let's move truck slightly to show idle engine vib
      if (animatables.truckGroup) animatables.truckGroup.position.y = Math.sin(time*20)*0.02;
      // Comm link active
      if (animatables.communicationLink) {
          (animatables.communicationLink.material as THREE.Material).opacity = 0.2 + Math.sin(time*5)*0.1;
      }
  }
  else if (state === 'OBSTACLE_DETECT') {
      if (animatables.radarCone) {
          animatables.radarCone.visible = true;
          (animatables.radarCone.material as THREE.Material).opacity = 0.3 + Math.sin(time*10)*0.2;
      }
      // Highlight obstacle
      if (animatables.obstacle) {
          animatables.obstacle.position.z = 15; // Ensure in front
      }
  }
  else if (state === 'DECISION_MAKING') {
      if (animatables.sensorBox) animatables.sensorBox.rotation.y -= 0.5; // Fast processing
  }
  else if (state === 'REROUTING') {
      if (animatables.replanningLine) animatables.replanningLine.visible = true;
      if (animatables.pathLine) animatables.pathLine.visible = false;
      // Truck turns wheels
      if (animatables.wheels) {
          animatables.wheels[0].rotation.y = -0.5; // Front Left
          animatables.wheels[1].rotation.y = -0.5; // Front Right
      }
  }
  else if (state === 'COMMS_LOSS') {
      // Red flash on comms maybe? or just no comms beam
      if (animatables.communicationLink) {
          (animatables.communicationLink.material as THREE.Material).opacity = 0; // Cut off
      }
      // Blink warning lights (if we had them)
  }
  else if (state === 'EMERGENCY_STOP') {
      // Dip nose
      if (animatables.truckGroup) animatables.truckGroup.rotation.x = 0.05;
  }
  else {
      if (animatables.truckGroup) animatables.truckGroup.rotation.x = 0;
      if (animatables.wheels) animatables.wheels.forEach(w => w.rotation.y = 0);
  }
};
