export type Theme = {
  bg: [string, string]; // gradient start/end
  text: string;
  accent: string;
  ring?: string; // highlight ring color, defaults to accent
};

export type Scene =
  | {type: 'hook'; text: string; seconds?: number}
  | {
      type: 'feature';
      image?: string; // screenshot or screen recording, file in public/videos/<name>/
      video?: string;
      from?: number; // video start offset in seconds
      title: string;
      subtitle?: string;
      highlight?: {x: number; y: number; size?: number}; // % of screenshot
      seconds?: number;
    }
  | {type: 'cta'; text: string; sub?: string | string[]; seconds?: number} // sub: first line is emphasized;

export type AdConfig = {
  theme: Theme;
  logo?: string; // shown on the cta scene
  size?: [number, number]; // default 1080x1920
  scenes: Scene[];
};

// video = folder name in public/videos/, config is loaded from its video.json
export type AdProps = {video: string; config?: AdConfig};
