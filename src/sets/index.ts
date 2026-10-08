import type {SetId} from '../core/ids';
import type {ResolvedClip} from '../core/resolve';
import type {Theme} from '../core/schema';
import {GradientStage} from './gradient';
import {GridStage} from './grid';

export type SetDef = {
  Stage: React.FC<{theme: Theme; clip: ResolvedClip}>;
  // look switches read by the scenes
  look: {glass: boolean; blurIn: boolean};
};

export const SETS: Record<SetId, SetDef> = {
  gradient: {Stage: GradientStage, look: {glass: false, blurIn: false}},
  grid: {Stage: GridStage, look: {glass: true, blurIn: true}},
};
