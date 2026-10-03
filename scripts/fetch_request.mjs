#!/usr/bin/env node
import 'dotenv/config';

import { readFile, writeFile } from 'node:fs/promises';

/**
 * List the demands published by the Terra Nova / Webcup API so a `TODO.md`
 * stays in sync with the live feed. The server key is only ever sent as a
 * header (never in the URL) and is never logged.
 *
 * Usage:
 *   npm run requests                 # print the checklist to stdout
 *   npm run requests -- --write      # create/refresh TODO.md
 *   npm run requests -- --out FILE   # use another TODO file
 *   npm run requests -- --new        # only demands that are not checked yet
 *   npm run requests -- --json       # dump the normalized payload
 */

const DEFAULT_API_URL = 'https://24h.webcup.fr/wp-json/webcup/v1/requests';
const DEFAULT_OUT = 'TODO.md';

// Matches `- [x] `REQ-123`` / `- [ ] `REQ-123`` lines so re-runs keep the
// checked state of every request_code.
const CHECKBOX_RE = /^- \[([ xX])\]\s+`([^`]+)`/;

const HELP = `fetch_request — list the Terra Nova / Webcup demands

Usage:
  npm run requests                 Print the checklist to stdout
  npm run requests -- --write      Create/refresh TODO.md (keeps checked items)
  npm run requests -- --out FILE   Use another TODO file
  npm run requests -- --new        Only show demands that are not checked yet
  npm run requests -- --json       Dump the normalized payload as JSON

Env:
  WEBCUP_API_KEY   required, server-only (no NEXT_PUBLIC_)
  WEBCUP_API_URL   optional, defaults to ${DEFAULT_API_URL}
`;

function parseArgs(args) {
  const options = {
    write: false,
    out: DEFAULT_OUT,
    json: false,
    onlyNew: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case '--write':
        options.write = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--new':
        options.onlyNew = true;
        break;
      case '--out':
        options.out = args[index + 1] ?? '';
        index += 1;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg} (try --help)`);
    }
  }

  if (!options.out) {
    throw new Error('Missing value for --out');
  }

  return options;
}

function normalizeBoolean(value) {
  return value === true || value === 1 || value === '1';
}

function normalizeRequest(request) {
  const difficultyLevel = Number(request.difficulty_level);
  const xpTotal = Number(request.xp_total);

  return {
    code: String(request.request_code ?? '').trim(),
    requesterName: String(request.requester_name ?? 'Demandeur inconnu'),
    requesterType: String(request.requester_type ?? '').trim(),
    message: String(request.message_public ?? '').trim(),
    difficulty: String(request.difficulty ?? '').trim(),
    difficultyLevel: Number.isFinite(difficultyLevel) ? difficultyLevel : 0,
    xpTotal: Number.isFinite(xpTotal) ? xpTotal : 0,
    isInitial: normalizeBoolean(request.is_initial),
    waveNumber:
      typeof request.wave_number === 'number' ? request.wave_number : null,
    sortOrder:
      typeof request.sort_order === 'number' ? request.sort_order : null,
    isAiRequest: normalizeBoolean(request.is_ai_request),
  };
}

async function fetchPayload() {
  const url = process.env.WEBCUP_API_URL?.trim() || DEFAULT_API_URL;
  const apiKey = process.env.WEBCUP_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      'WEBCUP_API_KEY is not set. Copy .env.example to .env and fill it in.',
    );
  }

  const response = await fetch(url, {
    headers: { 'X-Webcup-Api-Key': apiKey },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Webcup API responded with ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.requests)) {
    throw new Error(
      'Unexpected Webcup API payload (expected { requests: [] })',
    );
  }

  return {
    apiVersion: String(data.api_version ?? ''),
    session: data.session ?? null,
    requests: data.requests
      .map(normalizeRequest)
      .filter((request) => request.code),
  };
}

async function readStates(path) {
  const states = new Map();

  let content;
  try {
    content = await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return states;
    }
    throw error;
  }

  for (const line of content.split(/\r?\n/)) {
    const match = CHECKBOX_RE.exec(line.trim());
    if (match) {
      states.set(match[2], match[1].toLowerCase() === 'x');
    }
  }

  return states;
}

