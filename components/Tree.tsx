
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, TreeState } from '../constants';

const EMERALD_COUNT = 4500; 
const LIGHTS_COUNT = 500; 
const SNOW_TIPS_COUNT = 1200; // New count for the white embellishments

export const ChristmasTree: React.FC<{ mode: TreeState }> = ({ mode }) => {
  const emeraldMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightsMeshRef = useRef<THREE.InstancedMesh>(null);
  const snowTipsMeshRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Mesh>(null);
  
  const morphProgress = useRef(0);
  const targetProgress = mode === TreeState.TREE ? 1 : 0;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSparkleColor: { value: new THREE.Color(COLORS.goldBright) },
  }), []);

  // Tree Physics & Data
  const treePhysics = useMemo(() => {
    const generateScatter = (count: number, radiusRange: [number, number]) => {
      const pos = new Float32Array(count * 3);
      const rot = new Float32Array(count * 4);
      const tempObj = new THREE.Object3D();
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        const r = radiusRange[0] + Math.random() * (radiusRange[1] - radiusRange[0]);
        pos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
        pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi) + 2;
        pos[i * 3 + 2] = r * Math.cos(phi);
        tempObj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        rot[i * 4] = tempObj.quaternion.x;
        rot[i * 4 + 1] = tempObj.quaternion.y;
        rot[i * 4 + 2] = tempObj.quaternion.z;
        rot[i * 4 + 3] = tempObj.quaternion.w;
      }
      return { pos, rot };
    };

    // Tree tiers configuration
    const tierRadii = [2.6, 2.1, 1.6, 1.1, 0.6];
    const levelHeight = 1.3;

    // Emerald Tree Foliage
    const emeraldTreePos = new Float32Array(EMERALD_COUNT * 3);
    const emeraldTreeRot = new Float32Array(EMERALD_COUNT * 4);
    const tempObj = new THREE.Object3D();
    
    const tierWeights = tierRadii.map(r => r * r); 
    const totalWeight = tierWeights.reduce((a, b) => a + b, 0);
    const cumulativeWeights: number[] = [];
    let weightSum = 0;
    tierWeights.forEach(w => {
      weightSum += w / totalWeight;
      cumulativeWeights.push(weightSum);
    });

    for (let i = 0; i < EMERALD_COUNT; i++) {
      const rand = Math.random();
      let level = 0;
      for (let j = 0; j < cumulativeWeights.length; j++) {
        if (rand < cumulativeWeights[j]) {
          level = j;
          break;
        }
      }

      const baseLevelRadius = tierRadii[level];
      const yOffset = level * 1.0 - 1.5;
      const angle = Math.random() * Math.PI * 2;
      const h = Math.random();
      const currentRadius = baseLevelRadius * (1 - h * 0.9) + (Math.random() - 0.5) * 0.15;
      
      emeraldTreePos[i * 3] = Math.cos(angle) * currentRadius;
      emeraldTreePos[i * 3 + 1] = yOffset + h * levelHeight;
      emeraldTreePos[i * 3 + 2] = Math.sin(angle) * currentRadius;
      
      tempObj.lookAt(0, emeraldTreePos[i * 3 + 1], 0);
      emeraldTreeRot[i * 4] = tempObj.quaternion.x;
      emeraldTreeRot[i * 4 + 1] = tempObj.quaternion.y;
      emeraldTreeRot[i * 4 + 2] = tempObj.quaternion.z;
      emeraldTreeRot[i * 4 + 3] = tempObj.quaternion.w;
    }

    // Snow Tips (White Embellishments) at the bottom of each tier
    const snowTipsTreePos = new Float32Array(SNOW_TIPS_COUNT * 3);
    const snowTipsPhases = new Float32Array(SNOW_TIPS_COUNT);
    for (let i = 0; i < SNOW_TIPS_COUNT; i++) {
      const level = i % tierRadii.length;
      const baseLevelRadius = tierRadii[level];
      const yOffset = level * 1.0 - 1.5;
      const angle = (i / (SNOW_TIPS_COUNT / tierRadii.length)) * Math.PI * 2 + Math.random() * 0.1;
      
      const radius = baseLevelRadius + (Math.random() - 0.5) * 0.12;
      snowTipsTreePos[i * 3] = Math.cos(angle) * radius;
      snowTipsTreePos[i * 3 + 1] = yOffset + Math.random() * 0.05; 
      snowTipsTreePos[i * 3 + 2] = Math.sin(angle) * radius;
      snowTipsPhases[i] = Math.random() * Math.PI * 2;
    }

    // Christmas Lights Spiral
    const lightsTreePos = new Float32Array(LIGHTS_COUNT * 3);
    const lightPhases = new Float32Array(LIGHTS_COUNT);
    const lightColors = new Float32Array(LIGHTS_COUNT * 3);
    const palette = [
      new THREE.Color(COLORS.velvetRed),
      new THREE.Color(COLORS.sapphireBlue),
      new THREE.Color(COLORS.goldBright)
    ];

    for (let i = 0; i < LIGHTS_COUNT; i++) {
      const t = i / LIGHTS_COUNT;
      const y = -1.4 + t * 5.4;
      const spiralTightness = 12.0;
      const angle = t * Math.PI * 2 * spiralTightness;
      const radius = (2.8 * (1 - t * 0.95) + 0.1) * 1.05; 
      lightsTreePos[i * 3] = Math.cos(angle) * radius;
      lightsTreePos[i * 3 + 1] = y;
      lightsTreePos[i * 3 + 2] = Math.sin(angle) * radius;
      lightPhases[i] = Math.random() * Math.PI * 2;
      const col = palette[i % palette.length];
      lightColors[i * 3] = col.r;
      lightColors[i * 3 + 1] = col.g;
      lightColors[i * 3 + 2] = col.b;
    }

    const emeraldSparkle = new Float32Array(EMERALD_COUNT).map(() => Math.random() > 0.5 ? 1.0 : 0.0);

    return {
      emerald: { scatter: generateScatter(EMERALD_COUNT, [7, 12]), tree: { pos: emeraldTreePos, rot: emeraldTreeRot }, sparkle: emeraldSparkle },
      lights: { scatter: generateScatter(LIGHTS_COUNT, [8, 13]), tree: { pos: lightsTreePos }, phase: lightPhases, colors: lightColors },
      snowTips: { scatter: generateScatter(SNOW_TIPS_COUNT, [9, 14]), tree: { pos: snowTipsTreePos }, phase: snowTipsPhases }
    };
  }, []);

  const dummy = new THREE.Object3D();
  const qS = new THREE.Quaternion();
  const qT = new THREE.Quaternion();
  const qM = new THREE.Quaternion();

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    morphProgress.current = THREE.MathUtils.lerp(morphProgress.current, targetProgress, delta * 2.5);
    const t = morphProgress.current;
    const time = state.clock.elapsedTime;
    const float = Math.sin(time * 0.5) * (1 - t) * 0.5;

    // Update Emerald Particles
    if (emeraldMeshRef.current) {
      const data = treePhysics.emerald;
      for (let i = 0; i < EMERALD_COUNT; i++) {
        dummy.position.set(
          THREE.MathUtils.lerp(data.scatter.pos[i * 3], data.tree.pos[i * 3], t),
          THREE.MathUtils.lerp(data.scatter.pos[i * 3 + 1], data.tree.pos[i * 3 + 1], t) + float,
          THREE.MathUtils.lerp(data.scatter.pos[i * 3 + 2], data.tree.pos[i * 3 + 2], t)
        );
        qS.set(data.scatter.rot[i * 4], data.scatter.rot[i * 4 + 1], data.scatter.rot[i * 4 + 2], data.scatter.rot[i * 4 + 3]);
        qT.set(data.tree.rot[i * 4], data.tree.rot[i * 4 + 1], data.tree.rot[i * 4 + 2], data.tree.rot[i * 4 + 3]);
        qM.slerpQuaternions(qS, qT, t);
        dummy.quaternion.copy(qM);
        const s = THREE.MathUtils.lerp(0.3, 0.12, t);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        emeraldMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      emeraldMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Snow Tips (Now brighter)
    if (snowTipsMeshRef.current) {
      const data = treePhysics.snowTips;
      for (let i = 0; i < SNOW_TIPS_COUNT; i++) {
        dummy.position.set(
          THREE.MathUtils.lerp(data.scatter.pos[i * 3], data.tree.pos[i * 3], t),
          THREE.MathUtils.lerp(data.scatter.pos[i * 3 + 1], data.tree.pos[i * 3 + 1], t) + float,
          THREE.MathUtils.lerp(data.scatter.pos[i * 3 + 2], data.tree.pos[i * 3 + 2], t)
        );
        const twinkle = Math.sin(time * 2.5 + data.phase[i]) * 0.5 + 0.5;
        const s = THREE.MathUtils.lerp(0.12, 0.03 + twinkle * 0.02, t);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        snowTipsMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      snowTipsMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Twinkling Lights
    if (lightsMeshRef.current) {
      const data = treePhysics.lights;
      for (let i = 0; i < LIGHTS_COUNT; i++) {
        dummy.position.set(
          THREE.MathUtils.lerp(data.scatter.pos[i * 3], data.tree.pos[i * 3], t),
          THREE.MathUtils.lerp(data.scatter.pos[i * 3 + 1], data.tree.pos[i * 3 + 1], t) + float,
          THREE.MathUtils.lerp(data.scatter.pos[i * 3 + 2], data.tree.pos[i * 3 + 2], t)
        );
        const s = THREE.MathUtils.lerp(0.15, 0.05, t);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        lightsMeshRef.current.setMatrixAt(i, dummy.matrix);
        lightsMeshRef.current.setColorAt(i, new THREE.Color(data.colors[i * 3], data.colors[i * 3 + 1], data.colors[i * 3 + 2]));
      }
      lightsMeshRef.current.instanceMatrix.needsUpdate = true;
      if (lightsMeshRef.current.instanceColor) lightsMeshRef.current.instanceColor.needsUpdate = true;
    }

    if (starRef.current) {
      starRef.current.position.y = THREE.MathUtils.lerp(6, 4.0, t);
      starRef.current.scale.setScalar(t > 0.1 ? t : 0);
      starRef.current.rotation.y += 0.01;
    }
  });

  const onBeforeCompileEmerald = (shader: any) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uSparkleColor = uniforms.uSparkleColor;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\nattribute float aSparkle;\nvarying float vSparkle;\nvarying vec3 vWorldPosition;`);
    shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>\nvWorldPosition = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\nvSparkle = aSparkle;`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWorldPosition;\nvarying float vSparkle;\nuniform float uTime;\nuniform vec3 uSparkleColor;\nfloat hash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\nfloat sparkleNoise = hash(floor(vWorldPosition * 25.0 + uTime * 0.2));\nfloat sparkle = sin(uTime * (2.5 + sparkleNoise * 5.0) + sparkleNoise * 100.0);\nsparkle = pow(max(0.0, sparkle), 120.0);\ntotalEmissiveRadiance += uSparkleColor * sparkle * 2.5 * vSparkle;`);
  };

  const onBeforeCompileLights = (shader: any) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\nattribute float aPhase;\nvarying float vPhase;`);
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\nvPhase = aPhase;`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\nuniform float uTime;\nvarying float vPhase;`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\nfloat twinkle = sin(uTime * 3.0 + vPhase) * 0.5 + 0.5;\ntwinkle = pow(twinkle, 3.0);\ntotalEmissiveRadiance = diffuseColor.rgb * (1.5 + twinkle * 5.0);`);
  };

  return (
    <group>
      {/* Foliage Particles */}
      <instancedMesh ref={emeraldMeshRef} args={[undefined, undefined, EMERALD_COUNT]} castShadow>
        <octahedronGeometry args={[0.5, 0]}>
          <instancedBufferAttribute attach="attributes-aSparkle" args={[treePhysics.emerald.sparkle, 1]} />
        </octahedronGeometry>
        <meshStandardMaterial 
          color={COLORS.emerald} 
          metalness={0.8} 
          roughness={0.1} 
          emissive={COLORS.emerald}
          emissiveIntensity={0.2}
          onBeforeCompile={onBeforeCompileEmerald}
        />
      </instancedMesh>

      {/* Brighter White Embellishments (Snow/Frost Points at Tier Bases) */}
      <instancedMesh ref={snowTipsMeshRef} args={[undefined, undefined, SNOW_TIPS_COUNT]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={1.8} 
          roughness={0.2}
        />
      </instancedMesh>

      {/* Multi-Colored Twinkling Christmas Lights */}
      <instancedMesh ref={lightsMeshRef} args={[undefined, undefined, LIGHTS_COUNT]}>
        <sphereGeometry args={[1, 8, 8]}>
          <instancedBufferAttribute attach="attributes-aPhase" args={[treePhysics.lights.phase, 1]} />
        </sphereGeometry>
        <meshStandardMaterial 
          metalness={0.1}
          roughness={0.5}
          emissive="#000000" 
          onBeforeCompile={onBeforeCompileLights}
        />
      </instancedMesh>

      {/* Star Top */}
      <mesh ref={starRef} position={[0, 4, 0]}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={COLORS.goldBright} emissive={COLORS.gold} emissiveIntensity={10} />
        <pointLight color={COLORS.goldBright} intensity={5 * morphProgress.current} distance={10} />
      </mesh>

      <mesh position={[0, -2, 0]} scale={[1, morphProgress.current, 1]}>
        <cylinderGeometry args={[0.2, 0.3, 1.5, 16]} />
        <meshStandardMaterial color="#2d1b0f" />
      </mesh>
    </group>
  );
};
