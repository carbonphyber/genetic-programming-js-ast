/* eslint-env node, jest */

const mutator = require('./mutator');

describe('mutator.anyUnaryOperation', () => {
  test('returns an expected result object', () => {
    const rec = mutator.anyUnaryOperation();
    expect(rec).toHaveProperty('type', 'UnaryExpression');
    expect(rec).toHaveProperty('operator');
    expect(rec).toHaveProperty('argument');
    expect(rec).toHaveProperty('prefix');
  });
});
