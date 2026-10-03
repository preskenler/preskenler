/**
 * Types for the Ville de Terra Nova / Webcup API.
 *
 * The upstream payload uses `snake_case`; the view types below use `camelCase`
 * because they are what crosses the RSC/route-handler boundary to the client.
 */

/** `session` block: current state of the request stream. */
export type WebcupApiSession = {
  status?: string;
  is_running?: boolean;
  current_wave?: number;
  elapsed_minutes?: number;
  visible_requests_count?: number;
  initial_requests_count?: number;
  wave_requests_count?: number;
  next_wave_number?: number;
  minutes_until_next_wave?: number;
};

/** A single demand as returned by the API. */
export type WebcupApiRequest = {
  id: number;
  request_code: string;
  requester_name: string;
  requester_type: string;
  message_public: string;
  difficulty: string;
  difficulty_level: number;
  xp_base: number;
  xp_time_bonus: number;
  xp_total: number;
  xp_available: number;
  is_initial: boolean;
  visible_since_wave: number;
  arrival_type: string;
  wave_number: number | null;
  arrival_time: string;
  group_name?: string | null;
  sort_order?: number | null;
  is_ai_related?: boolean | number;
  is_ai_request?: boolean;
};

/** Full API response envelope. */
export type WebcupApiResponse = {
  api_version: string;
  session: WebcupApiSession;
  requests: WebcupApiRequest[];
};

/** Persisted session state, serialized for the client. */
export type WebcupSessionView = {
  status: string;
  isRunning: boolean;
  currentWave: number;
  elapsedMinutes: number;
  visibleRequestsCount: number;
  initialRequestsCount: number;
  waveRequestsCount: number;
  nextWaveNumber: number;
  minutesUntilNextWave: number;
  updatedAt: string;
};

/** Persisted demand, serialized for the client. */
export type WebcupRequestView = {
  requestCode: string;
  remoteId: number;
  requesterName: string;
  requesterType: string;
  messagePublic: string;
  difficulty: string;
  difficultyLevel: number;
  xpBase: number;
  xpTimeBonus: number;
  xpTotal: number;
  xpAvailable: number;
  isInitial: boolean;
  visibleSinceWave: number;
  arrivalType: string;
  waveNumber: number | null;
  arrivalTime: string;
  groupName: string | null;
  sortOrder: number | null;
  isAiRelated: boolean;
  isAiRequest: boolean;
  firstSeenAt: string;
  lastSyncedAt: string;
};

/** Everything the board needs for one render. */
export type WebcupSnapshot = {
  session: WebcupSessionView | null;
  requests: WebcupRequestView[];
  /** Codes seen for the first time during the sync that produced the snapshot. */
  newCodes: string[];
  fetchedAt: string;
};
