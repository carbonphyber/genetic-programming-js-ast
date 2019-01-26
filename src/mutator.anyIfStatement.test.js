/* eslint-env node, jest */

const mutator = require('./mutator');

describe('mutator.anyIfStatement', () => {
  test('returns an expected result object', () => {
    const rec = mutator.anyIfStatement();
    expect(rec).toHaveProperty('type', 'IfStatement');
    expect(rec).toHaveProperty('test');
    expect(rec).toHaveProperty('consequent');
  });
});
