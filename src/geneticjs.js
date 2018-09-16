'use strict';

const chalk = require('chalk'),
  escodegen = require('escodegen'),
  cloneDeep = require('lodash/cloneDeep'),
  fill = require('lodash/fill'),
  map = require('lodash/map'),
  sample = require('lodash/sample'),
  shuffle = require('lodash/shuffle'),
  union = require('lodash/union'),

  Genetic = require('./genetic'),
  mutator = require('./mutator');

const FITNESS_FACTOR_LENGTH = -0.2,
  FITNESS_FACTOR_EQUALITY2 = 100,
  FITNESS_FACTOR_EQUALITY3 = 200,
  FITNESS_FACTOR_SYNTAX_ERROR = -1000,
  FITNESS_FACTOR_RUNTIME_ERROR = -100;

const DEBUG_LOGGING = false;

const stubProgram = {
    "type": "Program",
    "body": [
      {
        "type": "FunctionDeclaration",
        "id": {
          "type": "Identifier",
          "name": "a"
        },
        "params": [],
        "body": {
          "type": "BlockStatement",
          "body": [
            {
              "type": "BlockStatement",
              "body": []
            }
          ]
        },
        "generator": false,
        "expression": false,
        "async": false
      }
    ],
    "sourceType": "script"
  },
  createCodeFromAST = function (functionAst) {
    let codeAst = cloneDeep(stubProgram);

    codeAst.body[0].body.body = functionAst;
    return escodegen.generate(codeAst);
  };

class GeneticJS extends Genetic {
  constructor() {
    super();

    this.iteration = 0;
  }

  seed() {
    // start with a random assortment of 1-5 expression components
    let a = map(Array(Math.floor(1 + Math.random() * 3)), mutator.anyReturnStatement);

//     try {
// console.log('genetic.seed (after)', createCodeFromAST(a));
//     } catch(ex) {
//       // 
//     }

    return a;
  }

  mutate(entity) {
    // console.log('genetic.mutate (before)', JSON.stringify(entity, null, 4));
    // console.log('genetic.mutate (before)', entity.map(e => e.value).join(' '));

//     try {
// console.log('genetic.mutate (before)', createCodeFromAST(entity));
//     } catch(ex) {
//       // 
//     }

    const THRESHOLD = {
        DELETE: 0.90,
        SHUFFLE: 0.85,
        UPDATE: 0.4,
        INSERT: 0.0,

        // DELETE: 0.9999995,
        // SHUFFLE: 0.9999990,
        // UPDATE: 0.35,
        // INSERT: 0.30,
      },
      PARAMS = ['arguments[0]', 'arguments[1]', 'arguments[2]'],
      NUMBERS = '0123456789'.split(''),
      STRANGE_NUMBERS = ['+Infinity', '-Infinity', '+0', '-0', ],
      OPERATORS_BINARY = [';', ',', '||', '&&', '==' , '!=', '===', '!==', '>', '>=', '<', '<=', '+', '-', '/', '*', '%', '**', '&', '|', '^', '<<', '>>', '>>>'],
      OPERATORS_UNARY = ['!', '~', '++', '--', '-', '+'],
      desiredDatatype = ['undefined', 'number', 'boolean', 'string', 'object'].map(e => '"' + e + '"'),
      badDatatype = ['undefined', 'NaN', 'null', 'true', 'false', '[]', '{}'],
      ALL_OPERATORS = union(OPERATORS_BINARY, OPERATORS_UNARY),
      ALL_LITERALS = union(PARAMS, desiredDatatype, badDatatype, NUMBERS, STRANGE_NUMBERS),
      allElements = union(PARAMS, OPERATORS_BINARY, OPERATORS_UNARY, desiredDatatype, badDatatype, NUMBERS, STRANGE_NUMBERS),
      randOfArray = (a) => a[Math.floor(Math.random() * a.length)],
      NUM_OPTIONS = 3;

    let randVal = Math.random() * 1,
      pos = Math.floor(Math.random() * entity.length),
      newElem;
  
    // generate a random operation
    if(randVal > THRESHOLD.DELETE) {
      if (DEBUG_LOGGING) console.log('mutate DELETE');
      // delete a term
      entity.splice(pos, 1);

    // 
    } else
    if(randVal > THRESHOLD.SHUFFLE) {
      if (DEBUG_LOGGING) console.log('mutate SHUFFLE');
      // shuffle terms
      entity = shuffle(entity);

    // 
    } else
    if(randVal > THRESHOLD.UPDATE) {
      if (DEBUG_LOGGING) console.log('mutate UPDATE');
      // update a term
      let astNode = entity[pos];
      // temporary hack to avoid dealing with rare chance of `undefined` value for astNode
      if (!astNode) return entity;

      if ('BlockStatement' === astNode.type) {
        // randomly pick to either modify the top-level node or a node inside of it
        if (sample([true, false])) {
          astNode = mutator.anyBlockStatement();
        } else {
          if (astNode.body.length < 1) {
            astNode.body[0] = mutator.anyBlockStatement();
          } else {
            const posLvl2 = Math.floor(Math.random() * astNode.body.length);
            astNode.body[posLvl2] = mutator.anyBlockStatement();
          }
        }
      } else if ('ReturnStatement' === astNode.type) {
        // randonly pick to either modify the top-level node or a node inside of it
        if (sample([true, false])) {
          astNode = mutator.anyBlockStatement();
        } else {
          astNode.argument = mutator.anyExpression();
        }
      } else if ('ExpressionStatement' === astNode.type) {
        if (sample([true, false])) {
          astNode = mutator.anyBlockStatement();
        } else {
          astNode.expression = mutator.anyExpression();
        }
      }

      // update the element to the same type as previous to update
      entity[pos] = astNode;
  
    // 
    } else
    if(randVal > THRESHOLD.INSERT) {
      if (DEBUG_LOGGING) console.log('mutate INSERT');
      // insert new term(s)
      let numInserts = Math.random() * 3;
      while(numInserts-- > 0.0) {
        pos = Math.floor(Math.random() * entity.length);
        newElem = mutator.anyReturnStatement();
        if (pos === 0) {
          entity = union([newElem], entity);
        } else if (pos === entity.length) {
          entity = union(entity, [newElem]);
        } else {
          entity = union(entity.slice(0, pos + 1), [newElem], entity.slice(pos + 1));
        }
      }
    } else {
      if (DEBUG_LOGGING) console.log('mutate ELSE');
    }

//     try {
// console.log('genetic.mutate (after)', createCodeFromAST(entity));
//     } catch(ex) {
//       // 
//     }

    return entity;
  }

