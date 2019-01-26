/* eslint-env node, jest */

const mutator = require('./mutator');

describe('mutator.anyReturnStatement', () => {
  test('returns an expected result object', () => {
    const rec = mutator.anyReturnStatement();
    expect(rec).toHaveProperty('type', 'ReturnStatement');
    expect(rec).toHaveProperty('argument');
  });
});
