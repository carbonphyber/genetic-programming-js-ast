module.exports = [
  {
    params: [0, 1],
    expected: 5,
  },
  {
    params: [1, 1],
    expected: 3,
  },
  {
    params: [-2, 1],
    expected: -3,
  },
  {
    params: [1, -2],
    expected: 0,
  },
  {
    params: [-1, 4],
    expected: 2,
  },
  {
    params: [4, -1],
    expected: 7,
  },
  {
    params: [1, 4],
    expected: 6,
  },
  {
    params: [4, 1],
    expected: 9,
  },
  {
    params: [3, 1],
    expected: 7,
  },
  {
    params: [1, 3],
    expected: 5,
  },
  {
    params: [1, 1],
    expected: 3,
  },
  {
    params: [13, 11],
    expected: 37,
  },
  {
    params: [-33, -111],
    expected: -177,
  },
  {
    params: [-111, -33],
    expected: -255,
  },
  {
    params: [5, 5],
    expected: 15,
  },
  {
    params: [5.4, 5.4],
    expected: 16.2,
  },
  {
    params: [10, 10],
    expected: 30,
  },
  {
    params: [-1, 1],
    expected: -1,
  },
  {
    params: [1, -1],
    expected: 1,
  },
  {
    params: [1, 10],
    expected: 8,
  },
  {
    params: [100, 1000],
    expected: 800,
  },
  {
    params: [1000, 10000],
    expected: 8000,
  },
  {
    params: [false, -111],
    expected: -111,
  },
  {
    params: [-111, true],
    expected: -221,
  },
  // {
  //   params: [undefined, -111],
  //   expected: NaN,
  // },
  // {
  //   params: [-111, undefined],
  //   expected: NaN,
  // },
  // {
  //   params: [{}, -111],
  //   expected: NaN,
  // },
  // {
  //   params: [-111, {}],
  //   expected: NaN,
  // },
  {
    params: [[], -111],
    expected: -111,
  },
  {
    params: [-111, []],
    expected: -222,
  },
  // {
  //   params: [undefined, undefined],
  //   expected: NaN,
  // },
];
