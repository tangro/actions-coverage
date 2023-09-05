# tangro/actions-coverage

A @tangro action to run jest with coverage. The command which is run is configurable and defaults to `coverage:collect`.

# Version

Either use a specific version of this action, or `latest` which should always point to the latest version of `tangro/actions-coverage`. The latest published version of this action is `v1.1.17`.

# Example Usage

```yml
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout latest code
        uses: actions/checkout@v4
      - name: Use Node.js 16.x
        uses: actions/setup-node@v3.8.1
        with:
          node-version: 16.x
      - name: Run npm install
        run: npm install
      - name: Collect Coverage
        uses: tangro/actions-coverage@v1.1.17
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
    uses: tangro/actions-coverage@v1.1.17
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
    uses: tangro/actions-coverage@v1.1.17
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
    uses: tangro/actions-coverage@v1.1.17
    with:
      coverage: 94
      coverage-lines: 96
      coverage-branches: 92
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      GITHUB_CONTEXT: ${{ toJson(github) }}
```

# Using with a static file server

You can also publish the results to a static file server. The action will write the results into `i18next/index.html`.

You can publish the results with our custom [deploy actions](https://github.com/tangro/actions-deploy)

```yml
coverage:
  runs-on: ubuntu-latest
  needs: test
  steps:
    - name: Checkout latest code
      uses: actions/checkout@v4
    - name: Use Node.js 16.x
      uses: actions/setup-node@v3.8.1
      with:
        node-version: 16.x
    - name: Authenticate with GitHub package registry
      run: echo "//npm.pkg.github.com/:_authToken=${{ secrets.ACCESS_TOKEN }}" >> ~/.npmrc
    - name: Run npm install
      run: npm install
    - name: Collect Coverage
      uses: tangro/actions-coverage@v1.1.17
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITHUB_CONTEXT: ${{ toJson(github) }}
    - name: Zip coverage results
      run: |
        cd coverage
        cd lcov-report
        zip --quiet --recurse-paths ../../coverage.zip *
    - name: Deploy coverage
      uses: tangro/actions-deploy@v1.2.16
      with:
        context: auto
        zip-file: coverage.zip
        deploy-url: ${{secrets.DEPLOY_URL}}
        project: coverage
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITHUB_CONTEXT: ${{ toJson(github) }}
        DEPLOY_PASSWORD: ${{ secrets.DEPLOY_PASSWORD }}
        DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
```

> **Attention** Do not forget to use the correct `DEPLOY_URL` and provide all the tokens the actions need.

## Development

Follow the guide of the [tangro-actions-template](https://github.com/tangro/tangro-actions-template)

# Scripts

- `npm run update-readme` - Run this script to update the README with the latest versions.

  > You do not have to run this script, since it is run automatically by the release action

- `npm run update-dependencies` - Run this script to update all the dependencies
