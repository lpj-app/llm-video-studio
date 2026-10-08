import {createContext, useContext} from 'react';
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

// set when the clip uses transitions: scenes then skip their own fade-out
export const TransitionContext = createContext(false);

// fades out at the end of a scene; blurIn adds a soft blur-and-lift entrance
export const FadeOut: React.FC<{children: React.ReactNode; blurIn?: boolean}> = ({children, blurIn}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const transitions = useContext(TransitionContext);
  const out = transitions ? 1 : interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  const inn = blurIn ? interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  const blur = blurIn ? (1 - inn) * 14 + (1 - out) * 10 : 0;
  return (
    <AbsoluteFill style={{opacity: out * inn, filter: blur > 0.1 ? `blur(${blur}px)` : undefined, transform: blurIn ? `translateY(${(1 - inn) * 24}px) scale(${1 + (1 - out) * 0.03})` : undefined}}>
      {children}
    </AbsoluteFill>
  );
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

export const Center: React.FC<{children: React.ReactNode; blurIn?: boolean}> = ({children, blurIn}) => (
  <FadeOut blurIn={blurIn}>
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40}}>{children}</AbsoluteFill>
  </FadeOut>
);
