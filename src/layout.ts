import type {ResolvedClip} from './core/resolve';

export type Layout = {
  title: {top: number; left: number; width: number; align: 'center' | 'left'; size: number; subtitleSize: number};
  phone: {width: number; top: number; centerX: number};
  center: {hookSize: number; ctaSize: number; subSize: number; sub2Size: number; logo: number; padX: number};
};

type Dims = Pick<ResolvedClip, 'width' | 'height' | 'layout' | 'safe'>;

export function layoutFor({width: w, height: h, layout, safe}: Dims): Layout {
  if (layout === 'landscape') {
    return {
      title: {top: h * 0.3, left: w * 0.06, width: w * 0.46, align: 'left', size: 84, subtitleSize: 40},
      phone: {width: h * 0.5, top: h * 0.1, centerX: w * 0.74},
      center: {hookSize: 108, ctaSize: 100, subSize: 64, sub2Size: 40, logo: 180, padX: w * 0.2},
    };
  }
  if (layout === 'square') {
    return {
      title: {top: 60, left: 0, width: w, align: 'center', size: 76, subtitleSize: 38},
      phone: {width: w * 0.5, top: h * 0.36, centerX: w / 2},
      center: {hookSize: 104, ctaSize: 96, subSize: 64, sub2Size: 40, logo: 180, padX: 100},
    };
  }
  return {
    title: {top: safe.top || 90, left: 0, width: w, align: 'center', size: 88, subtitleSize: 44},
    phone: {width: Math.round(w * 0.704), top: h * 0.29, centerX: w / 2},
    center: {hookSize: 120, ctaSize: 110, subSize: 72, sub2Size: 46, logo: 220, padX: 140},
  };
}
