import { describe, it, expect } from 'vitest';
import { formatDuration } from './utils';

describe('Duration Formatting', () => {
  it('should format seconds into MM:SS correctly', () => {
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(45)).toBe('0:45');
    expect(formatDuration(125)).toBe('2:05');
  });

  it('should handle zero seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('should round to nearest second', () => {
    expect(formatDuration(90.6)).toBe('1:31');
    expect(formatDuration(89.4)).toBe('1:29');
  });
});
