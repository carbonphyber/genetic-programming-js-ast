'use strict';

const cloneDeep = require('lodash/cloneDeep'),
    sample = require('lodash/sample'),

    // // facilitates communcation between web workers
    // addslashes = function (str) {
    //     return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    // },
    Serialization = {
        "stringify": function (obj) {
            return JSON.stringify(obj, function (key, value) {
                if (value instanceof Function || typeof value == "function") return "__func__:" + value.toString();
                if (value instanceof RegExp) return "__regex__:" + value;
                return value;
            });
        },
        "parse": function (str) {
            return JSON.parse(str, function (key, value) {
                if (typeof value != "string") return value;
                if (value.lastIndexOf("__func__:", 0) === 0) return eval('(' + value.slice(9) + ')');
                if (value.lastIndexOf("__regex__:", 0) === 0) return eval('(' + value.slice(10) + ')');
                return value;
            });
        }
    };

const Optimize = {
        "Maximize": function Maximize(a, b) {
            return a >= b;
        },
        "Minimize": function Minimize(a, b) {
            return a < b;
        },
        "MaximizeRandEqual": function Maximize(a, b) {
            if (a !== b) {
                return a > b;
            } else {
                // if a and b are equal, randomize the "Maximized" value
                return Math.random() >= 0.5;
            }
        },
        "MinimizeRandEqual": function Minimize(a, b) {
            if (a !== b) {
                return a < b;
            } else {
                // if a and b are equal, randomize the "Maximized" value
                return Math.random() >= 0.5;
            }
        },
    };
const Select1 = {
        "Tournament2": function Tournament2(pop) {
            let a = sample(pop);
            let b = sample(pop);
            return Optimize.MaximizeRandEqual(a.fitness, b.fitness) ?
                a.entity :
                b.entity;
        },
        "Tournament3": function Tournament3(pop) {
            let a = sample(pop);
            let b = sample(pop);
            let c = sample(pop);
            let best = Optimize.MaximizeRandEqual(a.fitness, b.fitness) ?
                    a :
                    b;
            best = Optimize.MaximizeRandEqual(best.fitness, c.fitness) ?
                best :
                c;
            return best.entity;
        },
        "Fittest": function Fittest(pop) {
            return pop[0].entity;
        },
        "Random": function Random(pop) {
            return sample(pop).entity;
        },
        // "RandomLinearRank": (pop) => {
        //     this.internalGenState["rlr"] = this.internalGenState["rlr"] || 0;
        //     return pop[Math.floor(Math.random() * Math.min(pop.length, (this.internalGenState["rlr"]++)))].entity;
        // },
        // "Sequential": (pop) => {
        //     this.internalGenState["seq"] = this.internalGenState["seq"] || 0;
        //     return pop[(this.internalGenState["seq"]++) % pop.length].entity;
        // },
    };

const Select2 = {
        "Tournament2": function Tournament2(pop) {
            return [
                Select1.Tournament2.call(this, pop),
                Select1.Tournament2.call(this, pop)
            ];
        },
        "Tournament3": function Tournament3(pop) {
            return [
                Select1.Tournament3.call(this, pop),
                Select1.Tournament3.call(this, pop)
            ];
        },
        "Random": function Random(pop) {
            return [
                Select1.Random.call(this, pop),
                Select1.Random.call(this, pop)
            ];
        },
        // "RandomLinearRank": function RandomLinearRank(pop) {
        //     return [
        //         Select1.RandomLinearRank.call(this, pop),
        //         Select1.RandomLinearRank.call(this, pop)
        //     ];
        // },
        // "Sequential": function Sequential(pop) {
        //     return [
        //         Select1.Sequential(this, pop),
        //         Select1.Sequential(this, pop)
        //     ];
        // },
        "FittestRandom": function FittestRandom(pop) {
            return [
                Select1.Fittest.call(this, pop),
                Select1.Random.call(this, pop)
            ];
        },
    };


class GeneticAbstract {
    constructor(props) {
        this.optimize = null;
        this.select1 = null;
        this.select2 = null;

        this.configuration = {
            "size": 250,
            "crossover": 0.9,
            "mutation": 0.2,
            "iterations": 100,
            "fittestAlwaysSurvives": true,
            "maxResults": 100,
            "skip": 0,
        };

        this.userData = {};
        this.internalGenState = {};
        this.entities = [];
    }

