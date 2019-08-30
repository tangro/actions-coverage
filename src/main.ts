import * as core from '@actions/core';
import fs from 'fs';

import {
  runCoverage,
  createCommentText as createCoverageComment
} from './coverage';
import { setStatus } from './github/status';
import { GitHubContext } from './github/context';
import { Result } from './Result';
import { createComment } from './github/comment';

async function wrapWithSetStatus<T>(
  context: GitHubContext,
  step: string,
  code: () => Promise<Result<T>>
) {
  setStatus({
    context,
    step,
    description: `Running ${step}`,
    state: 'pending'
  });

  try {
    const result = await code();
    setStatus({
      context,
      step,
      description: result.shortText,
      state: result.isOkay ? 'success' : 'failure'
    });
    return result;
  } catch (error) {
    setStatus({
      context,
      step,
      description: `Failed: ${step}`,
      state: 'failure'
    });
    core.setFailed(`CI failed at step: ${step}`);
  }
}

async function run() {
  try {
    const context = JSON.parse(
      process.env.GITHUB_CONTEXT || ''
    ) as GitHubContext;

    let comment = {
      text: ''
    };

    // Coverage
    await wrapWithSetStatus(context, 'coverage', async () => {
      const coverage = await runCoverage();
      comment.text += createCoverageComment(coverage);
      return coverage;
    });

    // Commit Comment
    // createComment({ context, comment: comment.text });
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

run();
