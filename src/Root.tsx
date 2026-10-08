import {Composition, staticFile} from 'remotion';
import {loadContent, type ReadJson} from './core/load';
import {FPS, resolveClip} from './core/resolve';
import {Video, type VideoProps} from './Video';

// the content root is served as Remotion's public dir
const read: ReadJson = async (path) => {
  const res = await fetch(staticFile(path));
  if (!res.ok) throw new Error('file not found');
  return res.json();
};

export const Root: React.FC = () => (
  <Composition
    id="Video"
    component={Video}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={FPS * 10}
    defaultProps={{clip: 'habits/launch', format: '9x16', lang: 'en'} satisfies VideoProps}
    calculateMetadata={async ({props}) => {
      const resolved = resolveClip(await loadContent(read, props.clip), {lang: props.lang, format: props.format, theme: props.theme});
      return {props: {...props, resolved}, width: resolved.width, height: resolved.height, fps: resolved.fps, durationInFrames: resolved.durationInFrames};
    }}
  />
);
