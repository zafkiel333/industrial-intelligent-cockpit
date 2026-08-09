import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GearboxState } from './three-types';

interface ThreeSceneProps {
  state: GearboxState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // slate-900
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x8b5cf6, 2); // violet-500
    spotLight.position.set(0, 20, 0);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const gearboxGroup = new THREE.Group();
    scene.add(gearboxGroup);

    // Helper function to create a gear
    const createGear = (radius: number, teeth: number, thickness: number, color: number) => {
        const shape = new THREE.Shape();
        const innerRadius = radius * 0.8;
        
        for (let i = 0; i < teeth * 2; i++) {
            const angle = (i / (teeth * 2)) * Math.PI * 2;
            const r = i % 2 === 0 ? radius : innerRadius;
            if (i === 0) shape.moveTo(r, 0);
            else shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        shape.closePath();

        // Hole in center
        const holePath = new THREE.Path();
        holePath.absarc(0, 0, radius * 0.2, 0, Math.PI * 2, false);
        shape.holes.push(holePath);

        const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.translate(0, 0, -thickness / 2);

        // Shader to show wear (pitting/spalling on teeth) and heat
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uWear: { value: 0.0 },
                uTemp: { value: 0.0 },
                uBaseColor: { value: new THREE.Color(color) },
                uWearColor: { value: new THREE.Color(0x1e293b) }, // Dark pitting
                uHotColor: { value: new THREE.Color(0xef4444) } // Red heat
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    vUv = uv;
                    gl_Position = projectionMatrix * vec4(vPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uWear;
                uniform float uTemp;
                uniform vec3 uBaseColor;
                uniform vec3 uWearColor;
                uniform vec3 uHotColor;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;

                float rand(vec2 co){
                    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
                }

                void main() {
                    vec3 color = uBaseColor;
                    
                    // Pitting noise on teeth (outer edge)
                    // In ExtrudeGeometry, the sides (teeth) have specific UVs or we can use position
                    float distFromCenter = length(vPosition.xy);
                    // Assume radius is roughly > 0.8 * max_radius for teeth
                    float isTooth = smoothstep(0.7, 1.0, distFromCenter);
                    
                    float noise = rand(vPosition.xy * 10.0);
                    if (noise < uWear * isTooth) {
                        color = uWearColor;
                    }

                    // Heat mapping (friction generates heat at teeth)
                    color = mix(color, uHotColor, uTemp * isTooth * 0.8);

                    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                    float diff = max(dot(vNormal, lightDir), 0.2);
                    
                    vec3 viewDir = normalize(-vPosition);
                    vec3 halfDir = normalize(lightDir + viewDir);
                    float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
                    
                    gl_FragColor = vec4(color * diff + vec3(0.6) * spec, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        return new THREE.Mesh(geo, mat);
    };

    // Gear Train (Input -> Intermediate -> Output)
    const gear1 = createGear(3, 16, 2, 0x94a3b8); // Input (High speed, low torque)
    gear1.position.set(-6, 0, 0);
    gearboxGroup.add(gear1);

    const gear2 = createGear(6, 32, 2, 0x64748b); // Intermediate
    gear2.position.set(1.5, 0, 0);
    gearboxGroup.add(gear2);

    const gear3 = createGear(4, 20, 3, 0x64748b); // Coaxial with gear2
    gear3.position.set(1.5, 0, 3);
    gearboxGroup.add(gear3);

    const gear4 = createGear(8, 40, 3, 0x475569); // Output (Low speed, high torque)
    gear4.position.set(11.5, 0, 3);
    gearboxGroup.add(gear4);

    // Shafts
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 });
    
    const shaft1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 6), shaftMat);
    shaft1.rotation.x = Math.PI / 2;
    shaft1.position.set(-6, 0, -2);
    gearboxGroup.add(shaft1);

    const shaft2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 8), shaftMat);
    shaft2.rotation.x = Math.PI / 2;
    shaft2.position.set(1.5, 0, 1.5);
    gearboxGroup.add(shaft2);

    const shaft3 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 8), shaftMat);
    shaft3.rotation.x = Math.PI / 2;
    shaft3.position.set(11.5, 0, 5);
    gearboxGroup.add(shaft3);

    // Oil Bath (Particles)
    const oilCount = 1000;
    const oilGeo = new THREE.BufferGeometry();
    const oilPos = new Float32Array(oilCount * 3);
    for(let i=0; i<oilCount; i++) {
        oilPos[i*3] = (Math.random() - 0.5) * 24 + 3;
        oilPos[i*3+1] = -5 + Math.random() * 3; // Bottom of gearbox
        oilPos[i*3+2] = (Math.random() - 0.5) * 10;
    }
    oilGeo.setAttribute('position', new THREE.BufferAttribute(oilPos, 3));
    const oilMat = new THREE.PointsMaterial({
        size: 0.3,
        color: 0xd97706, // amber-600
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const oilSystem = new THREE.Points(oilGeo, oilMat);
    gearboxGroup.add(oilSystem);

    // Center the whole group
    gearboxGroup.position.x = -3;

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Gear Rotation Logic
      // Gear1 drives Gear2. Gear3 is on same shaft as Gear2. Gear3 drives Gear4.
      const rps1 = currentState.inputRpm / 60;
      const angle1 = time * rps1 * Math.PI * 2;
      
      gear1.rotation.z = angle1;
      shaft1.rotation.y = -angle1;

      // Ratio 1: 16/32 = 0.5
      const angle2 = -angle1 * 0.5;
      gear2.rotation.z = angle2;
      gear3.rotation.z = angle2;
      shaft2.rotation.y = -angle2;

      // Ratio 2: 20/40 = 0.5
      const angle4 = -angle2 * 0.5;
      gear4.rotation.z = angle4;
      shaft3.rotation.y = -angle4;

      // Vibration (Shake the whole group based on vibration level)
      const vibAmp = currentState.vibrationLevel * 0.02;
      gearboxGroup.position.y = Math.sin(time * 50) * vibAmp;
      gearboxGroup.position.z = Math.cos(time * 43) * vibAmp;

      // Update Shaders
      const wearVal = currentState.gearWear / 100;
      const tempVal = Math.max(0, (currentState.oilTemperature - 40) / 60); // Normalize 40-100C

      [gear1, gear2, gear3, gear4].forEach(gear => {
          (gear.material as THREE.ShaderMaterial).uniforms.uWear.value = wearVal;
          (gear.material as THREE.ShaderMaterial).uniforms.uTemp.value = tempVal;
      });

      // Oil splash animation (gears kicking up oil)
      const positions = oilSystem.geometry.attributes.position.array as Float32Array;
      const splashIntensity = rps1 * 0.5;
      
      for(let i=0; i<oilCount; i++) {
          // Gravity
          positions[i*3+1] -= 0.1;
          
          // Reset if below bath
          if (positions[i*3+1] < -5) {
              // Chance to be kicked up by a gear
              if (Math.random() < splashIntensity * 0.1) {
                  // Pick a gear x position roughly
                  const gearX = Math.random() > 0.5 ? -6 : (Math.random() > 0.5 ? 1.5 : 11.5);
                  positions[i*3] = gearX + (Math.random() - 0.5) * 4;
                  positions[i*3+1] = -2 + Math.random() * 2; // Kick up
                  positions[i*3+2] = (Math.random() - 0.5) * 4;
              } else {
                  // Just stay in bath
                  positions[i*3+1] = -5 + Math.random() * 2;
              }
          }
      }
      oilSystem.geometry.attributes.position.needsUpdate = true;

      // Change oil color if hot or dirty (worn)
      if (tempVal > 0.8 || wearVal > 0.5) {
          oilMat.color.setHex(0x451a03); // Dark brown/black
      } else {
          oilMat.color.setHex(0xd97706); // Amber
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // Dispose geometries and materials
      gearboxGroup.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (Array.isArray(child.material)) {
                  child.material.forEach(m => m.dispose());
              } else {
                  child.material.dispose();
              }
          }
      });
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
