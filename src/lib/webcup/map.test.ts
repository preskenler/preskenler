import { describe, expect, it } from 'vitest';

import {
  computeNewCodes,
  normalizeBoolean,
  toRequestData,
  toSessionData,
} from './map';
import type { WebcupApiRequest } from './types';

const request: WebcupApiRequest = {
  id: 42,
  request_code: 'FXX',
  requester_name: 'Habitante de Terra Nova',
  requester_type: 'Citoyen',
  message_public: 'Je souhaite suivre l’état de ma demande.',
  difficulty: 'Moyenne',
  difficulty_level: 2,
  xp_base: 500,
  xp_time_bonus: 20,
  xp_total: 520,
  xp_available: 520,
  is_initial: false,
  visible_since_wave: 1,
  arrival_type: 'vague',
  wave_number: 1,
  arrival_time: '02:00:00',
  group_name: 'Socle',
  sort_order: 4,
  is_ai_related: 0,
  is_ai_request: false,
};

describe('normalizeBoolean', () => {
  it('accepts booleans and 0/1 numeric flags', () => {
    expect(normalizeBoolean(true)).toBe(true);
    expect(normalizeBoolean(1)).toBe(true);
    expect(normalizeBoolean('1')).toBe(true);
    expect(normalizeBoolean(0)).toBe(false);
    expect(normalizeBoolean(false)).toBe(false);
    expect(normalizeBoolean(undefined)).toBe(false);
  });
});

describe('toRequestData', () => {
  it('maps snake_case fields and normalizes flags', () => {
    expect(toRequestData(request)).toEqual({
      remoteId: 42,
      requesterName: 'Habitante de Terra Nova',
      requesterType: 'Citoyen',
      messagePublic: 'Je souhaite suivre l’état de ma demande.',
      difficulty: 'Moyenne',
      difficultyLevel: 2,
      xpBase: 500,
      xpTimeBonus: 20,
      xpTotal: 520,
      xpAvailable: 520,
      isInitial: false,
      visibleSinceWave: 1,
      arrivalType: 'vague',
      waveNumber: 1,
      arrivalTime: '02:00:00',
      groupName: 'Socle',
      sortOrder: 4,
      isAiRelated: false,
      isAiRequest: false,
    });
  });

  it('falls back to safe defaults for optional fields', () => {
    const data = toRequestData({
      ...request,
      wave_number: null,
      arrival_time: undefined as unknown as string,
      group_name: undefined,
      sort_order: undefined,
      is_ai_related: undefined,
    });

    expect(data.waveNumber).toBeNull();
    expect(data.arrivalTime).toBe('');
    expect(data.groupName).toBeNull();
    expect(data.sortOrder).toBeNull();
    expect(data.isAiRelated).toBe(false);
  });
});

describe('toSessionData', () => {
  it('fills missing counters with zero', () => {
    expect(toSessionData({ status: 'active' })).toEqual({
      status: 'active',
      isRunning: false,
      currentWave: 0,
      elapsedMinutes: 0,
      visibleRequestsCount: 0,
      initialRequestsCount: 0,
      waveRequestsCount: 0,
      nextWaveNumber: 0,
      minutesUntilNextWave: 0,
    });
  });
});

describe('computeNewCodes', () => {
  it('returns only codes that are not persisted yet', () => {
    expect(computeNewCodes(['D01', 'D03', 'NEW'], ['D01', 'D03'])).toEqual([
      'NEW',
    ]);
  });

  it('deduplicates repeated codes within a single fetch', () => {
    expect(computeNewCodes(['X', 'X', 'Y'], [])).toEqual(['X', 'Y']);
  });

  it('returns an empty list when everything is known', () => {
    expect(computeNewCodes(['D01'], ['D01', 'D03'])).toEqual([]);
  });
});
