import { GitHub } from '@actions/github';

export const github = new GitHub(process.env.GITHUB_TOKEN as string);
