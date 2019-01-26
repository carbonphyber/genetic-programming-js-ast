/* eslint-env node, jest */

const Genetic = require('./index');

class MockGeneticChildA extends Genetic {
  // eslint-disable-next-line class-methods-use-this
  mutate(a) {
    return -1 * a;
  }
}

class MockGeneticChildB extends Genetic {
  // eslint-disable-next-line class-methods-use-this
  seed() {
    return 'a';
  }
}

describe('Genetic', () => {
  test('object has expected default configuration after constructor', () => {
    const expectedDefaults = {
      size: 250,
      crossover: 0.9,
      mutation: 0.2,
      iterations: 100,
      fittestAlwaysSurvives: true,
      maxResults: 100,
      skip: 0,
    };
    const g = new Genetic();
    expect(g).toHaveProperty('configuration', expectedDefaults);
  });

  test('start has expected state after seeding', () => {
    // const expectedDefaults = {
    //   size: 250,
    //   crossover: 0.9,
    //   mutation: 0.2,
    //   iterations: 100,
    //   fittestAlwaysSurvives: true,
    //   maxResults: 100,
    //   skip: 0,
    // };
    const g = new Genetic();
    g.configuration.iterations = 0;
    g.configuration.size = 4;
    g.seed = () => 'a';
    g.start();
    expect(g.entities).toEqual(['a', 'a', 'a', 'a']);
  });

  test('mutateOrNot returns an expected result object', () => {
    const g = new MockGeneticChildA();
    g.configuration.mutation = 0.5;
    expect(g.mutateOrNot(0.0, 3)).toEqual(-3);
    expect(g.mutateOrNot(0.2, 3)).toEqual(-3);
    expect(g.mutateOrNot(0.499, 3)).toEqual(-3);
    expect(g.mutateOrNot(0.5, 3)).toEqual(-3);
    expect(g.mutateOrNot(0.501, 3)).toEqual(3);
    expect(g.mutateOrNot(0.6, 3)).toEqual(3);
    expect(g.mutateOrNot(0.8, 3)).toEqual(3);
    expect(g.mutateOrNot(1.0, 3)).toEqual(3);
  });

  test('start returns an expected result object (1)', () => {
    const g = new MockGeneticChildB();
    // generate a population of size 2
    g.configuration.size = 2;
    g.configuration.iterations = 0;
    g.start();
    expect(g.entities).toEqual(['a', 'a']);
  });

  test('start returns an expected result object (2)', () => {
    const g = new MockGeneticChildB();
    // generate a population of size 4
    g.configuration.size = 4;
    g.configuration.iterations = 0;
    g.start();
    expect(g.entities).toEqual(['a', 'a', 'a', 'a']);
  });
});
