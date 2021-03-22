/* eslint-env node */
/* eslint-disable max-classes-per-file */

const cloneDeep = require('lodash/cloneDeep');
const sample = require('lodash/sample');

const Serialization = {
  stringify: function serializationStringify(obj) {
    return JSON.stringify(obj, (key, value) => {
      if (value instanceof Function || typeof value === 'function') return `__func__:${value.toString()}`;
      if (value instanceof RegExp) return `__regex__:${value}`;
      return value;
    });
  },
  parse: function stringifyParse(str) {
    return JSON.parse(str, (key, value) => {
      if (typeof value !== 'string') return value;
      // eslint-disable-next-line no-eval
      if (value.lastIndexOf('__func__:', 0) === 0) return eval(`(${value.slice(9)})`);
      // eslint-disable-next-line no-eval
      if (value.lastIndexOf('__regex__:', 0) === 0) return eval(`(${value.slice(10)})`);
      return value;
    });
  },
};

const Optimize = {
  Maximize: function Maximize(a, b) {
    return a >= b;
  },
  Minimize: function Minimize(a, b) {
    return a < b;
  },
  MaximizeRandEqual: function Maximize(a, b) {
    if (a !== b) {
      return a > b;
    }
    // if a and b are equal, randomize the "Maximized" value
    return Math.random() >= 0.5;
  },
  MinimizeRandEqual: function Minimize(a, b) {
    if (a !== b) {
      return a < b;
    }
    // if a and b are equal, randomize the "Maximized" value
    return Math.random() >= 0.5;
  },
};
const Select1 = {
  Tournament2: function Tournament2(pop) {
    const a = sample(pop);
    const b = sample(pop);
    return Optimize.MaximizeRandEqual(a.fitness, b.fitness)
      ? a.entity
      : b.entity;
  },
  Tournament3: function Tournament3(pop) {
    const a = sample(pop);
    const b = sample(pop);
    const c = sample(pop);
    let best = Optimize.MaximizeRandEqual(a.fitness, b.fitness)
      ? a
      : b;
    best = Optimize.MaximizeRandEqual(best.fitness, c.fitness)
      ? best
      : c;
    return best.entity;
  },
  Fittest: function Fittest(pop) {
    return pop[0].entity;
  },
  Random: function Random(pop) {
    return sample(pop).entity;
  },
};

const Select2 = {
  Tournament2: function Tournament2(pop) {
    return [
      Select1.Tournament2.call(this, pop),
      Select1.Tournament2.call(this, pop),
    ];
  },
  Tournament3: function Tournament3(pop) {
    return [
      Select1.Tournament3.call(this, pop),
      Select1.Tournament3.call(this, pop),
    ];
  },
  Random: function Random(pop) {
    return [
      Select1.Random.call(this, pop),
      Select1.Random.call(this, pop),
    ];
  },
  FittestRandom: function FittestRandom(pop) {
    return [
      Select1.Fittest.call(this, pop),
      Select1.Random.call(this, pop),
    ];
  },
};

class GeneticAbstract {
  constructor() {
    this.optimize = null;
    this.select1 = null;
    this.select2 = null;

    this.configuration = {
      size: 250,
      crossover: 0.9,
      mutation: 0.2,
      iterations: 100,
      fittestAlwaysSurvives: true,
      maxResults: 100,
      skip: 0,
    };

    this.userData = {};
    this.internalGenState = {};
    this.entities = [];
  }

  // this group of functions to be overridden by subclasses
  // eslint-disable-next-line class-methods-use-this
  crossover() {}

  // eslint-disable-next-line class-methods-use-this
  fitness() {}

  // eslint-disable-next-line class-methods-use-this
  generation() {}

  // eslint-disable-next-line class-methods-use-this
  mutate() {}

  // eslint-disable-next-line class-methods-use-this
  notification() {}

  // eslint-disable-next-line class-methods-use-this
  seed() {}

  mutateOrNot(roll, entity) {
    // applies mutation based on mutation probability
    return roll <= this.configuration.mutation && this.mutate
      ? this.mutate(cloneDeep(entity))
      : entity;
  }

  start() {
    const conf = this.configuration;
    // const iters = conf.iterations || 0;
    let i;
    let seed;

    // seed the population
    for (i = 0; i < conf.size; i += 1) {
      seed = cloneDeep(this.seed());
      this.entities.push(seed);
    }

    for (i = 0; i < conf.iterations; i += 1) {
      // reset for each generation
      this.internalGenState = {};

      // score and sort
      const pop = this.entities
        .map((entity) => ({
          fitness: this.fitness(entity),
          entity,
        }))
        .sort((a, b) => (this.optimize(a.fitness, b.fitness)
          ? -1
          : 1));

      // generation notification
      const mean = pop.reduce((a, b) => (a + b.fitness), 0) / (pop.length || 1);
      const stdev = Math.sqrt(pop
        .map((a) => ((a.fitness - mean) * (a.fitness - mean)))
        .reduce((a, b) => (a + b), 0) / (pop.length || 1));

      const stats = {
        maximum: pop[0].fitness,
        minimum: pop[pop.length - 1].fitness,
        mean,
        stdev,
      };

      const r = this.generation(pop.slice(0, conf.maxResults), i, stats);
      const isFinished = !!r || (i === conf.iterations - 1);
      // console.log({r, i, 'iterations': conf.iterations, isFinished});

      if (
        isFinished
        || conf.skip === 0
        || i % conf.skip === 0
      ) {
        this.sendNotification(pop.slice(0, conf.maxResults), i, stats, isFinished);
      }

      if (isFinished) break;

      // crossover and mutate
      const newPop = [];

      if (conf.fittestAlwaysSurvives) { // lets the best solution fall through
        newPop.push(pop[0].entity);
      }

      while (newPop.length < conf.size) {
        if (
          Math.random() <= conf.crossover // base crossover on specified probability
          && newPop.length + 1 < conf.size // keeps us from going 1 over the max population size
        ) {
          const parents = this.select2(pop);
          const children = this.crossover(
            cloneDeep(parents[0]),
            cloneDeep(parents[1]),
          ).map((e) => this.mutateOrNot(Math.random(), e));
          newPop.push(children[0], children[1]);
        } else {
          // console.log('Genetic.start() else: ', JSON.stringify(pop));
          newPop.push(this.mutateOrNot(Math.random(), this.select1(pop)));
        }
      }

      this.entities = newPop;
    }
  }

  sendNotification(pop, generation, stats, isFinished) {
    const response = {
      pop: pop.map(Serialization.stringify),
      generation,
      stats,
      isFinished,
    };

    this.notification(
      response.pop.map(Serialization.parse),
      response.generation,
      response.stats,
      response.isFinished,
    );
  }

  evolve(config, userData) {
    let k;
    let l;
    let keys;

    keys = Object.keys(config);
    for (k = 0, l = keys.length; k < l; k += 1) {
      this.configuration[keys[k]] = config[keys[k]];
    }

    keys = Object.keys(userData);
    for (k = 0, l = keys.length; k < l; k += 1) {
      this.userData[keys[k]] = userData[keys[k]];
    }

    this.start();
  }
}

class Genetic extends GeneticAbstract {
  constructor() {
    super();

    this.optimize = Optimize.Maximize;
    this.select1 = Select1.Tournament2;
    this.select2 = Select2.FittestRandom;
  }
}

module.exports = Genetic;
