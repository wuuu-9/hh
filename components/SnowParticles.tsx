
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

export const SnowParticles: React.FC = () => {
  const count = 2000; // Reduced from 3000 to clear silhouette clutter
  const mesh = useRef<THREE.Points>(null);

  const [positions, velocities, drift, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    const drf = new Float32Array(count);
    const col = new Float32Array(count * 3);
    
    const palette = [
      new THREE.Color("#ffffff"), // Pure white
      new THREE.Color("#ffffff"), // Higher weight for white
      new THREE.Color("#fff5e6"), // Pale gold
      new THREE.Color("#ffe6e6"), // Pale red
      new THREE.Color("#e6f2ff"), // Pale blue
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 25 - 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      vel[i] = 0.02 + Math.random() * 0.04;
      drf[i] = (Math.random() - 0.5) * 0.01;
      
      const tint = palette[i % palette.length];
      col[i * 3] = tint.r;
      col[i * 3 + 1] = tint.g;
      col[i * 3 + 2] = tint.b;
    }
    return [pos, vel, drf, col];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const array = mesh.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      // Falling
      array[i * 3 + 1] -= velocities[i];
      
      // Gentle Wind Sway
      array[i * 3] += drift[i] + Math.sin(time + i) * 0.005;
      
      if (array[i * 3 + 1] < -5) {
        array[i * 3 + 1] = 20;
        array[i * 3] = (Math.random() - 0.5) * 30;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
