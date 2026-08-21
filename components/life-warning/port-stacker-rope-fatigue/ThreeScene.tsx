import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WireRopeState } from './three-types';

interface ThreeSceneProps {
  state: WireRopeState;
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);

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

    const ropeGroup = new THREE.Group();
    scene.add(ropeGroup);

    // Sheave (Pulley)
    const sheaveGeo = new THREE.CylinderGeometry(5, 5, 1.5, 64);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x525252, metalness: 0.8, roughness: 0.3 }); // neutral-600
    const sheave = new THREE.Mesh(sheaveGeo, metalMat);
    sheave.rotation.x = Math.PI / 2;
    ropeGroup.add(sheave);

    // Sheave Groove
    const grooveGeo = new THREE.TorusGeometry(5, 0.4, 16, 64);
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0x262626, metalness: 0.9, roughness: 0.1 }); // neutral-800
    const groove = new THREE.Mesh(grooveGeo, grooveMat);
    sheave.add(groove); // Add to sheave so it rotates with it

    // Wire Rope (Path along the sheave)
    // We'll create a curved tube that wraps around the top half of the sheave
    class RopeCurve extends THREE.Curve<THREE.Vector3> {
        getPoint(t: number, optionalTarget = new THREE.Vector3()) {
            // t goes from 0 to 1
            // 0 -> straight down left
            // 0.25 -> start of curve
            // 0.75 -> end of curve
            // 1 -> straight down right
            
            let x, y, z = 0;
            const radius = 5;
            const straightLen = 10;

            if (t < 0.25) {
                // Left straight part
                const localT = t / 0.25; // 0 to 1
                x = -radius;
                y = -straightLen * (1 - localT);
            } else if (t > 0.75) {
                // Right straight part
                const localT = (t - 0.75) / 0.25; // 0 to 1
                x = radius;
                y = -straightLen * localT;
            } else {
                // Curved part over the sheave
                const localT = (t - 0.25) / 0.5; // 0 to 1
                const angle = Math.PI + localT * Math.PI; // PI to 2PI (top half)
                x = Math.cos(angle) * radius;
                y = Math.sin(angle) * radius;
            }

            return optionalTarget.set(x, y, z);
        }
    }

    const ropePath = new RopeCurve();
    const ropeGeo = new THREE.TubeGeometry(ropePath, 100, 0.3, 16, false);
    
    // Shader to show tension and broken wires
    const ropeMat = new THREE.ShaderMaterial({
        uniforms: {
            uTension: { value: 0.0 },
            uBrokenWires: { value: 0.0 },
            uTime: { value: 0.0 },
            uSpeed: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0xa3a3a3) }, // neutral-400
            uTensionColor: { value: new THREE.Color(0xf43f5e) }, // rose-500
            uBreakColor: { value: new THREE.Color(0xfcd34d) } // amber-300
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTension;
            uniform float uBrokenWires;
            uniform float uTime;
            uniform float uSpeed;
            uniform vec3 uBaseColor;
            uniform vec3 uTensionColor;
            uniform vec3 uBreakColor;

            varying vec2 vUv;
            varying vec3 vNormal;

            // Simple noise
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                // Simulate rope strands moving
                // vUv.x is along the tube, vUv.y is around the tube
                float strandPattern = sin((vUv.x * 50.0 - uTime * uSpeed * 10.0) + vUv.y * 10.0);
                
                vec3 color = mix(uBaseColor, uBaseColor * 0.5, (strandPattern + 1.0) * 0.5);

                // Add tension color (reddish tint)
                color = mix(color, uTensionColor, uTension * 0.6);

                // Add broken wires (random bright/frayed spots)
                // Only show breaks if uBrokenWires > 0
                if (uBrokenWires > 0.0) {
                    float noise = random(vec2(floor(vUv.x * 100.0), floor(vUv.y * 20.0)));
                    // Probability of a spot being a broken wire depends on uBrokenWires
                    if (noise > (1.0 - uBrokenWires * 0.1)) {
                        color = uBreakColor;
                    }
                }

                // Basic lighting
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });

    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    ropeGroup.add(rope);

    // Load indicator (Weight at the bottom left)
    const loadGeo = new THREE.BoxGeometry(2, 2, 2);
    const loadMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8 });
    const loadMesh = new THREE.Mesh(loadGeo, loadMat);
    loadMesh.position.set(-5, -11, 0);
    ropeGroup.add(loadMesh);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Sheave rotation based on rope speed
      sheave.rotation.z -= currentState.ropeSpeed * 0.05;

      // Update Rope Shader
      ropeMat.uniforms.uTime.value = time;
      ropeMat.uniforms.uSpeed.value = currentState.ropeSpeed;
      
      // Tension based on load (max ~50t)
      const tensionRatio = Math.max(0, Math.min(1, currentState.hoistLoad / 50));
      ropeMat.uniforms.uTension.value = tensionRatio;

      // Broken wires (max ~10 per lay length for discard)
      const breakRatio = Math.max(0, Math.min(1, currentState.brokenWires / 10));
      ropeMat.uniforms.uBrokenWires.value = breakRatio;

      // Animate load bobbing slightly based on tension/speed
      if (currentState.ropeSpeed > 0) {
          loadMesh.position.y = -11 + Math.sin(time * 10) * 0.05 * tensionRatio;
      } else {
          loadMesh.position.y = -11;
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
      sheaveGeo.dispose();
      metalMat.dispose();
      grooveGeo.dispose();
      grooveMat.dispose();
      ropeGeo.dispose();
      ropeMat.dispose();
      loadGeo.dispose();
      loadMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
