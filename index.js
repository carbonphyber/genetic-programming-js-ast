'use strict';

const escodegen = require('escodegen'),
    esprima = require('esprima'),
    _ = require('lodash'),
  
    GeneticJS = require('./src/geneticjs'),
    mutator = require('./src/mutator'),
    TESTS = require('./gentests/2'),

    MAX_PER_TEST = 300,
    GOAL_PERCENTAGE = 0.98;

/**
 * 
 */
(function () {
    let g = new GeneticJS();
  
    g.evolve({
        'fittestAlwaysSurvives': 1,
        'iterations': 20000,
        'maxResults': 9999999,
        'size': 20,
        'crossover': 0.4,
        'mutation': 0.5,
        'skip': 20,
    }, {
        // the test set (array)
        'TESTS': TESTS,
    
        // the average score required for each test to accept the generated code (number)
        // this should be high enough for few/no errors, most/all tests pass, and a little leeway for code length
        'goal': TESTS.length * MAX_PER_TEST * GOAL_PERCENTAGE,
    
        // timestamp of the start of the genetic algo (number)
        'startedAt': (new Date).valueOf() / 1000,
    });
})();
