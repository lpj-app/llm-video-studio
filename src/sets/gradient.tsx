import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {Theme} from '../core/schema';

export const GradientStage: React.FC<{theme: Theme}> = ({theme}) => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(160deg, ${theme.bg[0]}, ${theme.bg[1]})`}} />
      <AbsoluteFill
        style={{background: `radial-gradient(circle at ${50 + Math.sin(frame / 60) * 30}% ${35 + Math.cos(frame / 75) * 15}%, ${theme.accent}40, transparent 55%)`}}
      />
    </>
  );
};
