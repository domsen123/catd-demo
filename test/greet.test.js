import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greet, shout, farewell } from '../src/greet.js';

test('greet returns a greeting with the name', () => {
  assert.equal(greet('Pid', new Date(2026, 0, 15, 14, 0)), 'Hallo Pid');
});

test('greet says Guten Morgen in the morning', () => {
  assert.equal(greet('Pid', new Date(2026, 0, 15, 5, 0)), 'Guten Morgen Pid');
  assert.equal(greet('Pid', new Date(2026, 0, 15, 8, 30)), 'Guten Morgen Pid');
  assert.equal(greet('Pid', new Date(2026, 0, 15, 11, 59)), 'Guten Morgen Pid');
});

test('greet says Hallo during the day', () => {
  assert.equal(greet('Pid', new Date(2026, 0, 15, 12, 0)), 'Hallo Pid');
  assert.equal(greet('Pid', new Date(2026, 0, 15, 17, 59)), 'Hallo Pid');
});

test('greet says Guten Abend in the evening and at night', () => {
  assert.equal(greet('Pid', new Date(2026, 0, 15, 18, 0)), 'Guten Abend Pid');
  assert.equal(greet('Pid', new Date(2026, 0, 15, 23, 59)), 'Guten Abend Pid');
  assert.equal(greet('Pid', new Date(2026, 0, 15, 0, 0)), 'Guten Abend Pid');
  assert.equal(greet('Pid', new Date(2026, 0, 15, 4, 59)), 'Guten Abend Pid');
});

test('greet without a time uses the current time', () => {
  assert.match(greet('Pid'), /^(Guten Morgen|Hallo|Guten Abend) Pid$/);
});

test('greet rejects an invalid time', () => {
  const error = { name: 'TypeError', message: 'now must be a valid Date' };
  assert.throws(() => greet('Pid', new Date('x')), error);
  assert.throws(() => greet('Pid', '08:00'), error);
  assert.throws(() => greet('Pid', 8), error);
  assert.throws(() => greet('Pid', null), error);
});

test('farewell returns a goodbye with the name', () => {
  assert.equal(farewell('Pid'), 'Tschüss Pid');
});

test('shout returns the greeting in capitals with an exclamation mark', () => {
  assert.equal(shout('Pid', new Date(2026, 0, 15, 8, 0)), 'GUTEN MORGEN PID!');
  assert.equal(shout('Pid', new Date(2026, 0, 15, 14, 0)), 'HALLO PID!');
  assert.equal(shout('Pid', new Date(2026, 0, 15, 20, 0)), 'GUTEN ABEND PID!');
});

test('shout without a time uses the current time', () => {
  assert.match(shout('Pid'), /^(GUTEN MORGEN|HALLO|GUTEN ABEND) PID!$/);
});

test('shout adds no second exclamation mark', () => {
  assert.equal(shout('Pid!', new Date(2026, 0, 15, 14, 0)), 'HALLO PID!');
  assert.equal(shout('Pid!!', new Date(2026, 0, 15, 14, 0)), 'HALLO PID!!');
});

test('shout uppercases ß as SS', () => {
  assert.equal(shout('Gauß', new Date(2026, 0, 15, 14, 0)), 'HALLO GAUSS!');
});

test('shout rejects an invalid time', () => {
  const error = { name: 'TypeError', message: 'now must be a valid Date' };
  assert.throws(() => shout('Pid', new Date('x')), error);
  assert.throws(() => shout('Pid', '08:00'), error);
  assert.throws(() => shout('Pid', 8), error);
  assert.throws(() => shout('Pid', null), error);
});
