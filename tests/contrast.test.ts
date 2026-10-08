import {describe, expect, it} from 'vitest';
import {checkTheme, contrast} from '../src/core/contrast';

describe('contrast', () => {
  it('black on white is 21', () => expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0));
  it('accepts a readable theme', () => expect(checkTheme({bg: ['#0f172a', '#1e1b4b'], text: '#ffffff', accent: '#facc15'})).toEqual([]));
  it('flags weak text and accent', () => {
    const p = checkTheme({bg: ['#ffffff', '#f5f5f5'], text: '#cccccc', accent: '#eeeeee'});
    expect(p.some((x) => x.startsWith('text'))).toBe(true);
    expect(p.some((x) => x.startsWith('accent'))).toBe(true);
  });
});
