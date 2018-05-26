//
const mutator = require('./mutator');

describe('mutator.anyBoolean', () => {
  test('returns an expected result object', () => {
    let rec = mutator.anyBoolean();
    expect(rec).toHaveProperty('type', 'Literal');
    if (rec.value) {
      expect(rec).toHaveProperty('value', true);
      expect(rec).toHaveProperty('raw', 'true');
    } else {
      expect(rec).toHaveProperty('value', false);
      expect(rec).toHaveProperty('raw', 'false');
    }
  });
});
