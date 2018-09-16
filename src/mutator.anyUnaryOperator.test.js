//
const mutator = require('./mutator');

describe('mutator.anyUnaryOperation', () => {
  test('returns an expected result object', () => {
    let rec = mutator.anyUnaryOperation();
    expect(rec).toHaveProperty('type', 'UnaryExpression');
    expect(rec).toHaveProperty('operator');
    expect(rec).toHaveProperty('argument');
    expect(rec).toHaveProperty('prefix');
  });
});
