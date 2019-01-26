/* eslint-env node */

const GeneticJS = require('./src/geneticjs');
const TESTS = require('./gentests/1');

const nowUnixEpoch = function nowUnixEpoch() {
  return (new Date()).valueOf() / 1000;
};
const GOAL_PERCENTAGE = 0.98;

/**
 *
 */
(function topSif() {
  const g = new GeneticJS();

  g.evolve({
    fittestAlwaysSurvives: 1,
    iterations: 200000,
    maxResults: 9999999,
    size: 100,
    crossover: 0.4,
    mutation: 0.85,
    skip: 200,
  }, {
    // the test set (array)
    TESTS,

    // the average score required for each test to accept the generated code (number)
    // this should be high enough for few/no errors, most/all tests pass,
    // and a little leeway for code length
    goal: GOAL_PERCENTAGE,

    // timestamp of the start of the genetic algo (number)
    startedAt: nowUnixEpoch(),
  });
}());
