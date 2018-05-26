//
const mutator = require('./mutator');

describe('mutator.anyNumber', () => {
  test('returns an expected result object', () => {
    let rec = mutator.anyNumber(),
      v;
    // is positive
    if (rec.type === 'ExpressionStatement') {
      v = rec.expression.argument.value;
      expect(rec).toHaveProperty(['type'], 'ExpressionStatement');
      expect(rec).toHaveProperty(['expression', 'type'], 'UnaryExpression');
      expect(rec).toHaveProperty(['expression', 'operator'], '-');
      expect(rec).toHaveProperty(['expression', 'prefix'], true);
      expect(rec).toHaveProperty(['expression', 'argument', 'type'], 'Literal');
      expect(rec).toHaveProperty(['expression', 'argument', 'value'], v);
      expect(rec).toHaveProperty(['expression', 'argument', 'raw'], String(v));
    } else {
      v = rec.value;
      expect(rec).toHaveProperty(['type'], 'Literal');
      expect(rec).toHaveProperty(['value'], v);
      expect(rec).toHaveProperty(['raw'], String(v));
    }
  });
});
