import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// Word-by-word pop-in
export const Words: React.FC<{text: string; size: number; delay?: number; align?: 'center' | 'left'; padX?: number}> = ({
  text,
  size,
  delay = 0,
  align = 'center',
  padX = 140,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'left' ? 'flex-start' : 'center',
        gap: `0 ${size * 0.25}px`,
        padding: `0 ${padX}px`,
        textAlign: align,
      }}
    >
      {text.split(' ').map((w, i) => {
        const s = spring({frame: frame - delay - i * 3, fps, config: {damping: 14}});
        return (
          <span key={i} style={{fontSize: size, fontWeight: 800, lineHeight: 1.1, display: 'inline-block', opacity: s, transform: `translateY(${(1 - s) * 60}px)`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const FadeOut: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <AbsoluteFill style={{opacity: interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'})}}>{children}</AbsoluteFill>;
};

export const Ring: React.FC<{x: number; y: number; size: number; color: string; delay: number}> = ({x, y, size, color, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12}});
  const ping = ((frame - delay) % 45) / 45;
  const base = {position: 'absolute', left: `${x}%`, top: `${y}%`, width: size, height: size, borderRadius: '50%', border: `8px solid ${color}`} as const;
  return (
    <>
      <div style={{...base, transform: `translate(-50%,-50%) scale(${s})`, boxShadow: `0 0 40px ${color}`}} />
      <div style={{...base, opacity: s * (1 - ping), transform: `translate(-50%,-50%) scale(${1 + ping})`}} />
    </>
  );
};

export const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <FadeOut>
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40}}>{children}</AbsoluteFill>
  </FadeOut>
);
