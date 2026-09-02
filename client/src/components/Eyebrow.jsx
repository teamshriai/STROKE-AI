export default function Eyebrow({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-px w-8 bg-crimson/40" aria-hidden="true"></span>
      <span className="text-xs font-medium uppercase tracking-[0.22em] text-crimson">{children}</span>
    </div>
  );
}
