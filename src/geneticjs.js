/* eslint-env node */

const chalk = require('chalk');
const escodegen = require('escodegen');
const cloneDeep = require('lodash/cloneDeep');
const map = require('lodash/map');
const sample = require('lodash/sample');

const Genetic = require('./genetic');
const mutator = require('./mutator');

// The incremental score for each character length of the code; longer code => lower fitness score
const FITNESS_FACTOR_LENGTH = -0.002;

// The incremental score for each unit test that matches loosely equal.
const FITNESS_FACTOR_EQUALITY2 = 0.65;

// The incremental score for each unit test that matches strictly equal.
const FITNESS_FACTOR_EQUALITY3 = 0.15;

// The incremental score for code which has an interpretation-time error.
const FITNESS_FACTOR_SYNTAX_ERROR = 0.0;

// The incremental score for code which has an run-time error.
const FITNESS_FACTOR_RUNTIME_ERROR = 0.20;

// The fitness score is the sum of the incremental component scores.
const FITNESS_PERFECT_SCORE = FITNESS_FACTOR_EQUALITY3 + FITNESS_FACTOR_EQUALITY2
  + FITNESS_FACTOR_RUNTIME_ERROR + FITNESS_FACTOR_SYNTAX_ERROR;

// For numeric equality testing, check this may decimal places.
// This avoids imperfect floating point number representation errors.
const EQUALITY_DECIMALS = 5;

// Enable this to allow debugging.
const DEBUG_LOGGING = false;

// Skeleton AST for a program (used to wrap function AST for AST testing).
const stubProgram = {
  type: 'Program',
  body: [
    {
      type: 'FunctionDeclaration',
      id: {
        type: 'Identifier',
        name: 'a',
      },
      params: [],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'BlockStatement',
            body: [],
          },
        ],
      },
      generator: false,
      expression: false,
      async: false,
    },
  ],
  sourceType: 'script',
};
const createCodeFromAST = function createCodeFromAST(functionAst) {
  const codeAst = cloneDeep(stubProgram);

  codeAst.body[0].body.body = functionAst;
  return escodegen.generate(codeAst);
};

class GeneticJS extends Genetic {
  constructor() {
    super();

    this.iteration = 0;
  }

  // eslint-disable-next-line class-methods-use-this
  seed() {
    // start with a random assortment of 1-4 expression components
    const a = map(Array(Math.floor(1 + Math.random() * 3)), mutator.anyBlockStatement);

    return a;
  }

  // eslint-disable-next-line class-methods-use-this
  mutate(entity) {
    let ret = entity;
    // console.log('genetic.mutate (before)', JSON.stringify(entity, null, 4));
    // console.log('genetic.mutate (before)', entity.map(e => e.value).join(' '));

    const THRESHOLD_DELETE = 0.95;
    const THRESHOLD_SHUFFLE = 0.92;
    const THRESHOLD_UPDATE = 0.15;
    const THRESHOLD_INSERT = 0.00;

    const randVal = Math.random() * 1;
    const pos = Math.floor(Math.random() * entity.length);

    if (!entity[pos]) return ret;

    // generate a random operation
    if (randVal > THRESHOLD_DELETE) {
      // eslint-disable-next-line no-console
      if (DEBUG_LOGGING) console.log('mutate DELETE');

      ret = mutator.deleteSomething(entity);

    //
    } else if (randVal > THRESHOLD_SHUFFLE) {
      // eslint-disable-next-line no-console
      if (DEBUG_LOGGING) console.log('mutate SHUFFLE');

      ret = mutator.shuffleSomething(entity);

    //
    } else if (randVal > THRESHOLD_UPDATE) {
      // eslint-disable-next-line no-console
      if (DEBUG_LOGGING) console.log('mutate UPDATE');

      ret = mutator.updateSomething(entity);

    //
    } else if (randVal > THRESHOLD_INSERT) {
      // eslint-disable-next-line no-console
      if (DEBUG_LOGGING) console.log('mutate INSERT');

      ret = mutator.insertSomething(entity);
    } else if (DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log('mutate ELSE');
    }

    return ret;
  }