function sortRequests(a, b) {
  const left = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const right = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (left !== right) {
    return left - right;
  }

  return a.code.localeCompare(b.code);
}

function describeSession(session) {
  if (!session) {
    return 'session inconnue';
  }

  const parts = [];

  if (session.status) {
    parts.push(String(session.status));
  }
  if (typeof session.current_wave === 'number') {
    parts.push(`vague ${session.current_wave}`);
  }
  if (typeof session.visible_requests_count === 'number') {
    parts.push(`${session.visible_requests_count} visibles`);
  }

  return parts.join(' · ') || 'session inconnue';
}

function formatRequest(request, checked) {
  const box = checked ? '[x]' : '[ ]';
  const who = request.requesterType
    ? `${request.requesterName} (${request.requesterType})`
    : request.requesterName;
  const meta = [];

  if (request.difficultyLevel > 0) {
    meta.push(`difficulté ${request.difficultyLevel}`);
  } else if (request.difficulty) {
    meta.push(`difficulté ${request.difficulty}`);
  }
  if (request.xpTotal > 0) {
    meta.push(`${request.xpTotal} XP`);
  }
  if (request.isInitial) {
    meta.push('initiale');
  } else if (typeof request.waveNumber === 'number') {
    meta.push(`vague ${request.waveNumber}`);
  }
  if (request.isAiRequest) {
    meta.push('IA');
  }

  const lines = [
    `- ${box} \`${request.code}\` — **${who}**${
      meta.length > 0 ? ` · ${meta.join(' · ')}` : ''
    }`,
  ];

  if (request.message) {
    lines.push(`      > ${request.message.replace(/\s*\n\s*/g, ' ')}`);
  }

  return lines.join('\n');
}

function renderChecklist({ payload, states, onlyNew }) {
  const requests = [...payload.requests].sort(sortRequests);
  const visible = onlyNew
    ? requests.filter((request) => !states.get(request.code))
    : requests;
  const toDo = visible.filter((request) => !states.get(request.code));
  const done = visible.filter((request) => states.get(request.code));
  const currentCodes = new Set(requests.map((request) => request.code));
  const stale = [...states.keys()]
    .filter((code) => !currentCodes.has(code))
    .sort((a, b) => a.localeCompare(b));

  const lines = [
    '# Demandes Terra Nova — TODO',
    '',
    `_Généré le ${new Date().toISOString()} · API ${
      payload.apiVersion || '?'
    } · ${describeSession(payload.session)} · ${requests.length} demandes (${toDo.length} à faire, ${done.length} faites)_`,
    '',
    '## À faire',
    '',
  ];

  if (toDo.length === 0) {
    lines.push('_Rien à faire._');
  } else {
    for (const request of toDo) {
      lines.push(formatRequest(request, false));
    }
  }

  lines.push('', '## Faites', '');

  if (done.length === 0) {
    lines.push('_Rien de fait pour le moment._');
  } else {
    for (const request of done) {
      lines.push(formatRequest(request, true));
    }
  }

  if (stale.length > 0) {
    lines.push(
      '',
      '## Plus dans le flux',
      '',
      '_Demandes déjà suivies qui ne sont plus publiées par l’API._',
      '',
    );
    for (const code of stale) {
      lines.push(`- ${states.get(code) ? '[x]' : '[ ]'} \`${code}\``);
    }
  }

  lines.push('');

  return {
    markdown: lines.join('\n'),
    counts: { total: visible.length, toDo: toDo.length, done: done.length },
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(`${HELP}\n`);
    return;
  }

  const payload = await fetchPayload();

  if (options.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  const states = await readStates(options.out);
  const { markdown, counts } = renderChecklist({
    payload,
    states,
    onlyNew: options.onlyNew,
  });

  if (options.write) {
    await writeFile(options.out, markdown, 'utf8');
    process.stderr.write(
      `${counts.total} demandes (${counts.done} faites, ${counts.toDo} à faire) → ${options.out}\n`,
    );
    return;
  }

  process.stdout.write(markdown);
}

main().catch((error) => {
  process.stderr.write(`\n[requests] ${error.message}\n\n`);
  process.exitCode = 1;
});
