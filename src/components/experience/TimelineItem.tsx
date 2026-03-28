import { motion } from 'framer-motion';
import { TechBadge } from './TechBadge';
import type { ExperienceEntry } from '../../data/experience';

const EASE = [0.16, 1, 0.3, 1] as const;

type TimelineItemProps = {
  entry: ExperienceEntry
  index: number
}

export function TimelineItem({ entry, index }: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
      className="relative pl-8 pb-12 last:pb-0"
    >
      {/* Dot */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 + 0.2, ease: EASE }}
        className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-white/80 border-2 border-white/20 -translate-x-1/2"
      />

      {/* Header */}
      <div className="flex flex-col gap-1 mb-3">
        <h3 className="text-lg font-bold text-white">{entry.title}</h3>
        <p className="text-sm text-white/50">
          {entry.company}
          {entry.companyDetail && (
            <span className="text-white/30"> ({entry.companyDetail})</span>
          )}
        </p>
        <p className="text-xs text-white/30 uppercase tracking-wider">
          {entry.period} &middot; {entry.location}
        </p>
      </div>

      {/* Bullets */}
      <ul className="flex flex-col gap-2 mb-4">
        {entry.bullets.map((bullet, i) => (
          <li key={i} className="text-sm text-white/60 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/20">
            {bullet}
          </li>
        ))}
      </ul>

      {/* Tech */}
      <div className="flex flex-wrap gap-2">
        {entry.tech.map((t) => (
          <TechBadge key={t} name={t} />
        ))}
      </div>
    </motion.div>
  );
}
