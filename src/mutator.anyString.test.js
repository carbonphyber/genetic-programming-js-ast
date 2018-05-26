//
const mutator = require('./mutator');

describe('mutator.anyString', () => {
  test('returns an expected result object', () => {
    let rec = mutator.anyString(),
      v = rec.value;
    expect(rec).toHaveProperty(['type'], 'Literal');
    expect(rec).toHaveProperty(['value'], v);
    expect(rec).toHaveProperty(['raw'], '"' + v + '"');
  });
});
