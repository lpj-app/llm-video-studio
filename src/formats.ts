import type {FormatId} from './core/ids';

export type LayoutClass = 'portrait' | 'square' | 'landscape';

export type Format = {
  width: number;
  height: number;
  layout: LayoutClass;
  safe: {top: number; bottom: number}; // px covered by platform UI
};

export const FORMATS: Record<FormatId, Format> = {
  '9x16': {width: 1080, height: 1920, layout: 'portrait', safe: {top: 150, bottom: 350}},
  '4x5': {width: 1080, height: 1350, layout: 'portrait', safe: {top: 0, bottom: 0}},
  '1x1': {width: 1080, height: 1080, layout: 'square', safe: {top: 0, bottom: 0}},
  '16x9': {width: 1920, height: 1080, layout: 'landscape', safe: {top: 0, bottom: 0}},
};
