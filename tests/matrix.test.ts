import {describe, expect, it} from 'vitest';
import {jobFlags, MatrixSchema} from '../src/core/matrix';

describe('matrix', () => {
  it('parses jobs and maps axes to flags', () => {
    const m = MatrixSchema.parse({jobs: [{clip: 'p/c', themes: ['dark', 'light'], formats: ['9x16'], langs: ['de']}, {clip: 'p/d'}]});
    expect(jobFlags(m.jobs[0])).toEqual({theme: ['dark', 'light'], format: ['9x16'], lang: ['de']});
    expect(jobFlags(m.jobs[1])).toEqual({});
  });
  it('rejects unknown formats and bad clip ids', () => {
    expect(() => MatrixSchema.parse({jobs: [{clip: 'p/c', formats: ['2x3']}]})).toThrow();
    expect(() => MatrixSchema.parse({jobs: [{clip: 'nope'}]})).toThrow();
    expect(() => MatrixSchema.parse({jobs: []})).toThrow();
  });
});
