import { motion } from 'framer-motion';
import { Timeline } from '../components/experience/Timeline';

const EASE = [0.16, 1, 0.3, 1] as const;

export function ExperienceSection() {
  return (
    <div className="relative w-full min-h-screen">
      <div className="relative z-10 flex flex-col max-w-4xl mx-auto px-6 py-24">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-16"
          style={{ fontFamily: 'Adam, sans-serif' }}
        >
          Experience
        </motion.h2>

        <Timeline />
      </div>
    </div>
  );
}
