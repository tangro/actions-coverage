# actions-coverage

A @tangro action to run run jest with coverage. The command which is run is configurable and defaults to `coverage:collect`.

# Example Usage

```yml
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout latest code
        uses: actions/checkout@v1
      - name: Use Node.js 12.x
        uses: actions/setup-node@v1
        with:
          node-version: 12.x
      - name: Run npm install
        run: npm install
      - name: Collect Coverage
        uses: tangro/actions-coverage@1.1.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_CONTEXT: ${{ toJson(github) }}
```

> **Attention** Do not forget to pass the `GITHUB_TOKEN` and the `GITHUB_CONTEXT`

Steps the example job will perform:

1. Check out the latest code
2. Use node
3. Run npm install
4. (this action) Collect the coverage using jest

# Usage

The action will call `npm run ${command}`. The `command` can be specified by passing an input variable `command` to the Action. It defaults to `coverage:collect`. The `command` should run `jest --coverage --coverageReporters=\"json\" --coverageReporters=\"json-summary\" --coverageReporters=\"lcov\" --coverageReporters=\"text\"`.

The action will set a status to the commit to `pending` under the context `Tangro CI/coverage`. When it finishes successfully it will change the status to `success` and the coverage percentages will be displayed in the description. If it fails the action will set the status to `failed`.

It is also possible that the action posts a comment with the result to the commit. You have to set `post-comment` to `true`.

## Example with different command

```yml
steps:
  - name: Collect Coverage
    uses: tangro/actions-coverage@1.1.0
    with:
      command: 'coverage'
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      GITHUB_CONTEXT: ${{ toJson(github) }}
```

## Example with posting the result as a comment

```yml
steps:
  - name: Collect Coverage
    uses: tangro/actions-coverage@1.1.0
    with:
      post-comment: true
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      GITHUB_CONTEXT: ${{ toJson(github) }}
```

There is also an option to adapt the minimum coverage percentage limits that need to be achieved for the build to complete successfully (Defaults to `100`). You can configure an overall minimum by setting the action argument `coverage` and/or setting specific minimums for the different coverage metrics: `coverage-lines`, `coverage-statements`, `coverage-functions` or `coverage-branches`.

## Example with alternate coverage minimums

```yml
steps:
  - name: Collect Coverage
    uses: tangro/actions-coverage@1.1.0
    with:
      coverage: 94
      coverage-lines: 96
      coverage-branches: 92
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      GITHUB_CONTEXT: ${{ toJson(github) }}
```

## Development

Follow the guide of the [tangro-actions-template](https://github.com/tangro/tangro-actions-template)
