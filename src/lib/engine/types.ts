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
  Choice = 'Choice'
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
  preferredStrokes: StrokeStyle[];
  effortLevel: number; // 1-10
}

export interface SwimSet {
  reps: number;
  distance: number;
  stroke: StrokeStyle | string;
  description: string;
  intensity?: string;
  intervalSeconds?: number;
  restSeconds?: number;
  gearUsed?: (keyof Gear)[];
}

export interface Workout {
  warmup: SwimSet[];
  preset: SwimSet[];
  mainSet: SwimSet[];
  cooldown: SwimSet[];
  totalDistance: number;
  estimatedDurationMinutes: number;
}

// --- Generator Engine Types ---

export interface GeneratorContext {
  poolSize: number;
  poolUnit: PoolSizeUnit;
  availableGear: Gear;
  focus: TrainingFocus;
  effortLevel: number;
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