  fitness(entity) {
    // console.log('genetic.fitness: ', entity.map(e => e.value).join(' '));

    const tests = this.userData.TESTS || [];
    let gencode,
      gencodeLen,
      rjs,
      f = () => null,
      actual = null,
      rjso;

    try {
      gencode = createCodeFromAST(entity);
      if (DEBUG_LOGGING) console.log('generated code');
      if (DEBUG_LOGGING) console.log(newCode);
    } catch(ex)  {
      // console.error(ex);
      return FITNESS_FACTOR_SYNTAX_ERROR;
    }
    gencodeLen = gencode.length;
    rjs = '"use strict";' + gencode.substring(14, gencodeLen - 1);
    rjso = (code => {
// console.log(code);
        let fitPoints = 0,
          resultMatch2s = 0,
          resultMatch3s = 0;

// console.log(JSON.stringify({code}, null, 4));
        fitPoints = code.length * FITNESS_FACTOR_LENGTH;
        try {
          // this is effectively an `eval` statement
          f = new Function(code);
        } catch(err) {
          // if the code throws an exception, only add syntax error points
          // console.log('syntax error', err.message);
          fitPoints += FITNESS_FACTOR_SYNTAX_ERROR;
          return fitPoints;
        }
        tests.forEach(test => {
          try {
            actual = f.apply(null, test.params);
// console.log([actual, test.params]);
            if (actual == test.expected) {
// console.log('DOUBLE EQUALS!');
              ++resultMatch2s;
              // if expected == actual
              fitPoints += FITNESS_FACTOR_EQUALITY2;
              if (actual === test.expected) {
// console.log('TRIPLE EQUALS!');
                // console.log('fitness strict equality', [code, test.params, actual, test.expected]);
                ++resultMatch3s;
                // if expected === actual
                fitPoints += FITNESS_FACTOR_EQUALITY3;
              }
            } else {
// console.log('NO EQUALS!');
            }
          } catch(err) {
            // console.log('runtime error', err.message);
            // if the code throws an exception, only add runtime error points
            fitPoints += FITNESS_FACTOR_RUNTIME_ERROR;
          }
        });
        return fitPoints / (tests.length || 1);
      })(rjs);

// console.log('genetic.fitness returning: ', rjso);
    return rjso;
  }

  crossover(mother, father) {
    // console.log('genetic.crossover', [mother.map(e => e.value).join(' '), father.map(e => e.value).join(' ')]);

    // return [mother, father];

    // mix and match from components of both mother and father
    let son = (mother || []).map((e, i) => sample([father[i] || '', mother[i] || ''])),
      daughter = (father || []).map((e, i) => sample([mother[i] || '', father[i] || '']));
  
    return [son, daughter];
  }

  generation(pop, generation, stats) {
    this.iteration++;
// console.log('genetic.generation', JSON.stringify([pop, generation, stats], null, 4));
// console.log('genetic.generation conditional: ', JSON.stringify([pop[0].fitness, this.userData.TESTS.length, this.userData.goal], null, 4));
    return pop[0].fitness > (this.userData.TESTS.length * this.userData.goal);
  }

  notification(pop, generation, stats, isFinished) {
// console.log('genetic.notification: ', {isFinished});
    const now = (new Date).valueOf() / 1000,
      secondsElapsed = now - this.userData.startedAt,
      score = pop[0].fitness,
      avgGoal = this.userData.goal,
      goal = this.userData.TESTS.length * this.userData.goal;

    let gencode;

    try {
      gencode = createCodeFromAST(pop[0].entity);
    } catch(ex) {
      // console.error(ex);
    }

    console.log('genetic.notification', [pop, generation, stats, isFinished]);
    console.log(
      'iteration',
      ' ' + this.iteration + ' ',
      chalk.bold('elapsed: ') + chalk.gray(secondsElapsed.toFixed(3) + 's'),
      chalk.bold('score: '), chalk[score <= 0 ? 'red' : score <= goal ? 'gray' : 'green'](score.toFixed(1)),
      chalk.bold('/ ') + chalk.gray(goal),
      chalk.bold('code: '),
      gencode,
    );

    if(isFinished) {
      console.log('notification stats', stats);
      console.log('WINNER', chalk.black.bgWhite(pop[0].entity.map(e => e.value).join(' ')));
    }
  }
}

module.exports = GeneticJS;
