import {Img, staticFile} from 'remotion';
import type {ResolvedClip, ResolvedScene} from '../core/resolve';
import {layoutFor} from '../layout';
import {Feature} from './Feature';
import {Center, Words} from './parts';

const Hook: React.FC<{scene: Extract<ResolvedScene, {type: 'hook'}>; clip: ResolvedClip}> = ({scene, clip}) => {
  const {center} = layoutFor(clip);
  return (
    <Center>
      <Words text={scene.text} size={center.hookSize} padX={center.padX} />
    </Center>
  );
};

const Cta: React.FC<{scene: Extract<ResolvedScene, {type: 'cta'}>; clip: ResolvedClip}> = ({scene, clip}) => {
  const {center} = layoutFor(clip);
  return (
    <Center>
      {clip.logo && <Img src={staticFile(clip.logo)} style={{width: center.logo, height: center.logo, borderRadius: center.logo * 0.23}} />}
      <Words text={scene.text} size={center.ctaSize} padX={center.padX} />
      {scene.sub.map((line, i) => (
        <div key={i} style={i === 0 ? {fontSize: center.subSize, fontWeight: 800, color: clip.theme.accent} : {fontSize: center.sub2Size, fontWeight: 600, opacity: 0.85}}>
          {line}
        </div>
      ))}
    </Center>
  );
};

// scene type -> component; add a new scene type here and in the schema
export const SceneView: React.FC<{scene: ResolvedScene; clip: ResolvedClip}> = ({scene, clip}) => {
  if (scene.type === 'hook') return <Hook scene={scene} clip={clip} />;
  if (scene.type === 'feature') return <Feature scene={scene} clip={clip} />;
  return <Cta scene={scene} clip={clip} />;
};
