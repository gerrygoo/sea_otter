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
