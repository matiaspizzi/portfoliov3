import { motion } from 'framer-motion';

// Placeholder photos — replace with real images from src/assets/photos/
const PHOTOS = [
  { src: 'https://placehold.co/400x500/1a1a2e/ffffff?text=Kayak', alt: 'Kayak' },
  { src: 'https://placehold.co/400x300/1a1a2e/ffffff?text=Asado', alt: 'Asado' },
  { src: 'https://placehold.co/400x450/1a1a2e/ffffff?text=Travel+1', alt: 'Travel' },
  { src: 'https://placehold.co/400x350/1a1a2e/ffffff?text=Travel+2', alt: 'Travel' },
  { src: 'https://placehold.co/400x400/1a1a2e/ffffff?text=Friends', alt: 'Friends' },
  { src: 'https://placehold.co/400x500/1a1a2e/ffffff?text=Adventure', alt: 'Adventure' },
] as const;

export function PhotoGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6"
    >
      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-center" style={{ fontFamily: 'Adam, sans-serif' }}>
        Life Outside Code
      </h3>

      <div className="columns-2 md:columns-3 gap-4">
        {PHOTOS.map((photo, index) => (
          <motion.div
            key={photo.alt + index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="break-inside-avoid mb-4"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full rounded-lg hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
