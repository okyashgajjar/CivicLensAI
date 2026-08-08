interface IconProps {
  readonly name: string;
  readonly className?: string;
  readonly filled?: boolean;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', filled = false }) => {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'fill-icon' : ''} ${className}`}
      style={filled ? undefined : { fontVariationSettings: "'FILL' 0" }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
