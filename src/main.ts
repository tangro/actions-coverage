import * as core from '@actions/core';
import {
  GitHubContext,
  createComment,
  wrapWithSetStatus
} from '@tangro/tangro-github-toolkit';
import {
  runCoverage,
  createCommentText as createCoverageComment
} from './coverage';

async function run() {
  try {
    const context = JSON.parse(
      process.env.GITHUB_CONTEXT || ''
    ) as GitHubContext<{}>;
    const [owner, repo] = context.repository.split('/');

    let comment = {
      text: ''
    };

    // Coverage
    await wrapWithSetStatus(context, 'coverage', async () => {
      const coverage = await runCoverage({ repo });
      comment.text += createCoverageComment(coverage);
      return coverage;
    });

    // Commit Comment
    if (core.getInput('post-comment') === 'true') {
      createComment({ context, comment: comment.text });
    }
  } catch (error) {
    core.error(error as any);
    core.setFailed((error as any)?.message ?? 'ERROR happened');
  }
}

run();
