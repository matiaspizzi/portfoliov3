import { useRef, useState, useMemo } from 'react';
import { useFrame, type RootState } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 2000;
const SPREAD = 40;
const DEPTH_OFFSET = -20;
const CAMERA_PASS_THRESHOLD = 5;
const RESET_Z = -40;
const GLOW_TEXTURE_SIZE = 64;

interface WarpBackgroundProps {
  readonly isWarping: boolean;
}

/** Generates the initial random star positions and per-star speeds. */
function createStarfield(): {
  positions: Float32Array;
  speeds: Float32Array;
} {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const speeds = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD + DEPTH_OFFSET;
    speeds[i] = Math.random() * 0.02 + 0.01;
  }

  return { positions, speeds };
}

/**
 * Creates a soft circular glow texture using an offscreen canvas.
 * The result is a radial gradient from bright white center to transparent edges,
 * giving each star a sparkle/bloom appearance instead of a hard square.
 */
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = GLOW_TEXTURE_SIZE;
  canvas.height = GLOW_TEXTURE_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context for glow texture.');

  const center = GLOW_TEXTURE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);

  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.15, 'rgba(255, 255, 240, 0.9)');
  gradient.addColorStop(0.4, 'rgba(250, 204, 21, 0.3)');
  gradient.addColorStop(0.7, 'rgba(250, 204, 21, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Renders a GPU-accelerated starfield that reacts to warp state.
 * Stars appear as soft glowing sparkles with a radial gradient texture.
 * When `isWarping` is true, stars accelerate dramatically towards the camera.
 */
export function WarpBackground({ isWarping }: WarpBackgroundProps): React.JSX.Element {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const [starfield] = useState(createStarfield);
  const glowTexture = useMemo(createGlowTexture, []);

  useFrame((_state: RootState, delta: number) => {
    if (!pointsRef.current) return;

    const posArray = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    const speedMultiplier = isWarping ? 8.0 : 0.3;
    const frameDelta = delta * 60;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArray[i * 3 + 2] +=
        starfield.speeds[i] * speedMultiplier * frameDelta;

      if (posArray[i * 3 + 2] > CAMERA_PASS_THRESHOLD) {
        posArray[i * 3 + 2] = RESET_Z;
        posArray[i * 3] = (Math.random() - 0.5) * SPREAD;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    if (materialRef.current) {
      const targetSize = isWarping ? 0.25 : 0.12;
      materialRef.current.size +=
        (targetSize - materialRef.current.size) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={starfield.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.12}
        map={glowTexture}
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
