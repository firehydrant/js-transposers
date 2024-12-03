const fs = require('fs');
const glob = require('glob');
const path = require('path');

const transposers = require('./cases.json').map((transposer) => Object.assign(transposer, { toString: function() { return this.name; }}));

describe.each(transposers)('%s', (transposer) => {
  const name = transposer.name;
  const cases = transposer.cases;
  let transpose;
  let input, expected;

  beforeAll(async () => {
    // Get the transposer file and load it
    let file = `./src/${name}.js`;
    transpose = await require(file).transpose;

  });

  for (const testCase of cases) {
    let input, expected, output;
    // Load input and expected output JSONs
    // Then run input through transposer function and test output
    let inputFile = `./src/cases/${name}/${testCase}.input.json`;
    let expectedFile = `./src/cases/${name}/${testCase}.expected.json`;
    try {
      let inputJson = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
      input = {
        data: inputJson
      };
      expected = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));
    } catch (err) {
      throw err;
    }
    it(`${testCase} - should transpose in under 50 ms`, async () => {
      const startTime = performance.now();
      output = transpose(input);
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50);
    });

    it(`${testCase} - output should match expected`, async () => {
      expect(output).toEqual(expected);
    });
  }
});
