# PRD: shout

> Status: geplant · Scope: new function `shout(name, now = new Date())` in `src/greet.js` returns the greeting of `greet(name, now)` in capitals with a trailing `!`, e.g. `HALLO PID!`. `greet` and `farewell` stay unchanged.

## Context

`src/greet.js` offers `greet(name, now = new Date())`, which greets by the local hour of `now` (`Guten Morgen`, `Hallo`, `Guten Abend`), and `farewell(name)`. A louder variant of the greeting is wanted: `shout(name)` returns the same greeting in capitals with an exclamation mark, e.g. `HALLO PID!`.

What exists and gets reused:

- `greet(name, now)` in `src/greet.js`: holds the whole time-of-day logic and the validation of `now` (`TypeError` with message `now must be a valid Date`). `shout` calls it and adds no time logic of its own.
- `test/greet.test.js`: `node:test` and `node:assert/strict`, test dates built with the local constructor `new Date(2026, 0, 15, h, m)`, a regex test for the default time and an `assert.throws` test for invalid `now`. The `shout` tests follow these patterns.
- `README.md` documents every function under `## Funktionen`.

Intended result: `shout` is a named export of `src/greet.js`, delegates to `greet`, uppercases the result and appends `!` unless the uppercased greeting already ends with `!`. All existing tests keep passing unchanged.

## Product decisions (final)

| Topic | Decision |
|---|---|
| Signature | `shout(name, now = new Date())`. Same parameters and meaning as `greet`. |
| Use of `greet` | `shout` calls `greet(name, now)` and works only on its return value. The time-of-day logic (windows 05–11, 12–17, 18–04, local hour) lives only in `greet`; `shout` does not duplicate it. |
| Time of day | Inherited from `greet`: 05:00–11:59 → `GUTEN MORGEN <NAME>!`, 12:00–17:59 → `HALLO <NAME>!`, 18:00–04:59 → `GUTEN ABEND <NAME>!`. |
| `now` omitted or `undefined` | Current time, via the default parameter of `shout` (and passed on to `greet`). |
| Invalid `now` | No own check: `greet` throws its `TypeError` with message `now must be a valid Date`, and `shout` lets it propagate unchanged. Applies to `new Date('x')`, `null`, numbers and strings. |
| Capitals | `String.prototype.toUpperCase()` on the whole greeting, not `toLocaleUpperCase`. `ß` becomes `SS`: `shout('Gauß', 14:00)` → `HALLO GAUSS!`. |
| Exclamation mark | Appended exactly once at the end. If the uppercased greeting already ends with `!` (e.g. name `Pid!`), nothing is appended: `HALLO PID!`. |
| Several `!` at the end | Kept as they are, no collapsing: name `Pid!!` → `HALLO PID!!`. |
| `!` inside the greeting | Kept as is; only the last character decides. Name `P!d` → `HALLO P!D!`. |
| Whitespace | No trimming. Name `Pid! ` (trailing space) does not end with `!`, so `HALLO PID! !` results. |
| `name` | No validation, as in `greet`. Empty name `''` at 14:00 → `HALLO !`. |
| How tests control the time | Tests pass `now` as a fixed local `Date` (`new Date(2026, 0, 15, h, m)`), one case per time window, plus one test without `now` checked by a regex. No mocking, no `mock.timers`, no environment variable. |
| Location | Named export `shout` in `src/greet.js`, below `greet` and above `farewell`. No new source file. |
| Tests location | `test/greet.test.js`; the import line adds `shout`. |
| Existing functions | `greet`, `farewell` and their 7 tests stay byte for byte unchanged. |
| README | One new line for `shout` under `## Funktionen`. |
| Dependencies | None added; `package.json` unchanged. |

## Scope

**In scope**

- New function `shout` in `src/greet.js`.
- New tests for `shout` in `test/greet.test.js` (windows, default time, exclamation mark, `ß`, invalid `now`).
- One new line in `README.md`.

**Out of scope**

- Any change to `greet`, `farewell` or their tests.
- Own time-of-day logic, time zones, configuration of texts.
- Validation or trimming of `name`, collapsing of several `!`.
- Locale-specific uppercasing (`toLocaleUpperCase`).
- New files under `src/`, new dependencies, changes to `package.json`.

## Implementation

1. **`src/greet.js`**: add between `greet` and `farewell` (leave `greet` and `farewell` byte for byte unchanged, one blank line between functions):
   ```js
   export function shout(name, now = new Date()) {
     const loud = greet(name, now).toUpperCase();
     return loud.endsWith('!') ? loud : `${loud}!`;
   }
   ```
   `now` is passed explicitly, so `null` reaches the check in `greet` and throws there.