    // this group of functions to be overridden by subclasses
    crossover() {}
    fitness() {}
    generation() {}
    mutate() {}
    notification() {}
    seed() {}

    mutateOrNot(roll, entity) {
        // applies mutation based on mutation probability
        return roll <= this.configuration.mutation && this.mutate ?
            this.mutate(cloneDeep(entity)) :
            entity;
    }

    start() {
        let conf = this.configuration,
            iters = conf.iterations || 0,
            i,
            seed;

        // seed the population
        for (i = 0; i < conf.size; ++i)  {
            seed = cloneDeep(this.seed());
            this.entities.push(seed);
        }

// console.log('this(.start): ', this);
        for (i = 0; i < conf.iterations; ++i) {
            // reset for each generation
            this.internalGenState = {};

            // score and sort
            let pop = this.entities
                    .map(entity => {
                        return {
                                "fitness": this.fitness(entity),
                                "entity": entity
                            };
                    })
                    .sort((a, b) => {
// console.log('this(.optimize): ', this);
                        return this.optimize(a.fitness, b.fitness) ?
                                -1 :
                                1;
                    });

            // generation notification
            let mean = pop.reduce((a, b) => (a + b.fitness), 0) / (pop.length || 1);
            let stdev = Math.sqrt(pop
                    .map(a => ((a.fitness - mean) * (a.fitness - mean)))
                    .reduce( (a, b) => (a + b), 0) / (pop.length || 1));

            let stats = {
                    "maximum": pop[0].fitness,
                    "minimum": pop[pop.length - 1].fitness,
                    "mean": mean,
                    "stdev": stdev
                };

            let r = this.generation(pop.slice(0, conf["maxResults"]), i, stats);
            let isFinished = !!r || (i == conf.iterations - 1);
// console.log({r, i, 'iterations': conf.iterations, isFinished});

            if (
                isFinished ||
                conf["skip"] === 0 ||
                i % conf["skip"] === 0
            ) {
                this.sendNotification(pop.slice(0, conf["maxResults"]), i, stats, isFinished);
            }

            if (isFinished)
                break;

            // crossover and mutate
            let newPop = [];

            if (conf.fittestAlwaysSurvives) // lets the best solution fall through
                newPop.push(pop[0].entity);

            while (newPop.length < conf.size) {
                if (
                    Math.random() <= conf.crossover // base crossover on specified probability
                    && newPop.length + 1 < conf.size // keeps us from going 1 over the max population size
                ) {
                    let parents = this.select2(pop);
                    let children = this.crossover(cloneDeep(parents[0]), cloneDeep(parents[1])).map(e => this.mutateOrNot(Math.random(), e));
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
        let response = {
                "pop": pop.map(Serialization.stringify),
                "generation": generation,
                "stats": stats,
                "isFinished": isFinished
            };

        this.notification(response.pop.map(Serialization.parse), response.generation, response.stats, response.isFinished);
    }

    evolve(config, userData) {
        let k;
        for (k in config) {
            this.configuration[k] = config[k];
        }

        for (k in userData) {
            this.userData[k] = userData[k];
        }

        // // bootstrap webworker script
        // var blobScript = "'use strict'\n";
        // blobScript += "var Serialization = {'stringify': " + Serialization.stringify.toString() + ", 'parse': " + Serialization.parse.toString() + "};\n";

        // // make available in webworker
        // blobScript += "var Optimize = Serialization.parse(\"" + addslashes(Serialization.stringify(Optimize)) + "\");\n";
        // blobScript += "var Select1 = Serialization.parse(\"" + addslashes(Serialization.stringify(Select1)) + "\");\n";
        // blobScript += "var Select2 = Serialization.parse(\"" + addslashes(Serialization.stringify(Select2)) + "\");\n";

        // // materialize our ga instance in the worker
        // blobScript += "var genetic = Serialization.parse(\"" + addslashes(Serialization.stringify(this)) + "\");\n";
        // blobScript += "onmessage = function(e) { genetic.start(); }\n";

        // // simulate webworker
        // (function(){
        //     eval(blobScript);
        // })();

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
