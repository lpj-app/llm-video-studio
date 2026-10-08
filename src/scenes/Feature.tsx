import {Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {GlassIcon} from '../components/GlassIcon';
import {Note} from '../components/Note';
import type {ResolvedClip, ResolvedScene} from '../core/resolve';
import {layoutFor} from '../layout';
import {SETS} from '../sets';
import {FadeOut, Ring, Words} from './parts';

const media = {width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'} as const;
const pad = (n: number) => String(n).padStart(2, '0');

export type Step = {index: number; total: number};

export const Feature: React.FC<{scene: Extract<ResolvedScene, {type: 'feature'}>; clip: ResolvedClip; step: Step}> = ({scene, clip, step}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {theme} = clip;
  const look = SETS[clip.setId].look;
  const showNote = look.glass && Boolean(scene.note);
  const L = layoutFor(clip, {note: showNote});
  const enter = spring({frame, fps, config: {damping: 200}});
  const width = L.phone.width;
  const rotY = interpolate(enter, [0, 1], [-25, -8]) + Math.sin(frame / 25) * 2;
  const {title} = L;
  return (
    <FadeOut blurIn={look.blurIn}>
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
        {showNote && scene.note && (
          <div style={{marginTop: -8}}>
            <Note text={scene.note} size={L.noteSize} color={theme.ring ?? theme.accent} arrow={clip.layout === 'landscape' ? 'right' : 'down'} />
          </div>
        )}
      </div>
      {look.glass && scene.icon && (
        <div style={{position: 'absolute', left: L.icon.x - 110, top: L.icon.y - L.icon.size / 2, width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
          <GlassIcon icon={scene.icon} size={L.icon.size} accent={theme.accent} />
          <div style={{fontSize: 28, fontWeight: 600, letterSpacing: '0.1em', whiteSpace: 'nowrap', opacity: interpolate(frame, [20, 34], [0, 0.75], {extrapolateRight: 'clamp'})}}>
            {pad(step.index)} / {pad(step.total)}
          </div>
        </div>
      )}
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
            boxShadow: look.glass ? `0 60px 120px rgba(0,0,0,.55), 0 0 90px ${theme.accent}44` : '0 60px 120px rgba(0,0,0,.55)',
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
