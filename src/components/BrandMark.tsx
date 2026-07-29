interface Props {
  /** Height of the UN emblem in pixels. */
  emblemSize?: number;
  /** Show "Nexus" wordmark beside the emblem. */
  showName?: boolean;
  /** White emblem for dark backgrounds; blue for light. */
  variant?: 'light' | 'dark';
  className?: string;
  nameClassName?: string;
}

export default function BrandMark({
  emblemSize = 32,
  showName = true,
  variant = 'dark',
  className = '',
  nameClassName = '',
}: Props) {
  const emblemClass =
    variant === 'light' ? 'brand-emblem brand-emblem-light' : 'brand-emblem';

  return (
    <div className={`brand-mark ${className}`.trim()}>
      <img
        src="/un/emblem.svg"
        alt="United Nations"
        width={emblemSize}
        height={Math.round(emblemSize * (400 / 470))}
        className={emblemClass}
        draggable={false}
      />
      {showName && (
        <span className={`brand-name ${nameClassName}`.trim()}>Nexus</span>
      )}
    </div>
  );
}
