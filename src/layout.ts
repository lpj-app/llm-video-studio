import type {ResolvedClip} from './core/resolve';

export type Layout = {
  icon: {x: number; y: number; size: number}; // center of the glass tile; counter sits below
  noteSize: number;
  title: {top: number; left: number; width: number; align: 'center' | 'left'; size: number; subtitleSize: number};
  phone: {width: number; top: number; centerX: number};
  browser: {width: number; top: number; centerX: number}; // top = vertical center of the window
  center: {hookSize: number; ctaSize: number; subSize: number; sub2Size: number; logo: number; padX: number};
};

type Dims = Pick<ResolvedClip, 'width' | 'height' | 'layout' | 'safe'>;

export function layoutFor({width: w, height: h, layout, safe}: Dims, opts: {note?: boolean} = {}): Layout {
  const noteShift = opts.note ? 70 : 0;
  if (layout === 'landscape') {
    return {
      icon: {x: w * 0.06 + 85, y: h * 0.3 - 175, size: 170},
      noteSize: 58,
      title: {top: h * 0.3, left: w * 0.06, width: w * 0.46, align: 'left', size: 84, subtitleSize: 40},
      phone: {width: h * 0.43, top: h * 0.035, centerX: w * 0.74},
      browser: {width: w * 0.44, top: h * 0.5, centerX: w * 0.745},
      center: {hookSize: 108, ctaSize: 100, subSize: 64, sub2Size: 40, logo: 180, padX: w * 0.2},
    };
  }
  if (layout === 'square') {
    return {
      icon: {x: w * 0.5 + w * 0.25 + 95, y: h * 0.36 + noteShift + 90, size: 170},
      noteSize: 50,
      title: {top: 60, left: 0, width: w, align: 'center', size: 76, subtitleSize: 38},
      phone: {width: w * 0.5, top: h * 0.36 + noteShift, centerX: w / 2},
      browser: {width: w * 0.9, top: h * 0.62 + noteShift, centerX: w / 2},
      center: {hookSize: 104, ctaSize: 96, subSize: 64, sub2Size: 40, logo: 180, padX: 100},
    };
  }
  return {
    icon: {x: w - 100, y: h * 0.29 + noteShift + 40, size: 170},
    noteSize: 56,
    title: {top: safe.top || 90, left: 0, width: w, align: 'center', size: 88, subtitleSize: 44},
    phone: {width: Math.round(w * 0.704), top: h * 0.29 + noteShift, centerX: w / 2},
    browser: {width: Math.round(w * 0.92), top: h * 0.55 + noteShift, centerX: w / 2},
    center: {hookSize: 120, ctaSize: 110, subSize: 72, sub2Size: 46, logo: 220, padX: 140},
  };
}
