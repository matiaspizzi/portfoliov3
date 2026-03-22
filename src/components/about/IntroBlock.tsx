import { motion } from 'framer-motion';
import { Flame, Music, Plane, Waves } from 'lucide-react';

const HOBBIES = [
  { icon: Waves, label: 'Kayak' },
  { icon: Flame, label: 'Asados' },
  { icon: Plane, label: 'Travel' },
  { icon: Music, label: 'Music' },
] as const;

export function IntroBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center gap-6 max-w-2xl mx-auto min-h-screen"
    >
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: 'Adam, sans-serif' }}>
        About Me
      </h2>

      <p className="text-lg md:text-xl text-white/70 leading-relaxed">
        I'm <span className="text-white font-medium">Matias Pizzi</span>, a Fullstack Developer
        from Buenos Aires, Argentina. Currently studying Systems Engineering
        at UNLaM. I love building things for the web and exploring new technologies.
      </p>

      <div className="flex gap-8 mt-4">
        {HOBBIES.map(({ icon: Icon, label }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-2 text-white/50 hover:text-white/90 transition-colors"
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs uppercase tracking-widest">{label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
