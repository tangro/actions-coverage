import { exec } from '@actions/exec';
import * as fs from 'fs';
import { Result } from './Result';
import { padEnd, padStart } from 'lodash';
import zip from 'bestzip';
import path from 'path';

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

const markdownTableCoverage = (coverage: Coverage): string => {
  const formatKey = (k: string) => padEnd(k, 7);
  const formatValue = (v: string) => padStart(v.toString(), 7);

  const header =
    padEnd('criterium', 10) +
    '|' +
    Object.keys(coverage.lines)
      .map(formatKey)
      .join('|') +
    '\n';

  return (
    header +
    header.replace(/[^|\n]/g, '-') +
    Object.keys(coverage)
      .map(
        x =>
          padEnd(x, 10) +
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
    lines.pct === 100 &&
    statements.pct === 100 &&
    functions.pct === 100 &&
    branches.pct === 100;
  const asMarkdownTable = markdownTableCoverage(coverageSummary);

  return {
    metadata: coverageSummary,
    isOkay,
    shortText,
    text: asMarkdownTable
  };
};

export async function runCoverage() {
  let output = '';
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      }
    }
  };
  await exec('npm', ['run', 'coverage:collect'], options);
  try {
    const resultFile = fs
      .readFileSync('./coverage/coverage-summary.json')
      .toString('utf-8');
    const total = JSON.parse(resultFile).total as Coverage;

    const coverageResults = parseCoverage(total);
    fs.writeFileSync('coverage.json', resultFile);
    return coverageResults;
  } catch (error) {
    throw error;
  }
}

export function createCommentText(results: Result<Coverage>) {
  return `\n## coverage summary
${results.text}`;
}

export async function zipFiles(): Promise<string> {
  const destination = path.join(__dirname, 'coverage.zip');
  await exec('zip', ['--quiet', '--recurse-paths', destination, '*'], {
    cwd: path.join(__dirname, 'coverage', 'lcov-report')
  });

  return destination;
}
