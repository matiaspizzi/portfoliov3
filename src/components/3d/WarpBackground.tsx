import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree, type RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const PARTICLE_COUNT = 200;
const SPREAD = 120;
const DEPTH_OFFSET = -20;
const CAMERA_PASS_THRESHOLD = 5;
const RESET_Z = -40;
const GLOW_TEXTURE_SIZE = 300; // Increased size for smoother glow and extended borders
const SPEED_MULTIPLIER_WARPING = 16.0;
const SPEED_MULTIPLIER_IDLE = 1.0;
const STREAK_LENGTH_WARP = 1.8;
const STREAK_LENGTH_IDLE = 0.0;

type WarpDirection = 'forward' | 'backward';

interface WarpBackgroundProps {
  readonly isWarping: boolean;
  readonly direction: WarpDirection;
}

interface Starfield {
  readonly positions: Float32Array;
  readonly speeds: Float32Array;
}

/** Generates initial star positions and speeds. */
function createStarfield(): Starfield {
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

/** Creates a glowing 4-pointed star texture for the point sprites. */
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = GLOW_TEXTURE_SIZE;
  canvas.height = GLOW_TEXTURE_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context for glow texture.');

  const center = GLOW_TEXTURE_SIZE / 2;
  const pad = 24; // Large padding for light bleed

  // 1. Ambient Background Glow (Lens Flare effect)
  const ambientGlow = ctx.createRadialGradient(center, center, 0, center, center, center);
  ambientGlow.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  ambientGlow.addColorStop(0.15, 'rgba(255, 255, 255, 0.3)');
  ambientGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
  ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = ambientGlow;
  ctx.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);

  // 2. Set up heavy core glow
  ctx.shadowColor = 'rgba(255, 255, 255, 1)';
  ctx.shadowBlur = 15;

  // 3. Draw 4-pointed star
  ctx.beginPath();
  ctx.moveTo(center, pad);
  ctx.quadraticCurveTo(center, center, GLOW_TEXTURE_SIZE - pad, center);
  ctx.quadraticCurveTo(center, center, center, GLOW_TEXTURE_SIZE - pad);
  ctx.quadraticCurveTo(center, center, pad, center);
  ctx.quadraticCurveTo(center, center, center, pad);
  ctx.closePath();

  // 4. Fill solid bright white core
  const coreGlow = ctx.createRadialGradient(center, center, 0, center, center, center - pad);
  coreGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  coreGlow.addColorStop(0.6, 'rgba(255, 255, 255, 0.9)');
  coreGlow.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
  ctx.fillStyle = coreGlow;
  ctx.fill();

  // 5. Enhance star edges slightly
  ctx.shadowBlur = 5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Renders a starfield with two layers:
 * 1. Points — glowing star sprites (always visible).
 * 2. Fat LineSegments2 — wide streak trails behind each star (visible during warp).
 */
export function WarpBackground({ isWarping, direction }: WarpBackgroundProps): React.JSX.Element {
  const pointsRef = useRef<THREE.Points>(null);
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { size } = useThree();
  const [starfield] = useState(createStarfield);
  const glowTexture = useMemo(() => createGlowTexture(), []);
  const currentStreakLength = useRef(STREAK_LENGTH_IDLE);

  const lineSegmentsRef = useRef<LineSegments2 | null>(null);
  const lineGeometryRef = useRef<LineSegmentsGeometry | null>(null);
  const lineMaterialRef = useRef<LineMaterial | null>(null);
  const linePositionsBuffer = useRef(new Float32Array(PARTICLE_COUNT * 6));
  const lineColorsBuffer = useRef(new Float32Array(PARTICLE_COUNT * 6));

  useEffect(() => {
    const group = groupRef.current;

    // Initialize fading colors buffer once
    const colors = lineColorsBuffer.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Head color (white)
      colors[i * 6] = 1.0;
      colors[i * 6 + 1] = 1.0;
      colors[i * 6 + 2] = 1.0;
      // Tail color (black, which becomes transparent with additive blending)
      colors[i * 6 + 3] = 0.0;
      colors[i * 6 + 4] = 0.0;
      colors[i * 6 + 5] = 0.0;
    }

    const geometry = new LineSegmentsGeometry();
    const material = new LineMaterial({
      vertexColors: true,
      linewidth: 2,
      transparent: true,
      opacity: 0,
      resolution: new THREE.Vector2(size.width, size.height),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    geometry.setPositions(linePositionsBuffer.current);
    geometry.setColors(lineColorsBuffer.current);
    const segments = new LineSegments2(geometry, material);

    lineSegmentsRef.current = segments;
    lineGeometryRef.current = geometry;
    lineMaterialRef.current = material;

    if (group) {
      group.add(segments);
    }

    return () => {
      geometry.dispose();
      material.dispose();
      if (group) {
        group.remove(segments);
      }
    };
  }, [size.width, size.height]);

  useEffect(() => {
    if (lineMaterialRef.current) {
      lineMaterialRef.current.resolution.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  useFrame((_state: RootState, delta: number) => {
    if (!pointsRef.current) return;

    const posArray = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const lineArray = linePositionsBuffer.current;

    const directionSign = direction === 'backward' ? -1 : 1;
    const speedMultiplier = isWarping ? SPEED_MULTIPLIER_WARPING : SPEED_MULTIPLIER_IDLE;
    const frameDelta = delta * 60;

    const targetStreak = isWarping ? STREAK_LENGTH_WARP : STREAK_LENGTH_IDLE;
    currentStreakLength.current +=
      (targetStreak - currentStreakLength.current) * 0.08;
    const streak = currentStreakLength.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const velocity = starfield.speeds[i] * speedMultiplier * frameDelta * directionSign;
      posArray[i * 3 + 2] += velocity;

      if (direction === 'backward' && posArray[i * 3 + 2] < RESET_Z) {
        posArray[i * 3 + 2] = CAMERA_PASS_THRESHOLD;
        posArray[i * 3] = (Math.random() - 0.5) * SPREAD;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      } else if (direction === 'forward' && posArray[i * 3 + 2] > CAMERA_PASS_THRESHOLD) {
        posArray[i * 3 + 2] = RESET_Z;
        posArray[i * 3] = (Math.random() - 0.5) * SPREAD;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      }

      const headIdx = i * 6;
      const tailIdx = i * 6 + 3;

      lineArray[headIdx] = posArray[i * 3];
      lineArray[headIdx + 1] = posArray[i * 3 + 1];
      lineArray[headIdx + 2] = posArray[i * 3 + 2];

      lineArray[tailIdx] = posArray[i * 3];
      lineArray[tailIdx + 1] = posArray[i * 3 + 1];
      lineArray[tailIdx + 2] = posArray[i * 3 + 2] - velocity * streak * 30;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    if (lineGeometryRef.current) {
      lineGeometryRef.current.setPositions(lineArray);
    }

    if (pointsMaterialRef.current) {
      const targetSize = isWarping ? 0.65 : 0.40;
      pointsMaterialRef.current.size +=
        (targetSize - pointsMaterialRef.current.size) * 0.05;
    }

    if (lineMaterialRef.current) {
      const targetOpacity = isWarping ? 0.8 : 0.0;
      lineMaterialRef.current.opacity +=
        (targetOpacity - lineMaterialRef.current.opacity) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Glow points layer */}
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
          ref={pointsMaterialRef}
          size={0.18}
          color="#ffffff"
          map={glowTexture}
          transparent
          opacity={1}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
