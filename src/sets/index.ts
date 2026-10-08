import type {SetId} from '../core/ids';
import type {Theme} from '../core/schema';
import {GradientStage} from './gradient';

export const SETS: Record<SetId, React.FC<{theme: Theme}>> = {
  gradient: GradientStage,
};
