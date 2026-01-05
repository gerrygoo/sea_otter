import { z } from 'zod';
import { PoolSizeUnit, TrainingFocus, StrokeStyle } from './types';

export const GearSchema = z.object({
  fins: z.boolean(),
  kickboard: z.boolean(),
  pullBuoy: z.boolean(),
  paddles: z.boolean(),
  snorkel: z.boolean(),
});

export const SwimSetSchema = z.object({
  reps: z.number().int().positive(),
  distance: z.number().int().positive(),
  stroke: z.string(),
  description: z.string(),
  intensity: z.string().optional(),
  intervalSeconds: z.number().int().positive().optional(),
  restSeconds: z.number().int().positive().optional(),
  gearUsed: z.array(z.string()).optional(),
});

export const WorkoutSchema = z.object({
  warmup: z.array(SwimSetSchema),
  preset: z.array(SwimSetSchema),
  mainSet: z.array(SwimSetSchema),
  cooldown: z.array(SwimSetSchema),
  totalDistance: z.number().nonnegative(),
  estimatedDurationMinutes: z.number().nonnegative(),
});

export const WorkoutParametersSchema = z.object({
  poolSize: z.number().positive(),
  poolUnit: z.nativeEnum(PoolSizeUnit),
  totalTimeMinutes: z.number().positive(),
  availableGear: GearSchema,
  focus: z.nativeEnum(TrainingFocus),
  preferredStrokes: z.array(z.nativeEnum(StrokeStyle)),
  effortLevel: z.number().min(1).max(10),
});
