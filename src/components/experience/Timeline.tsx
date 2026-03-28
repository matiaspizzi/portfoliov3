import { motion } from 'framer-motion';
import { GraduationCap, ExternalLink } from 'lucide-react';
import { TimelineItem } from './TimelineItem';
import { experiences, education, certifications } from '../../data/experience';

const EASE = [0.16, 1, 0.3, 1] as const;

const DEFAULT_BADGE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>'
);

export function Timeline() {
  const certOffset = experiences.length + education.length;

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />

      {/* Experience entries */}
      {experiences.map((entry, i) => (
        <TimelineItem key={entry.title + entry.period} entry={entry} index={i} />
      ))}

      {/* Education */}
      {education.map((edu, i) => (
        <motion.div
          key={edu.institution}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: (experiences.length + i) * 0.1, ease: EASE }}
          className="relative pl-8 pb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (experiences.length + i) * 0.1 + 0.2, ease: EASE }}
            className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-white/80 border-2 border-white/20 -translate-x-1/2 flex items-center justify-center"
          >
            <GraduationCap className="w-2 h-2 text-white/60" />
          </motion.div>

          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white">{edu.title}</h3>
            <p className="text-sm text-white/50">{edu.institution}</p>
            <p className="text-xs text-white/30 uppercase tracking-wider">
              {edu.period} &middot; {edu.location}
            </p>
          </div>
        </motion.div>
      ))}

      {/* Certifications */}
      {certifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: certOffset * 0.1, ease: EASE }}
          className="relative pl-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: certOffset * 0.1 + 0.2, ease: EASE }}
            className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-white/80 border-2 border-white/20 -translate-x-1/2"
          />

          <h3 className="text-2xl md:text-xl font-bold text-white mb-6" style={{ fontFamily: 'Adam, sans-serif' }}>Certifications</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert, i) => (
              <motion.a
                key={cert.name}
                href={cert.credlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (certOffset + i) * 0.1, ease: EASE }}
                className="group flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/6 hover:bg-white/6 hover:border-white/12 transition-all cursor-pointer"
              >
                <img
                  src={cert.badgeImage || DEFAULT_BADGE}
                  alt={cert.name}
                  className="w-16 h-16 object-contain shrink-0"
                />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                    {cert.name}
                  </span>
                  {cert.credlyUrl && (
                    <span className="flex items-center gap-1 text-xs text-white/30 group-hover:text-white/50 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      View credential
                    </span>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
