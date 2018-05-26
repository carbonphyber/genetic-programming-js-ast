module.exports = [
  {
    params: [0, 1],
    expected: 1,
  },
  {
    params: [null, 3],
    expected: 3,
  },
  {
    params: [-2, 1],
    expected: -2,
  },
  {
    params: [1, -2],
    expected: 1,
  },
  {
    params: [-1, 4],
    expected: -1,
  },
  {
    params: [4, -1],
    expected: 4,
  },
  {
    params: [1, 4],
    expected: 1,
  },
  {
    params: [undefined, 1],
    expected: 1,
  },
  {
    params: ['', 10],
    expected: 10,
  },
  {
    params: [false, 3],
    expected: 3,
  },
  {
    params: [1, 1],
    expected: 1,
  },
  {
    params: [13, 11],
    expected: 13,
  },
  {
    params: [-33, -111],
    expected: -33,
  },
  {
    params: [0, 0],
    expected: 0,
  },
  {
    params: [null, false],
    expected: false,
  },
  {
    params: [5.4, null],
    expected: 5.4,
  },
  {
    params: [10, 10],
    expected: 10,
  },
  {
    params: [-1, 1],
    expected: -1,
  },
  {
    params: [{}, -1],
    expected: {},
  },
  {
    params: [7, 10],
    expected: 7,
  },
  {
    params: [100, 1000],
    expected: 100,
  },
  {
    params: [1000, 10000],
    expected: 1000,
  },
  {
    params: [false, -111],
    expected: -111,
  },
  {
    params: [-111, true],
    expected: -111,
  },
  {
    params: [[], -111],
    expected: -111,
  },
  {
    params: [-111, []],
    expected: -222,
  },
  {
    params: [undefined, undefined],
    expected: undefined,
  },
];
