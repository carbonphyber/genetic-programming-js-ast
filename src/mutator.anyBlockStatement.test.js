/* eslint-env node, jest */

const mutator = require('./mutator');

describe('mutator.anyBlockStatement', () => {
  test('returns an expected result object', () => {
    const rec = mutator.anyBlockStatement();
    expect(rec).toHaveProperty('type', 'BlockStatement');
    expect(rec).toHaveProperty('body');
  });
});
