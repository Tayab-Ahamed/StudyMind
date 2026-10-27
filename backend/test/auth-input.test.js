const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

const handlers = {};
let searchedEmail;
let existingUser;
let createdUser;
const userModel = {
  findOne({ email }) {
    searchedEmail = email;
    const found = email === 'user@example.test' ? existingUser : null;
    return { select: async () => found, then: (resolve) => Promise.resolve(found).then(resolve) };
  },
  async create(input) { createdUser = { _id: 'new-user', ...input }; return createdUser; },
};
const originalLoad = Module._load;
Module._load = function (name, parent, isMain) {
  if (name === 'express') return { Router: () => ({
    post: (path, handler) => { handlers[path] = handler; }, get: () => {},
  }) };
  if (name === 'jsonwebtoken') return { sign: () => 'test-token' };
  if (name === '../models/User') return userModel;
  if (name === '../middleware/auth') return () => {};
  return originalLoad.call(this, name, parent, isMain);
};
try { require('../routes/auth'); } finally { Module._load = originalLoad; }

async function invoke(path, body) {
  let status = 200;
  let payload;
  let error;
  await handlers[path]({ body }, {
    status(code) { status = code; return this; },
    json(value) { payload = value; },
  }, (value) => { error = value; });
  return { status, payload, error };
}

test('malformed credential types are rejected rather than reaching the error handler', async () => {
  for (const [path, body] of [
    ['/login', { email: {}, password: 'secret123' }],
    ['/login', { email: 'user@example.test', password: 123456 }],
    ['/register', { name: {}, email: 'user@example.test', password: 'secret123' }],
    ['/register', { name: 'Student', email: 5, password: 'secret123' }],
  ]) {
    const response = await invoke(path, body);
    assert.equal(response.error, undefined);
    assert.equal(response.status, 400);
    assert.ok(response.payload.error);
  }
});

test('login normalizes whitespace and case consistently with stored emails', async () => {
  existingUser = { _id: 'user-id', comparePassword: async (password) => password === 'secret123' };
  const response = await invoke('/login', { email: '  USER@EXAMPLE.TEST  ', password: 'secret123' });
  assert.equal(response.error, undefined);
  assert.equal(response.status, 200);
  assert.equal(searchedEmail, 'user@example.test');
  assert.equal(response.payload.token, 'test-token');
});

test('registration uses the same normalized identity for creation and duplicate checks', async () => {
  existingUser = null;
  const created = await invoke('/register', { name: '  Student  ', email: '  USER@EXAMPLE.TEST  ', password: 'secret123' });
  assert.equal(created.status, 201);
  assert.equal(createdUser.name, 'Student');
  assert.equal(createdUser.email, 'user@example.test');
  existingUser = createdUser;
  const duplicate = await invoke('/register', { name: 'Student', email: '  USER@EXAMPLE.TEST  ', password: 'secret123' });
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.error, undefined);
});
