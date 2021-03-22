/* eslint-env node */
/* eslint-disable no-console */

const cluster = require('cluster');
const escodegen = require('escodegen');
const cloneDeep = require('lodash/cloneDeep');
const os = require('os');

const GeneticJS = require('./src/geneticjs');
const TESTS = require('./gentests/1');

const workers = [];

const nowUnixEpoch = function nowUnixEpoch() {
  return (new Date()).valueOf() / 1000;
};
const GOAL_PERCENTAGE = 0.98;

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

// to read number of cores on system
const numCores = os.cpus().length;

/**
 * Setup server either with clustering or without it
 * @param isClusterRequired
 * @constructor
 */
const setupProcess = (isClusterRequired) => {
  // if it is a master process then call setting up worker process
  if (isClusterRequired && cluster.isMaster) {
    console.log(`Master cluster setting up ${numCores} workers`);

    // iterate on number of cores need to be utilized by an application
    // current example will utilize all of them
    for (let i = numCores; i > 0; i -= 1) {
      // creating workers and pushing reference in an array
      // these references can be used to receive messages from workers
      workers[i] = cluster.fork();

      // to receive messages from worker process
      workers[i].on('message', (message) => {
        console.log(message);
        const astEntities = JSON.parse(message.msg.entities);
        console.log(JSON.stringify(astEntities, null, 4));
        console.log(createCodeFromAST(astEntities));
      });
    }

    // // process is clustered on a core and process id is assigned
    // cluster.on('online', (worker) => {
    //   // console.log(`Worker ${worker.process.pid} is listening`);
    // });

    // if any of the worker process dies then start a new one by simply forking another one
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
      // console.log('Starting a new worker');
      // cluster.fork();
      // workers.push(cluster.fork());
      // // to receive messages from worker process
      // workers[workers.length - 1].on('message', (message) => {
      //   console.log(message);
      // });
    });
  } else {
    console.log('Worker starting');
    const g = new GeneticJS();

    g.evolve({
      fittestAlwaysSurvives: 1,
      iterations: 2000,
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
  }
};

setupProcess(true);
