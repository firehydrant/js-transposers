# js-transposers

Collection of FireHydrant Event Source transposers written in JavaScript along with their test cases.

## Getting Started

### Prerequisites

This repository was built and tested with:

- [Node v20.10.0](https://nodejs.org/en)
- [PNPM v9.11.0](https://pnpm.io/)

### Installation

```bash
# Clone repo
git clone https://github.com/FireHydrant/js-transposers && cd js-transposers

# Install dependencies
pnpm i

# Run automated tests
pnpm test
```

## Adding Transposers

On FireHydrant, the term "Transposer" and "Event Source" are used interchangeably. The repository is laid out like so:
```
[14:12:47] vthanh:js-transposers git:(main) $ tree
.
├── LICENSE
├── README.md
├── cases.json                             // Edit this file to add Transposers/test cases
├── node_modules
├── package.json
├── pnpm-lock.yaml
├── src
│   ├── [transposer-name].js               // Add new files in ./src for Transposer source code
│   ├── cases
│   │   ├── [transposer-name]              // Add new folder for Transposer test cases
│   │   │   ├── [test-case].expected.json  // All test cases must have corresponding `input` and
│   │   │   └── [test-case].input.json     //   `expected` files
│   │   ├── ...etc.
│   ├── ...etc.
└── transposer.test.js
```

The most important points are that:
- The name of the Transposers and their test cases should be slugified with dashes.
- The name of the Transposer must match and remain consistent on the source code file and for the folder of test cases. **If these names are different, the test suite will not be able to match the test cases to the Transposer**.
- All test cases must have corresponding `input` and `expected` JSON files.

### Adding Test Cases

1. First, add the Transposer and its test cases to `cases.json`. In this example, we'll add `alertmanager`:
```json
[
  {
    "name": "alertmanager",
    "cases": ["open"]
  },
  ...etc.
```

2. Create a folder under `./src/cases/` and slugify the name of your Transposer (for example, `alertmanager`).
```bash
mkdir ./src/cases/alertmanager
```

3. Fetch an example payload from your monitoring tool and paste into a test case input file with `.input.json` suffix. 
```bash
# On mac, pbpaste pastes the content of your clipboard. Other OS may have different commands. You can also just create the file and paste.
pbpaste > ./src/cases/alertmanager/open.input.json
```

4. Now, construct the expected outcome of transposing your JSON input in the expected output file. Refer to FireHydrant's [Events Data Model](https://docs.firehydrant.com/docs/events-data-model) for all the possible parameters.

```bash
touch ./src/cases/alertmanager/open.expected.json # ...then edit file etc.
```

5. Now, if you run the test suite, you should see a test failure for your new Transposer/test cases.
```bash
[15:22:34] johndoe:js-transposers git:(main*) $ pnpm test

> js-transposers@1.0.0 test /Users/johndoe/workspace/js-transposers
> NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" jest

 FAIL  ./transposers.test.js
  alertmanager
    ✕ open - should transpose in under 50 ms
    ✕ open - output should match expected
  aws-sns
    ✓ open - should transpose in under 50 ms (1 ms)
    ✓ open - output should match expected (1 ms)
    ✓ confirm - should transpose in under 50 ms
    ✓ confirm - output should match expected (1 ms)
  conviva
    ✓ open - should transpose in under 50 ms (1 ms)
    ✓ open - output should match expected
    ... (output truncated)

  ● alertmanager › open

    Cannot find module './src/alertmanager.js' from 'transposers.test.js'
    ...
```

### Adding Transposer Source Code

1. Copy `./src/template.js` into a new file named after your new transposer.

```bash
cd ./src && cp template.js alertmanager.js
```

2. Edit the file so that it transposes what you need. There are some important notes here:

- You cannot make API or network calls in custom transposers. Even though it will work here (because we're using Node.js), once you copy it to FireHydrant, it will fail.
- The Transposer function must be compatible with ECMAScript 5.1.
- The Transposer function must execute in under 50 ms.

For more information, visit [Custom Event Source docs](https://docs.firehydrant.com/docs/custom-event-source). For examples, see the other Transposer files in the repository.

3. Continue editing until your test cases pass.

## Adding Transposer to FireHydrant

Once you've finished adding a new Transposer and testing it out, you can copy and paste the files into FireHydrant.

1. Go to FireHydrant's web UI > Signals > Event Sources > Custom Event Sources > "+ Add custom event source"
2. In the **Request Body**, copy the contents of one of your test cases. For example, `./src/cases/alertmanager/open.input.json` and click 'Next'.
3. For the Transposition script, copy the contents of your new Transposer, **excluding the `module.exports`**.
4. Click to test the configuration and then save.

For more information, visit [Custom Event Source documentation](https://docs.firehydrant.com/docs/custom-event-source).
