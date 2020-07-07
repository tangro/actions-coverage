import { exec } from '@actions/exec';
import * as fs from 'fs';
import * as core from '@actions/core';
import path from 'path';
import { ExecOptions } from '@actions/exec/lib/interfaces';
import { Result } from '@tangro/tangro-github-toolkit';

interface Coverage {
  lines: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  statements: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  functions: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  branches: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
}

enum CoverageType {
  LINES = 'lines',
  STATEMENTS = 'statements',
  FUNCTIONS = 'functions',
  BRANCHES = 'branches'
}

const markdownTableCoverage = (coverage: Coverage): string => {
  const formatKey = (k: string) => k.padEnd(7);
  const formatValue = (v: string) => v.toString().padStart(7);

  const header =
    'criterium'.padEnd(10) +
    '|' +
    Object.keys(coverage.lines).map(formatKey).join('|') +
    '\n';

  return (
    header +
    header.replace(/[^|\n]/g, '-') +
    Object.keys(coverage)
      .map(
        x =>
          x.padEnd(10) +
          '|' +
          Object.keys(coverage[x])
            .map(k => coverage[x][k])
            .map(formatValue)
            .join('|')
      )
      .join('\n')
  );
};

const parseCoverage = (coverageSummary: Coverage): Result<Coverage> => {
  const { lines, statements, functions, branches } = coverageSummary;
  const shortText = `lns:${lines.pct}% bra:${branches.pct}% fun:${functions.pct}% stm:${statements.pct}%`;
  const isOkay =
    lines.pct >= getMinCoveragePct(CoverageType.LINES) &&
    statements.pct >= getMinCoveragePct(CoverageType.STATEMENTS) &&
    functions.pct >= getMinCoveragePct(CoverageType.FUNCTIONS) &&
    branches.pct >= getMinCoveragePct(CoverageType.BRANCHES);
  const asMarkdownTable = markdownTableCoverage(coverageSummary);

  return {
    metadata: coverageSummary,
    isOkay,
    shortText,
    text: asMarkdownTable
  };
};

const getMinCoveragePct = (type: CoverageType) => {
  const minValue = parseInt(
    core.getInput('coverage-' + type) || core.getInput('coverage') || ''
  );
  return !isNaN(minValue) ? minValue : 100;
};

export async function runCoverage({ repo }: { repo: string }) {
  let output = '';
  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      }
    }
  };
  const command = core.getInput('command') || 'coverage:collect';

  await exec('npm', ['run', command], options);
  try {
    const resultFile = fs
      .readFileSync(
        path.join(
          path.join(process.env.RUNNER_WORKSPACE as string),
          repo,
          'coverage',
          'coverage-summary.json'
        )
      )
      .toString('utf-8');
    const total = JSON.parse(resultFile).total as Coverage;

    const coverageResults = parseCoverage(total);
    fs.writeFileSync('coverage.json', resultFile);
    return coverageResults;
  } catch (error) {
    core.error(`ERROR: ${error}`);
    throw error;
  }
}

export function createCommentText(results: Result<Coverage>) {
  return `\n## coverage summary
${results.text}`;
}
