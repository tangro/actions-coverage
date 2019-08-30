import { exec } from '@actions/exec';

export async function runInstall() {
  await exec('npm', ['install']);
}
