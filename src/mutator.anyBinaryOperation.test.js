/* eslint-env node, jest */

const mutator = require('./mutator');

describe('mutator.anyBinaryOperation', () => {
  test('returns an expected result object', () => {
    const rec = mutator.anyBinaryOperation();
    expect(rec).toHaveProperty('type', 'BinaryExpression');
    expect(rec).toHaveProperty('operator');
    expect(rec).toHaveProperty('left');
    expect(rec).toHaveProperty('right');
  });
});
