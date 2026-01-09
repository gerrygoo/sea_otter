import { writable } from 'svelte/store';
import type { Workout } from '../engine/types';

export const generationStore = writable<Workout[]>([]);
