import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greet, farewell } from '../src/greet.js';

test('greet returns a greeting with the name', () => {
  assert.equal(greet('Pid'), 'Hallo Pid');
});

test('farewell returns a goodbye with the name', () => {
  assert.equal(farewell('Pid'), 'Tschüss Pid');
});
