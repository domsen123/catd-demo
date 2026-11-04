# PRD: greet by time of day

> Status: geplant · Scope: `greet(name, now)` greets with "Guten Morgen", "Hallo" or "Guten Abend" depending on the local hour of `now` (default: current time). `farewell` stays unchanged.

## Context

Today `greet(name)` in `src/greet.js` always returns `Hallo <name>`. The greeting shall depend on the time of day: in the morning it greets differently than in the evening. Existing calls `greet(name)` must keep working.

What exists and gets reused:

- `src/greet.js` exports `greet(name)` and `farewell(name)` as ES modules (`"type": "module"` in `package.json`), using template literals.
- `test/greet.test.js` uses `node:test` and `node:assert/strict` and asserts `greet('Pid') === 'Hallo Pid'`.
- `README.md` documents both functions under `## Funktionen`.

Intended result: `greet` accepts an optional second parameter `now` (a `Date`), reads its local hour and picks the greeting from three fixed windows. Tests pass fixed dates, so they are deterministic at any time of day and in any time zone.

## Product decisions (final)

| Topic | Decision |
|---|---|
| Signature | `greet(name, now = new Date())`. `name` keeps its current meaning; `now` is optional. |
| Time source | Local time of the running process: `now.getHours()`. Only the hour counts; minutes and seconds are ignored. |
| Window "morning" | Hours 5 to 11 (05:00:00 to 11:59:59) → `Guten Morgen <name>` |
| Window "day" | Hours 12 to 17 (12:00:00 to 17:59:59) → `Hallo <name>` (the text of today) |
| Window "evening" | Hours 18 to 23 and 0 to 4 (18:00:00 to 04:59:59) → `Guten Abend <name>` |
| Window boundaries | Start inclusive, end exclusive: 05:00 is morning, 12:00 is day, 18:00 is evening, 04:59 is evening. |
| Format | `<greeting> <name>` with exactly one space, like today. No punctuation. |
| Compatibility | `greet(name)` stays valid and returns a string, computed from the current local time. Callers that pass only `name` keep working; the text now depends on the hour. |
| Existing test | The test `greet returns a greeting with the name` passes a fixed date in the day window (14:00 local) and still expects `Hallo Pid`. |
| How tests control the time | Tests pass `now` as a `Date` built from local components, e.g. `new Date(2026, 0, 15, 14, 0)`. No mocking, no environment variable. |
| `now` omitted or `undefined` | Use the current time (`new Date()`, via the default parameter). |
| Invalid `now` | Any value that is not a `Date` instance (including `null`, numbers, strings) or a `Date` whose `getTime()` is `NaN` throws `TypeError` with the message `now must be a valid Date`. |
| `name` | No validation, no change: inserted as today via template literal. |
| `farewell` | Unchanged. |
| README | Documents the new parameter, the three windows and the greeting texts. |
| Dependencies | None added. |

## Scope

**In scope**

- Time-of-day logic and validation of `now` in `greet` in `src/greet.js`.
- Adjusting the existing `greet` test and adding tests for every window, every boundary, the default `now` and invalid `now`.
- Updating `README.md`.

**Out of scope**

- Any change to `farewell` or its test.
- Time zones other than the local time of the process, UTC options, configuration of windows or texts, localisation into other languages.
- Validation of `name`.
- New dependencies or changes to `package.json`.

## Implementation

1. **`src/greet.js`**: replace `greet` with this behaviour (keep `farewell` byte for byte):
   ```js
   export function greet(name, now = new Date()) {
     if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
       throw new TypeError('now must be a valid Date');
     }
     const hour = now.getHours();
     if (hour >= 5 && hour < 12) return `Guten Morgen ${name}`;
     if (hour >= 12 && hour < 18) return `Hallo ${name}`;
     return `Guten Abend ${name}`;
   }
   ```
   The default parameter only applies to `undefined`; `null` reaches the check and throws, which is intended.

2. **`test/greet.test.js`**: keep the imports and the `farewell` test unchanged.
   - Change the existing test `greet returns a greeting with the name` to `assert.equal(greet('Pid', new Date(2026, 0, 15, 14, 0)), 'Hallo Pid');`.
   - Add a test `greet says Guten Morgen in the morning`: hours 5:00, 8:30 and 11:59 → `Guten Morgen Pid`.
   - Add a test `greet says Hallo during the day`: hours 12:00 and 17:59 → `Hallo Pid`.
   - Add a test `greet says Guten Abend in the evening and at night`: 18:00, 23:59, 0:00 and 4:59 → `Guten Abend Pid`.
   - Add a test `greet without a time uses the current time`: `greet('Pid')` matches `/^(Guten Morgen|Hallo|Guten Abend) Pid$/`.
   - Add a test `greet rejects an invalid time`: `assert.throws(() => greet('Pid', X), { name: 'TypeError', message: 'now must be a valid Date' })` for `X` = `new Date('x')`, `'08:00'`, `8` and `null`.
   - Build every date with the local constructor `new Date(2026, 0, 15, h, m)`, never from an ISO string.

3. **`README.md`**: under `## Funktionen`, replace the `greet` line with:
   - `` `greet(name, now = new Date())` `` returns a greeting by the local hour of `now`: 05–11 `Guten Morgen <name>`, 12–17 `Hallo <name>`, 18–04 `Guten Abend <name>`. Without `now` it uses the current time. An invalid `now` throws a `TypeError`.
   Keep the `farewell` line and the rest of the file unchanged.

4. Run `node --test` and confirm all tests pass.

## Technical notes

- ES modules, named exports, two-space indentation, single quotes, semicolons, template literals: follow the existing style in `src/greet.js` and `test/greet.test.js`.
- Tests use `node:test` (`test`) and `node:assert/strict`; no test framework or dependency. `npm test` runs `node --test`. Node.js 20 or later.
- Pitfall time zones: `new Date('2026-01-15T14:00:00Z')` yields a different local hour depending on the machine's time zone. Always build test dates with `new Date(year, monthIndex, day, hours, minutes)`, which is local time, so `getHours()` returns exactly the given hour.
- Pitfall default parameter: `= new Date()` applies only to `undefined`, not to `null`; `null` must throw (see decisions).
- Pitfall `instanceof Date` plus `Number.isNaN(now.getTime())`: both checks are needed, because `new Date('x')` is a `Date` instance with an invalid time.
- Baseline before any change on `origin/main` (0199a4f): `node --test` → 2 tests, 2 passed, 0 failed.
- The repository has no `CLAUDE.md`, `AGENTS.md` or `CONTRIBUTING.md` and no earlier PRDs; this file creates `prd/`.

## Success criteria

- `node --test` passes with 0 failures; the test count rises from 2 to 7.
- `greet('Pid', new Date(2026, 0, 15, h, m))` returns `Guten Morgen Pid` for 05:00 and 11:59, `Hallo Pid` for 12:00 and 17:59, `Guten Abend Pid` for 18:00, 00:00 and 04:59.
- `greet('Pid')` returns one of the three greetings with the name and throws nothing.
- `greet('Pid', new Date('x'))`, `greet('Pid', null)`, `greet('Pid', 8)` and `greet('Pid', '08:00')` throw `TypeError` with message `now must be a valid Date`.
- `farewell('Pid')` still returns `Tschüss Pid`; `farewell` and its test are unchanged in the diff.
- `README.md` describes the parameter `now`, the three windows and their texts.
- `package.json` is unchanged; no dependency was added.
