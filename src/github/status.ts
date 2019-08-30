import { GitHubContext } from './context';
import { github } from './github';

const statusContext = 'Tangro CI';

export async function setStatus({
  context,
  step,
  description,
  state
}: {
  context: GitHubContext;
  step: string;
  description: string;
  state: 'pending' | 'success' | 'failure';
}) {
  const [owner, repo] = context.repository.split('/');

  await github.repos.createStatus({
    context: `${statusContext}/${step}`,
    description,
    owner,
    repo,
    sha: context.sha,
    state,
    target_url: ''
  });
}
