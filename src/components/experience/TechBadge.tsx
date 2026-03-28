type TechBadgeProps = {
  name: string
}

export function TechBadge({ name }: TechBadgeProps) {
  return (
    <span className="bg-white/5 border border-white/10 text-white/60 text-xs px-2.5 py-0.5 rounded-full">
      {name}
    </span>
  );
}
