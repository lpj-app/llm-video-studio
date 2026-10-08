import {Composition, staticFile} from 'remotion';
import {Ad, sceneFrames} from './Ad';
import type {AdConfig, AdProps} from './types';

const FPS = 30;

export const Root: React.FC = () => (
  <Composition
    id="Ad"
    component={Ad}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={FPS * 10}
    defaultProps={{video: 'demo'} satisfies AdProps}
    calculateMetadata={async ({props}) => {
      const res = await fetch(staticFile(`videos/${props.video}/video.json`));
      if (!res.ok) throw new Error(`public/videos/${props.video}/video.json not found`);
      const config: AdConfig = await res.json();
      const [width, height] = config.size ?? [1080, 1920];
      return {
        props: {...props, config},
        width,
        height,
        durationInFrames: config.scenes.reduce((sum, s) => sum + sceneFrames(s, FPS), 0),
      };
    }}
  />
);
