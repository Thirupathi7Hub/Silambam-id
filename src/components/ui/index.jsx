// Reusable UI Components for TNSA App
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// ── GoldButton ──────────────────────────────────────────
export const GoldButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  size = 'md',
  variant = 'gold', // 'gold' | 'ghost' | 'danger'
  fullWidth = false,
  icon,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantClasses = {
    gold:  'bg-gold-gradient text-dark-900 shadow-gold hover:shadow-gold-lg',
    ghost: 'border border-white/20 text-white hover:border-gold/40 hover:bg-white/5 bg-transparent',
    danger:'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={clsx(
        'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2',
        'min-h-[48px] touch-target',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
};

// ── GlassCard ──────────────────────────────────────────
export const GlassCard = ({ children, className = '', gold = false, onClick, animate = true }) => {
  const Component = onClick ? motion.div : (animate ? motion.div : 'div');
  return (
    <Component
      onClick={onClick}
      initial={animate ? { opacity: 0, y: 12 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
      className={clsx(
        gold ? 'glass-card-gold' : 'glass-card',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </Component>
  );
};

// ── InputField ──────────────────────────────────────────
export const InputField = React.forwardRef(({
  label,
  error,
  icon,
  hint,
  className = '',
  required = false,
  ...props
}, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-medium text-white/80">
        {label} {required && <span className="text-gold">*</span>}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={clsx(
          'input-gold',
          icon && 'pl-10',
          error && 'border-red-500/60 focus:border-red-500',
          className
        )}
        {...props}
      />
    </div>
    {error && (
      <p className="text-red-400 text-xs flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
    {hint && !error && (
      <p className="text-white/40 text-xs">{hint}</p>
    )}
  </div>
));
InputField.displayName = 'InputField';

// ── SelectField ──────────────────────────────────────────
export const SelectField = React.forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  className = '',
  required = false,
  ...props
}, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-medium text-white/80">
        {label} {required && <span className="text-gold">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={clsx(
        'input-gold appearance-none',
        error && 'border-red-500/60',
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D4AF37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        backgroundSize: '16px',
        paddingRight: '40px',
      }}
      {...props}
    >
      <option value="" className="bg-bg-card text-white/40">{placeholder}</option>
      {options.map((opt) => (
        <option
          key={typeof opt === 'string' ? opt : opt.value}
          value={typeof opt === 'string' ? opt : opt.value}
          className="bg-bg-card text-white"
        >
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-400 text-xs">⚠ {error}</p>}
  </div>
));
SelectField.displayName = 'SelectField';

// ── TextareaField ──────────────────────────────────────────
export const TextareaField = React.forwardRef(({
  label,
  error,
  rows = 3,
  className = '',
  required = false,
  ...props
}, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-medium text-white/80">
        {label} {required && <span className="text-gold">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        'input-gold resize-none',
        error && 'border-red-500/60',
        className
      )}
      {...props}
    />
    {error && <p className="text-red-400 text-xs">⚠ {error}</p>}
  </div>
));
TextareaField.displayName = 'TextareaField';

// ── LoadingSkeleton ──────────────────────────────────────────
export const LoadingSkeleton = ({ lines = 3, className = '' }) => (
  <div className={clsx('space-y-3', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={clsx(
          'h-4 rounded shimmer',
          i === 0 ? 'w-3/4' : i % 3 === 0 ? 'w-1/2' : 'w-full'
        )}
      />
    ))}
  </div>
);

// ── CardSkeleton ──────────────────────────────────────────
export const CardSkeleton = () => (
  <div className="glass-card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded shimmer" />
        <div className="h-3 w-1/2 rounded shimmer" />
      </div>
    </div>
    <LoadingSkeleton lines={2} />
  </div>
);

// ── EmptyState ──────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    {icon && (
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gold/60">
        {icon}
      </div>
    )}
    <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
    {description && (
      <p className="text-white/50 text-sm max-w-xs mb-6">{description}</p>
    )}
    {action}
  </motion.div>
);

// ── StatsCard ──────────────────────────────────────────
export const StatsCard = ({ icon, label, value, change, color = 'gold' }) => {
  const colors = {
    gold:  { bg: 'rgba(212,175,55,0.1)', text: '#D4AF37', border: 'rgba(212,175,55,0.2)' },
    green: { bg: 'rgba(34,197,94,0.1)',  text: '#4ade80', border: 'rgba(34,197,94,0.2)' },
    blue:  { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
    purple:{ bg: 'rgba(168,85,247,0.1)', text: '#c084fc', border: 'rgba(168,85,247,0.2)' },
  };
  const c = colors[color] || colors.gold;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
        >
          {icon}
        </div>
        {change !== undefined && (
          <span className={clsx(
            'text-xs font-medium px-2 py-1 rounded-full',
            change >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          )}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-white/50 text-xs mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
};

// ── Badge ──────────────────────────────────────────
export const Badge = ({ children, variant = 'gold' }) => {
  const classes = {
    gold:     'badge-gold',
    active:   'badge-active',
    inactive: 'badge-inactive',
    pending:  'badge-pending',
  };
  return (
    <span className={classes[variant] || 'badge-gold'}>
      {children}
    </span>
  );
};

// ── Avatar ──────────────────────────────────────────
export const Avatar = ({ src, name, size = 'md' }) => {
  const sizeClasses = {
    sm:   'w-8 h-8 text-xs',
    md:   'w-10 h-10 text-sm',
    lg:   'w-16 h-16 text-xl',
    xl:   'w-24 h-24 text-3xl',
    '2xl':'w-32 h-32 text-4xl',
  };

  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Member'}
        className={clsx(
          'rounded-full object-cover flex-shrink-0',
          'border-2 border-gold/30',
          sizeClasses[size]
        )}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  return (
    <div className={clsx(
      'rounded-full flex items-center justify-center font-bold flex-shrink-0',
      'border-2 border-gold/30',
      sizeClasses[size]
    )}
      style={{ background: 'linear-gradient(135deg, #D4AF37, #A88B2A)', color: '#0a0a0a' }}
    >
      {initials}
    </div>
  );
};

// ── ProgressBar (multi-step form) ──────────────────────────────────────────
export const ProgressBar = ({ current, total, labels = [] }) => {
  const progress = ((current - 1) / (total - 1)) * 100;

  return (
    <div className="space-y-3">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {Array.from({ length: total }).map((_, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  i + 1 < current  && 'bg-gold-gradient text-dark-900',
                  i + 1 === current && 'bg-gold-gradient text-dark-900 shadow-gold',
                  i + 1 > current  && 'bg-white/10 text-white/40 border border-white/10',
                )}
              >
                {i + 1 < current ? '✓' : i + 1}
              </div>
              {labels[i] && (
                <span className={clsx(
                  'text-xs hidden sm:block',
                  i + 1 <= current ? 'text-gold' : 'text-white/30'
                )}>
                  {labels[i]}
                </span>
              )}
            </div>
            {i < total - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-gradient rounded-full transition-all duration-500"
                  style={{ width: i + 1 < current ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Text progress */}
      <p className="text-center text-sm text-white/50">
        Step <span className="text-gold font-semibold">{current}</span> of {total}
      </p>
    </div>
  );
};

// ── Divider ──────────────────────────────────────────
export const GoldDivider = ({ label }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))' }} />
    {label && <span className="text-white/40 text-xs px-2">{label}</span>}
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
  </div>
);

// ── Section Title ──────────────────────────────────────────
export const SectionTitle = ({ children, subtitle, action }) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h2 className="text-lg font-bold text-white">{children}</h2>
      {subtitle && <p className="text-white/50 text-sm mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);
