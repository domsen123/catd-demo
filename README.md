# catd-demo

Small test repository for catd development pipelines. A pipeline clones it, works on a branch, pushes the branch and opens a pull request.

## Funktionen

- `greet(name, now = new Date())` returns a greeting by the local hour of `now`: 05–11 `Guten Morgen <name>`, 12–17 `Hallo <name>`, 18–04 `Guten Abend <name>`. Without `now` it uses the current time. An invalid `now` throws a `TypeError`.
- `shout(name, now = new Date())` returns the greeting of `greet(name, now)` in capitals with a trailing `!`, e.g. `HALLO PID!`. If the greeting already ends with `!`, no second one is added. An invalid `now` throws the `TypeError` of `greet`.
- `farewell(name)` returns the goodbye `Tschüss <name>`.

## Run the tests

Node.js 20 or later runs the tests without dependencies:

```sh
npm test
```
