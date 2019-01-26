/* eslint-env node, jest */

const mutator = require('./mutator');

describe('mutator.anyString', () => {
  test('returns an expected result object', () => {
    const rec = mutator.anyString();
    const v = rec.value;
    expect(rec).toHaveProperty(['type'], 'Literal');
    expect(rec).toHaveProperty(['value'], v);
    expect(rec).toHaveProperty(['raw'], `"${v}"`);
  });
});