2. **`test/greet.test.js`**: change only the import line to `import { greet, shout, farewell } from '../src/greet.js';`. Keep all 7 existing tests unchanged. Append these 5 tests after the `farewell` test:
   - `shout returns the greeting in capitals with an exclamation mark`:
     - `shout('Pid', new Date(2026, 0, 15, 8, 0))` → `'GUTEN MORGEN PID!'`
     - `shout('Pid', new Date(2026, 0, 15, 14, 0))` → `'HALLO PID!'`
     - `shout('Pid', new Date(2026, 0, 15, 20, 0))` → `'GUTEN ABEND PID!'`
   - `shout without a time uses the current time`: `assert.match(shout('Pid'), /^(GUTEN MORGEN|HALLO|GUTEN ABEND) PID!$/)`.
   - `shout adds no second exclamation mark`:
     - `shout('Pid!', new Date(2026, 0, 15, 14, 0))` → `'HALLO PID!'`
     - `shout('Pid!!', new Date(2026, 0, 15, 14, 0))` → `'HALLO PID!!'`
   - `shout uppercases ß as SS`: `shout('Gauß', new Date(2026, 0, 15, 14, 0))` → `'HALLO GAUSS!'`.
   - `shout rejects an invalid time`: with `const error = { name: 'TypeError', message: 'now must be a valid Date' };`, `assert.throws(() => shout('Pid', X), error)` for `X` = `new Date('x')`, `'08:00'`, `8` and `null`.
   Use `assert.equal` for exact values, as the existing tests do.

3. **`README.md`**: under `## Funktionen`, insert between the `greet` line and the `farewell` line:
   - `` `shout(name, now = new Date())` `` returns the greeting of `greet(name, now)` in capitals with a trailing `!`, e.g. `HALLO PID!`. If the greeting already ends with `!`, no second one is added. An invalid `now` throws the `TypeError` of `greet`.
   Keep the rest of the file unchanged.

4. Run `node --test` and confirm all 12 tests pass.

## Technical notes

- Style: ES modules (`"type": "module"`), named exports, two-space indentation, single quotes, semicolons, template literals, as in `src/greet.js` and `test/greet.test.js`.
- Tests use `node:test` (`test`) and `node:assert/strict`; `npm test` runs `node --test`. Node.js 20 or later, no dependencies.
- Reuse `greet` instead of copying its logic, so `shout` follows any later change of the time windows automatically.
- Pitfall time zones: build test dates only with `new Date(year, monthIndex, day, hours, minutes)` (local time), never from ISO strings with `Z`, otherwise `getHours()` depends on the machine's time zone.
- Pitfall default parameter: `= new Date()` applies only to `undefined`; `null` must be passed on to `greet` and throw there.
- Pitfall uppercasing: `'ß'.toUpperCase()` is `'SS'` (string gets longer); the `!` check runs on the uppercased string, which is safe because `!` has no case.
- Order: check `endsWith('!')` on the final uppercased string, not on `name`, so only the end of the whole greeting decides.
- Baseline before any change on `origin/main` (c15832c): `node --test` → 7 tests, 7 passed, 0 failed.
- The repository has no `CLAUDE.md`, `AGENTS.md` or `CONTRIBUTING.md`. The earlier PRD `prd/greet-nach-tageszeit.md` served as style model.

## Success criteria

- `node --test` passes with 0 failures; the test count rises from 7 to 12.
- `shout('Pid', new Date(2026, 0, 15, h, 0))` returns `GUTEN MORGEN PID!` for 8, `HALLO PID!` for 14 and `GUTEN ABEND PID!` for 20.
- `shout('Pid')` matches `/^(GUTEN MORGEN|HALLO|GUTEN ABEND) PID!$/` and throws nothing.
- `shout('Pid!', …14:00)` returns `HALLO PID!`; `shout('Pid!!', …14:00)` returns `HALLO PID!!`; `shout('Gauß', …14:00)` returns `HALLO GAUSS!`.
- `shout('Pid', X)` throws `TypeError` with message `now must be a valid Date` for `new Date('x')`, `'08:00'`, `8` and `null`.
- `greet`, `farewell` and the 7 existing tests are unchanged in the diff (apart from the import line of the test file).
- `README.md` has the `shout` line under `## Funktionen`; `package.json` is unchanged.
