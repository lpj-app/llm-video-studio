import {AbsoluteFill, Series} from 'remotion';
import type {FormatId} from './core/ids';
import type {ResolvedClip} from './core/resolve';
import {fontFamily} from './fonts';
import {SceneView} from './scenes';
import {SETS} from './sets';

// clip = "<product>/<clip>"; resolved is filled by calculateMetadata in Root
export type VideoProps = {clip: string; format: FormatId; lang: string; theme?: string; resolved?: ResolvedClip};

export const Video: React.FC<VideoProps> = ({resolved}) => {
  if (!resolved) return null;
  const Stage = SETS[resolved.setId];
  return (
    <AbsoluteFill style={{color: resolved.theme.text, fontFamily}}>
      <Stage theme={resolved.theme} />
      <Series>
        {resolved.scenes.map((scene, i) => (
          <Series.Sequence key={i} durationInFrames={scene.frames}>
            <SceneView scene={scene} clip={resolved} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
