import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {ResolvedClip, ResolvedScene} from '../core/resolve';
import {Icon} from '../components/icons';
import {layoutFor} from '../layout';
import {SETS} from '../sets';
import {Center, Words} from './parts';

type S<T extends ResolvedScene['type']> = {scene: Extract<ResolvedScene, {type: T}>; clip: ResolvedClip};

const useSpring = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 14}});
};

const Pop: React.FC<{delay: number; from?: 'left' | 'right' | 'up'; children: React.ReactNode; style?: React.CSSProperties}> = ({delay, from = 'up', children, style}) => {
  const s = useSpring(delay);
  const dx = from === 'left' ? -80 : from === 'right' ? 80 : 0;
  const dy = from === 'up' ? 50 : 0;
  return <div style={{opacity: s, transform: `translate(${(1 - s) * dx}px, ${(1 - s) * dy}px)`, ...style}}>{children}</div>;
};

export const Stat: React.FC<S<'stat'>> = ({scene, clip}) => {
  const {center} = layoutFor(clip);
  const s = useSpring();
  return (
    <Center blurIn={SETS[clip.setId].look.blurIn}>
      <div style={{fontSize: center.hookSize * 1.8, fontWeight: 800, lineHeight: 1, color: clip.theme.accent, transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`, opacity: s, textShadow: `0 0 60px ${clip.theme.accent}66`}}>
        {scene.value}
      </div>
      <Words text={scene.label} size={center.ctaSize * 0.6} delay={8} padX={center.padX} />
    </Center>
  );
};

export const Quote: React.FC<S<'quote'>> = ({scene, clip}) => {
  const {center} = layoutFor(clip);
  return (
    <Center blurIn={SETS[clip.setId].look.blurIn}>
      <Pop delay={0} style={{fontSize: center.hookSize * 1.6, lineHeight: 0.6, fontWeight: 800, color: clip.theme.accent}}>“</Pop>
      <Words text={scene.text} size={center.hookSize * 0.7} padX={center.padX} />
      {scene.author && (
        <Pop delay={18} style={{fontSize: center.sub2Size, fontWeight: 600, opacity: 0.8}}>
          {scene.author}
        </Pop>
      )}
    </Center>
  );
};

export const Outro: React.FC<S<'outro'>> = ({scene, clip}) => {
  const {center} = layoutFor(clip);
  return (
    <Center blurIn={SETS[clip.setId].look.blurIn}>
      {clip.logo && <Img src={staticFile(clip.logo)} style={{width: center.logo, height: center.logo, borderRadius: center.logo * 0.23}} />}
      <Words text={clip.brandName} size={center.ctaSize} padX={center.padX} />
      {scene.text && (
        <Pop delay={14} style={{fontSize: center.sub2Size, fontWeight: 600, opacity: 0.85}}>
          {scene.text}
        </Pop>
      )}
    </Center>
  );
};

// UI card rebuilt from theme tokens (no screenshot): checklist or chat bubbles
export const UiCard: React.FC<S<'ui-card'>> = ({scene, clip}) => {
  const {center} = layoutFor(clip);
  const {accent, bg} = clip.theme;
  const u = Math.min(clip.width, clip.height);
  const width = Math.min(clip.width * 0.86, u * (clip.layout === 'landscape' ? 1.15 : 0.9));
  const font = center.sub2Size * 1.35;
  return (
    <Center blurIn={SETS[clip.setId].look.blurIn}>
      <Pop
        delay={0}
        style={{
          width,
          padding: font * 0.9,
          borderRadius: font * 0.9,
          background: 'linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.05))',
          border: '2px solid rgba(255,255,255,.28)',
          boxShadow: `0 ${font}px ${font * 2}px rgba(0,0,0,.35), 0 0 ${font * 2}px ${accent}33`,
          display: 'flex',
          flexDirection: 'column',
          gap: font * 0.6,
        }}
      >
        {scene.title && <div style={{fontSize: font * 1.15, fontWeight: 800, marginBottom: font * 0.2}}>{scene.title}</div>}
        {scene.items.map((item, i) =>
          scene.kind === 'list' ? (
            <Pop key={i} delay={10 + i * 8} from="left" style={{display: 'flex', alignItems: 'center', gap: font * 0.6, fontSize: font, fontWeight: 600}}>
              <div style={{width: font * 1.5, height: font * 1.5, flex: 'none', borderRadius: '50%', background: accent, color: bg[0], display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon id="check" size={font * 0.95} color={bg[0]} />
              </div>
              {item}
            </Pop>
          ) : (
            <Pop key={i} delay={10 + i * 12} from={i % 2 ? 'right' : 'left'} style={{alignSelf: i % 2 ? 'flex-end' : 'flex-start', maxWidth: '82%'}}>
              <div
                style={{
                  padding: `${font * 0.5}px ${font * 0.8}px`,
                  borderRadius: font * 0.9,
                  fontSize: font,
                  fontWeight: 600,
                  background: i % 2 ? accent : 'rgba(255,255,255,.14)',
                  color: i % 2 ? bg[0] : 'inherit',
                }}
              >
                {item}
              </div>
            </Pop>
          ),
        )}
      </Pop>
    </Center>
  );
};
