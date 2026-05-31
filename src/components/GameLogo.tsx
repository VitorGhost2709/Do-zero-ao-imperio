import gameIcon from '../assets/iconedo0aoimperio.png';

const SIZES = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-16 w-16 rounded-2xl',
} as const;

interface GameLogoProps {
  size?: keyof typeof SIZES;
  className?: string;
  animated?: boolean;
}

export function GameLogo({
  size = 'md',
  className = '',
  animated = false,
}: GameLogoProps) {
  return (
    <img
      src={gameIcon}
      alt="Do Zero ao Império"
      className={`shrink-0 object-cover shadow-[0_0_20px_rgba(232,184,74,0.15)] ${SIZES[size]} ${className} ${animated ? 'animate-pulse' : ''}`}
    />
  );
}

export { gameIcon };
