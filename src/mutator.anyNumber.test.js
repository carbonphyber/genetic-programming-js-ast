/* eslint-env node, jest */

const mutator = require('./mutator');

describe('mutator.anyNumber', () => {
  test('returns an expected result object', () => {
    const rec = mutator.anyNumber();
    let v;
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
    } else if (rec.type === 'UnaryExpression') {
      v = rec.argument.value;
      expect(rec).toHaveProperty(['type'], 'UnaryExpression');
      expect(rec).toHaveProperty(['operator'], '-');
      expect(rec).toHaveProperty(['prefix'], true);
      expect(rec).toHaveProperty(['argument', 'type'], 'Literal');
      expect(rec).toHaveProperty(['argument', 'value'], v);
      expect(rec).toHaveProperty(['argument', 'raw'], String(v));
    } else {
      v = rec.value;
      expect(rec).toHaveProperty(['type'], 'Literal');
      expect(rec).toHaveProperty(['value'], v);
      expect(rec).toHaveProperty(['raw'], String(v));
    }
  });
});
