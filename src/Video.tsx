import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {AbsoluteFill, Series} from 'remotion';
import type {FormatId} from './core/ids';
import {type ResolvedClip, TRANSITION_FRAMES} from './core/resolve';
import {fontFamily} from './fonts';
import {SceneView} from './scenes';
import {TransitionContext} from './scenes/parts';
import {SETS} from './sets';

// clip = "<product>/<clip>"; resolved is filled by calculateMetadata in Root
export type VideoProps = {clip: string; format: FormatId; lang: string; theme?: string; resolved?: ResolvedClip};

export const Video: React.FC<VideoProps> = ({resolved}) => {
  if (!resolved) return null;
  const {Stage} = SETS[resolved.setId];
  const total = resolved.scenes.filter((s) => s.type === 'feature').length;
  const view = (i: number) => {
    const seen = resolved.scenes.slice(0, i + 1).filter((s) => s.type === 'feature').length;
    return <SceneView scene={resolved.scenes[i]} clip={resolved} step={{index: seen, total}} />;
  };
  const timing = linearTiming({durationInFrames: TRANSITION_FRAMES});
  const presentation = resolved.transition === 'slide' ? slide({direction: 'from-right'}) : fade();
  return (
    <AbsoluteFill style={{color: resolved.theme.text, fontFamily}}>
      <Stage theme={resolved.theme} clip={resolved} />
      {resolved.transition === 'none' ? (
        <Series>
          {resolved.scenes.map((scene, i) => (
            <Series.Sequence key={i} durationInFrames={scene.frames}>
              {view(i)}
            </Series.Sequence>
          ))}
        </Series>
      ) : (
        <TransitionContext.Provider value={true}>
          <TransitionSeries>
            {resolved.scenes.flatMap((scene, i) => [
              ...(i > 0 ? [<TransitionSeries.Transition key={`t${i}`} presentation={presentation} timing={timing} />] : []),
              <TransitionSeries.Sequence key={`s${i}`} durationInFrames={scene.frames}>
                {view(i)}
              </TransitionSeries.Sequence>,
            ])}
          </TransitionSeries>
        </TransitionContext.Provider>
      )}
    </AbsoluteFill>
  );
};
