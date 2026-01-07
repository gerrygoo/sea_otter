export enum PoolSizeUnit {
  Yards = 'yards',
  Meters = 'meters'
}

export enum TrainingFocus {
  Aerobic = 'Aerobic',
  Speed = 'Speed',
  Strength = 'Strength',
  Technique = 'Technique',
  Endurance = 'Endurance',
  Mixed = 'Mixed'
}

export enum StrokeStyle {
  Free = 'Free',
  Back = 'Back',
  Breast = 'Breast',
  Fly = 'Fly',
  IM = 'IM',
  Drill = 'Drill',
  Kick = 'Kick',
  Pull = 'Pull',
  Choice = 'Choice'
}

export type StrokePreferenceValue = 1 | 2 | 3 | 4 | 5;

export interface StrokePreferences {
  [StrokeStyle.Free]: StrokePreferenceValue;
  [StrokeStyle.Back]: StrokePreferenceValue;
  [StrokeStyle.Breast]: StrokePreferenceValue;
  [StrokeStyle.Fly]: StrokePreferenceValue;
  [StrokeStyle.IM]: StrokePreferenceValue;
  [StrokeStyle.Drill]: StrokePreferenceValue;
  [StrokeStyle.Kick]: StrokePreferenceValue;
  [StrokeStyle.Pull]: StrokePreferenceValue;
}

export interface Gear {
  fins: boolean;
  kickboard: boolean;
  pullBuoy: boolean;
  paddles: boolean;
  snorkel: boolean;
}

export interface WorkoutParameters {
  poolSize: number;
  poolUnit: PoolSizeUnit;
  totalTimeMinutes: number;
  availableGear: Gear;
  focus: TrainingFocus;
  preferredStrokes: StrokeStyle[]; // Deprecated in favor of strokePreferences
  strokePreferences: StrokePreferences;
  effortLevel: number; // 1-10
  cssPace?: number; // seconds per 100 units
}

import { EffortIntensity } from './pace_logic';

export interface SwimSet {
  reps: number;
  distance: number;
  stroke: StrokeStyle | string;
  description: string;
  intensity?: EffortIntensity | string;
  intervalSeconds?: number;
  restSeconds?: number;
  gearUsed?: (keyof Gear)[];
  targetPacePer100?: number; // seconds per 100 units
}

export interface Workout {
  warmup: SwimSet[];
  preset: SwimSet[];
  mainSet: SwimSet[];
  cooldown: SwimSet[];
  totalDistance: number;
  estimatedDurationMinutes: number;
}

export interface SavedWorkout extends Workout {
  id: string;
  createdAt: string; // ISO timestamp
  isFavorite: boolean;
  name?: string;
}

// --- Generator Engine Types ---

export interface GeneratorContext {
  poolSize: number;
  poolUnit: PoolSizeUnit;
  availableGear: Gear;
  focus: TrainingFocus;
  effortLevel: number;
  strokePreferences: StrokePreferences;
  cssPace?: number;
}

export interface GeneratorConstraints {
  timeBudgetSeconds: number;
  minDistance?: number;
  maxDistance?: number;
}

export type SetGeneratorFunction = (
  context: GeneratorContext,
  constraints: GeneratorConstraints
) => SwimSet[] | null;

export interface SetGenerator {
  generate: SetGeneratorFunction;
  name: string;
  focusAlignment: Partial<Record<TrainingFocus, number>>; // 0.0 to 1.0 (1.0 = perfect match)
}

export interface BlueprintSlot {
  type: 'warmup' | 'preset' | 'mainSet' | 'cooldown';
  budgetPercentage: number;
  generators: SetGenerator[];
}

export type WorkoutBlueprint = BlueprintSlot[];

