import { useRef, useMemo } from 'react';
import { useFrame, type RootState } from '@react-three/fiber';
import * as THREE from 'three';

const NEBULA_TEXTURE_SIZE = 128;

interface NebulaBlob {
  readonly position: [number, number, number];
  readonly scale: number;
  readonly rotationSpeed: number;
  readonly opacity: number;
  readonly color: string;
}

/** Pre-defined nebula cloud configurations. */
const NEBULA_BLOBS: readonly NebulaBlob[] = [
  { position: [-6, 3, -15], scale: 14, rotationSpeed: 0.002, opacity: 0.40, color: '#2a2a6e' },
  { position: [7, -4, -20], scale: 18, rotationSpeed: -0.0015, opacity: 0.34, color: '#2e2e80' },
  { position: [0, 5, -25], scale: 22, rotationSpeed: 0.001, opacity: 0.30, color: '#24245e' },
  { position: [-8, -6, -18], scale: 16, rotationSpeed: -0.0025, opacity: 0.36, color: '#2c2c68' },
  { position: [5, 2, -22], scale: 20, rotationSpeed: 0.0018, opacity: 0.32, color: '#282878' },
  { position: [-3, -2, -30], scale: 25, rotationSpeed: -0.001, opacity: 0.26, color: '#22225a' },
];

/** Creates a soft, cloud-like radial gradient texture. */
function createNebulaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = NEBULA_TEXTURE_SIZE;
  canvas.height = NEBULA_TEXTURE_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context for nebula texture.');

  const center = NEBULA_TEXTURE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);

  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.15)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, NEBULA_TEXTURE_SIZE, NEBULA_TEXTURE_SIZE);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Renders subtle, slowly-rotating nebula clouds in the background.
 * Uses billboard sprites with soft radial gradients and additive blending
 * for a faint cosmic fog effect that breaks up the flat black.
 */
export function NebulaBackground(): React.JSX.Element {
  const spritesRef = useRef<(THREE.Sprite | null)[]>([]);
  const nebulaTexture = useMemo(() => createNebulaTexture(), []);

  useFrame((_state: RootState, delta: number) => {
    for (let i = 0; i < NEBULA_BLOBS.length; i++) {
      const sprite = spritesRef.current[i];
      if (sprite) {
        sprite.material.rotation += NEBULA_BLOBS[i].rotationSpeed * delta * 60;
      }
    }
  });

  return (
    <group>
      {NEBULA_BLOBS.map((blob, index) => (
        <sprite
          key={`nebula-${blob.position[0]}-${blob.position[1]}`}
          ref={(el) => { spritesRef.current[index] = el; }}
          position={blob.position}
          scale={[blob.scale, blob.scale, 1]}
        >
          <spriteMaterial
            map={nebulaTexture}
            color={blob.color}
            transparent
            opacity={blob.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}