  fitness(entity) {
    // console.log('genetic.fitness: ', entity.map(e => e.value).join(' '));

    const tests = this.userData.TESTS || [];
    let gencode;
    let f = () => null;
    let actual = null;

    try {
      gencode = createCodeFromAST(entity);
      // eslint-disable-next-line no-console
      if (DEBUG_LOGGING) console.log('generated code');
    } catch (ex) {
      // console.error(ex);
      return FITNESS_FACTOR_SYNTAX_ERROR;
    }
    const gencodeLen = gencode.length;
    const rjs = `"use strict";${gencode.substring(14, gencodeLen - 1)}`;
    const rjso = ((code) => {
      // console.log(code);
      let fitPoints = 0;
      // let resultMatch2s = 0;
      // let resultMatch3s = 0;
      const failed = [];

      // console.log(JSON.stringify({code}, null, 4));
      fitPoints = code.length * FITNESS_FACTOR_LENGTH;
      try {
        // this is effectively an `eval` statement
        f = new Function(code); // eslint-disable-line no-new-func
        fitPoints += FITNESS_FACTOR_SYNTAX_ERROR;
      } catch (err) {
        // if the code throws an exception, only add syntax error points
        // console.log('syntax error', err.message);
        fitPoints += 0;
        failed.push('syntax');
        return fitPoints;
      }
      tests.forEach((test) => {
        try {
          actual = f(...test.params);
          fitPoints += FITNESS_FACTOR_RUNTIME_ERROR;

          // special case for floating point comparison
          if (typeof actual === 'number' && typeof test.expected === 'number') {
            if (actual.toFixed(EQUALITY_DECIMALS) === test.expected.toFixed(EQUALITY_DECIMALS)) {
              // resultMatch2s += 1;
              fitPoints += FITNESS_FACTOR_EQUALITY2;

              // resultMatch3s += 1;
              fitPoints += FITNESS_FACTOR_EQUALITY3;
            } else if (Math.abs(actual - test.expected) < 0.001) {
              // eslint-disable-next-line no-console
              console.log(JSON.stringify(Object.assign({
                actualTypeOf: typeof actual,
                expectedTypeOf: typeof test.expected,
                actualFixed: actual.toFixed(EQUALITY_DECIMALS),
                expectedFixed: test.expected.toFixed(EQUALITY_DECIMALS),
                // eslint-disable-next-line max-len
                equalityFixed: actual.toFixed(EQUALITY_DECIMALS) === test.expected.toFixed(EQUALITY_DECIMALS),
              }, test)));
            }
          } else if (actual == test.expected) { // eslint-disable-line eqeqeq
            // resultMatch2s += 1;
            fitPoints += FITNESS_FACTOR_EQUALITY2;

            if (actual === test.expected) {
              // resultMatch3s += 1;
              fitPoints += FITNESS_FACTOR_EQUALITY3;
            }
          }
        } catch (err) {
          // console.log('runtime error', err.message);
          // if the code throws an exception, only add runtime error points
          fitPoints += 0;
        }
      });

      if (fitPoints > (0.96 * FITNESS_PERFECT_SCORE * (tests.length - 1))) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({
          failed,
          fitPoints,
          numTests: tests.length,
        }));
      }

      return fitPoints / (tests.length || 1);
    })(rjs);

    // console.log('genetic.fitness returning: ', rjso);
    return rjso;
  }

  // eslint-disable-next-line class-methods-use-this
  crossover(mother, father) {
    // eslint-disable-next-line max-len
    // console.log('genetic.crossover', [mother.map(e => e.value).join(' '), father.map(e => e.value).join(' ')]);

    // return [mother, father];

    // mix and match from components of both mother and father
    const son = (mother || []).map((e, i) => sample([father[i] || '', mother[i] || '']));
    const daughter = (father || []).map((e, i) => sample([mother[i] || '', father[i] || '']));

    return [son, daughter];
  }

  // original params: (pop, generation, stats)
  generation(pop) {
    this.iteration += 1;
    // eslint-disable-next-line max-len
    // console.log('genetic.generation', JSON.stringify([pop, generation, stats], null, 4));
    // eslint-disable-next-line max-len
    // console.log('genetic.generation conditional: ', JSON.stringify([pop[0].fitness, this.userData.TESTS.length, this.userData.goal], null, 4));
    return pop[0].fitness > this.userData.goal;
  }

  notification(pop, generation, stats, isFinished) {
    // console.log('genetic.notification: ', {isFinished});
    const now = (new Date()).valueOf() / 1000;
    const secondsElapsed = now - this.userData.startedAt;
    const score = pop[0].fitness;
    const { goal } = this.userData;

    let gencode;

    try {
      gencode = createCodeFromAST(pop[0].entity);
    } catch (ex) {
      // console.error(ex);
    }

    const logColor = (scoreString, goalNum) => {
      const scoreNum = +scoreString;
      let ret = 'green';
      if (scoreNum <= 0) {
        ret = 'red';
      } else if (scoreNum <= goalNum) {
        ret = 'gray';
      }
      return ret;
    };

    // eslint-disable-next-line no-console
    console.log('genetic.notification', JSON.stringify([pop, generation, stats, isFinished], null, 4));
    // eslint-disable-next-line no-console
    console.log(
      'iteration',
      ` ${this.iteration} `,
      chalk.bold('elapsed: ') + chalk.gray(`${secondsElapsed.toFixed(3)}s`),
      chalk.bold('score: '), chalk[logColor(score, goal)](score.toFixed(1)),
      chalk.bold('/ ') + chalk.gray(goal),
      chalk.bold('code: '),
      gencode,
    );

    if (isFinished) {
      // eslint-disable-next-line no-console
      console.log('notification stats', stats);
      // eslint-disable-next-line no-console
      console.log('WINNER', chalk.black.bgWhite(pop[0].entity.map(e => e.value).join(' ')));
    }
  }
}

module.exports = GeneticJS;
