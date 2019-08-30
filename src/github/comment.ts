import { GitHubContext } from './context';
import { github } from './github';

export async function createComment({
  context,
  comment
}: {
  context: GitHubContext;
  comment: string;
}) {
  const [owner, repo] = context.repository.split('/');

  await github.repos.createCommitComment({
    body: comment,
    commit_sha: context.sha,
    owner,
    repo
  });
}
