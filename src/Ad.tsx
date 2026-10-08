import {AbsoluteFill, Img, OffthreadVideo, Series, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';
import type {AdProps, Scene, Theme} from './types';

const {fontFamily} = loadFont('normal', {weights: ['600', '800']});

const DEFAULT_SECONDS = {hook: 2.5, feature: 3.5, cta: 2.5};
export const sceneFrames = (s: Scene, fps: number) => Math.round((s.seconds ?? DEFAULT_SECONDS[s.type]) * fps);

// Word-by-word pop-in
const Words: React.FC<{text: string; size: number; delay?: number}> = ({text, size, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.25}px`, padding: '0 140px', textAlign: 'center'}}>
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

const FadeOut: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <AbsoluteFill style={{opacity: interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'})}}>{children}</AbsoluteFill>;
};

const Ring: React.FC<{x: number; y: number; size: number; accent: string; delay: number}> = ({x, y, size, accent, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12}});
  const ping = ((frame - delay) % 45) / 45;
  const base = {position: 'absolute', left: `${x}%`, top: `${y}%`, width: size, height: size, borderRadius: '50%', border: `8px solid ${accent}`} as const;
  return (
    <>
      <div style={{...base, transform: `translate(-50%,-50%) scale(${s})`, boxShadow: `0 0 40px ${accent}`}} />
      <div style={{...base, opacity: s * (1 - ping), transform: `translate(-50%,-50%) scale(${1 + ping})`}} />
    </>
  );
};

const media = {width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'} as const;

const Feature: React.FC<{scene: Extract<Scene, {type: 'feature'}>; theme: Theme; dir: string}> = ({scene, theme, dir}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200}});
  const width = 760;
  const rotY = interpolate(enter, [0, 1], [-25, -8]) + Math.sin(frame / 25) * 2;
  return (
    <FadeOut>
      <div style={{position: 'absolute', top: 130, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
        <Words text={scene.title} size={88} />
        {scene.subtitle && <div style={{fontSize: 44, fontWeight: 600, opacity: interpolate(frame, [15, 30], [0, 0.8], {extrapolateRight: 'clamp'})}}>{scene.subtitle}</div>}
      </div>
      <div style={{position: 'absolute', left: '50%', top: height * 0.29, perspective: 2400}}>
        <div
          style={{
            position: 'relative', width, height: width * 2.23, marginLeft: -width / 2, overflow: 'hidden',
            borderRadius: 96, border: '14px solid #0b0b0f', background: '#000', boxShadow: '0 60px 120px rgba(0,0,0,.55)',
            transform: `translateY(${(1 - enter) * 500}px) rotateX(6deg) rotateY(${rotY}deg)`,
          }}
        >
          {scene.video ? (
            <OffthreadVideo src={staticFile(`${dir}/${scene.video}`)} trimBefore={Math.round((scene.from ?? 0) * fps)} muted style={media} />
          ) : (
            <Img src={staticFile(`${dir}/${scene.image}`)} style={media} />
          )}
          {scene.highlight && <Ring {...scene.highlight} size={scene.highlight.size ?? 150} accent={theme.ring ?? theme.accent} delay={25} />}
        </div>
      </div>
    </FadeOut>
  );
};

const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <FadeOut>
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40}}>{children}</AbsoluteFill>
  </FadeOut>
);

export const Ad: React.FC<AdProps> = ({video, config}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!config) return null;
  const {theme, scenes, logo} = config;
  const dir = `videos/${video}`;
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${theme.bg[0]}, ${theme.bg[1]})`, color: theme.text, fontFamily}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${50 + Math.sin(frame / 60) * 30}% ${35 + Math.cos(frame / 75) * 15}%, ${theme.accent}40, transparent 55%)`}} />
      <Series>
        {scenes.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={sceneFrames(s, fps)}>
            {s.type === 'hook' && (
              <Center>
                <Words text={s.text} size={120} />
              </Center>
            )}
            {s.type === 'feature' && <Feature scene={s} theme={theme} dir={dir} />}
            {s.type === 'cta' && (
              <Center>
                {logo && <Img src={staticFile(`${dir}/${logo}`)} style={{width: 220, height: 220, borderRadius: 50}} />}
                <Words text={s.text} size={110} />
                {[s.sub ?? []].flat().map((line, j) => (
                  <div key={j} style={j === 0 ? {fontSize: 72, fontWeight: 800, color: theme.accent} : {fontSize: 46, fontWeight: 600, opacity: 0.85}}>
                    {line}
                  </div>
                ))}
              </Center>
            )}
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
