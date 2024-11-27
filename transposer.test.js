const fs = require('fs');
const glob = require('glob');
const path = require('path');

const transposers = [
  {
    name: 'aws-sns',
    cases: ['open', 'confirm']
  },
  {
    name: 'conviva',
    cases: ['open']
  },
  {
    name: 'fastly',
    cases: ['open']
  },
  {
    name: 'gcp-stackdriver-single',
    cases: ['open', 'closed']
  },
  {
    name: 'pd-v2',
    cases: ['open', 'resolve']
  }
].map((transposer) => Object.assign(transposer, { toString: function() { return this.name; }}));

describe.each(transposers)('%s', (transposer) => {
  let name = transposer.name;
  let cases = transposer.cases;

  for (const testCase of cases) {
    it(`correctly transposes ${testCase} case`, async () => {
      // Get the transposer file and load it
      let file = `./src/${name}.js`;
      let { transpose } = await require(file);

      // Load input and expected output JSONs
      // Then run input through transposer function and test output
      let inputFile = `./src/cases/${name}/${testCase}.input.json`;
      let expectedFile = `./src/cases/${name}/${testCase}.expected.json`;
      try {
        let inputJson = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
        const input = {
          data: inputJson
        };
        const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));

        let output = transpose(input);
        expect(output).toEqual(expected);

      } catch (err) {
        throw err;
      }
    });
  }
});
