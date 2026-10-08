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
  const {Stage} = SETS[resolved.setId];
  const total = resolved.scenes.filter((s) => s.type === 'feature').length;
  let seen = 0;
  return (
    <AbsoluteFill style={{color: resolved.theme.text, fontFamily}}>
      <Stage theme={resolved.theme} clip={resolved} />
      <Series>
        {resolved.scenes.map((scene, i) => {
          if (scene.type === 'feature') seen++;
          return (
            <Series.Sequence key={i} durationInFrames={scene.frames}>
              <SceneView scene={scene} clip={resolved} step={{index: seen, total}} />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
