import type { WebcupApiRequest, WebcupApiSession } from './types';

/** The API mixes booleans and 0/1 numbers for its flags. */
export function normalizeBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

/** Persisted columns for a request, excluding the `requestCode` business key. */
export function toRequestData(request: WebcupApiRequest) {
  return {
    remoteId: request.id,
    requesterName: request.requester_name,
    requesterType: request.requester_type,
    messagePublic: request.message_public,
    difficulty: request.difficulty,
    difficultyLevel: request.difficulty_level,
    xpBase: request.xp_base,
    xpTimeBonus: request.xp_time_bonus,
    xpTotal: request.xp_total,
    xpAvailable: request.xp_available,
    isInitial: Boolean(request.is_initial),
    visibleSinceWave: request.visible_since_wave ?? 0,
    arrivalType: request.arrival_type ?? '',
    waveNumber: request.wave_number ?? null,
    arrivalTime: request.arrival_time ?? '',
    groupName: request.group_name ?? null,
    sortOrder: request.sort_order ?? null,
    isAiRelated: normalizeBoolean(request.is_ai_related),
    isAiRequest: normalizeBoolean(request.is_ai_request),
  };
}

/** Normalized session columns, safe when the API sends a partial `session`. */
export function toSessionData(session: WebcupApiSession) {
  return {
    status: session.status ?? 'unknown',
    isRunning: Boolean(session.is_running),
    currentWave: session.current_wave ?? 0,
    elapsedMinutes: session.elapsed_minutes ?? 0,
    visibleRequestsCount: session.visible_requests_count ?? 0,
    initialRequestsCount: session.initial_requests_count ?? 0,
    waveRequestsCount: session.wave_requests_count ?? 0,
    nextWaveNumber: session.next_wave_number ?? 0,
    minutesUntilNextWave: session.minutes_until_next_wave ?? 0,
  };
}

/**
 * Codes present in the latest fetch but not yet persisted. Detection relies on
 * `request_code`, the stable business identifier, never on a fixed count.
 */
export function computeNewCodes(
  fetchedCodes: Iterable<string>,
  existingCodes: Iterable<string>,
): string[] {
  const existing = new Set(existingCodes);
  const seen = new Set<string>();
  const newCodes: string[] = [];

  for (const code of fetchedCodes) {
    if (!existing.has(code) && !seen.has(code)) {
      seen.add(code);
      newCodes.push(code);
    }
  }

  return newCodes;
}
