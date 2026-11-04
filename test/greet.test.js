import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greet } from '../src/greet.js';

test('greet returns a greeting with the name', () => {
  assert.equal(greet('Pid'), 'Hallo Pid');
});
