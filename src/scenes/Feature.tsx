import {Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {ResolvedClip, ResolvedScene} from '../core/resolve';
import {layoutFor} from '../layout';
import {FadeOut, Ring, Words} from './parts';

const media = {width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'} as const;

export const Feature: React.FC<{scene: Extract<ResolvedScene, {type: 'feature'}>; clip: ResolvedClip}> = ({scene, clip}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {theme} = clip;
  const L = layoutFor(clip);
  const enter = spring({frame, fps, config: {damping: 200}});
  const width = L.phone.width;
  const rotY = interpolate(enter, [0, 1], [-25, -8]) + Math.sin(frame / 25) * 2;
  const {title} = L;
  return (
    <FadeOut>
      <div
        style={{
          position: 'absolute',
          top: title.top,
          left: title.left,
          width: title.width,
          display: 'flex',
          flexDirection: 'column',
          alignItems: title.align === 'left' ? 'flex-start' : 'center',
          gap: 28,
        }}
      >
        <Words text={scene.title} size={title.size} align={title.align} padX={title.align === 'left' ? 0 : 140} />
        {scene.subtitle && (
          <div style={{fontSize: title.subtitleSize, fontWeight: 600, opacity: interpolate(frame, [15, 30], [0, 0.8], {extrapolateRight: 'clamp'})}}>{scene.subtitle}</div>
        )}
      </div>
      <div style={{position: 'absolute', left: L.phone.centerX, top: L.phone.top, perspective: 2400}}>
        <div
          style={{
            position: 'relative',
            width,
            height: width * 2.23,
            marginLeft: -width / 2,
            overflow: 'hidden',
            borderRadius: width * 0.126,
            border: `${Math.round(width * 0.018)}px solid ${theme.frame ?? '#0b0b0f'}`,
            background: '#000',
            boxShadow: '0 60px 120px rgba(0,0,0,.55)',
            transform: `translateY(${(1 - enter) * 500}px) rotateX(6deg) rotateY(${rotY}deg)`,
          }}
        >
          {scene.media.kind === 'video' ? (
            <OffthreadVideo src={staticFile(scene.media.src)} trimBefore={Math.round(scene.media.from * fps)} muted style={media} />
          ) : (
            <Img src={staticFile(scene.media.src)} style={media} />
          )}
          {scene.highlight && <Ring {...scene.highlight} size={scene.highlight.size ?? 150} color={theme.ring ?? theme.accent} delay={25} />}
        </div>
      </div>
    </FadeOut>
  );
};
