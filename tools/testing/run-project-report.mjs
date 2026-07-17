import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { cleanReports } from './clean-reports.mjs';
import {
  assertProject,
  npmRunInvocation,
  requiredProjectReports,
  workspaceRoot
} from './report-paths.mjs';

const projectName = process.argv[2];
const explicitCi = process.argv.includes('--ci');

try {
  assertProject(projectName);
  cleanReports(projectName);

  const useCiLauncher = explicitCi || process.env.CI === 'true';
  const scriptProject = projectName === 'demo-app' ? 'demo' : 'core';
  const scriptName = `test:coverage:${scriptProject}${useCiLauncher ? ':ci' : ''}`;
  const invocation = npmRunInvocation(scriptName);
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: workspaceRoot,
    env: process.env,
    stdio: 'inherit',
    shell: false
  });

  if (result.error) {
    throw result.error;
  }

  const missing = requiredProjectReports(projectName).filter((file) => !fs.existsSync(file));
  if (missing.length > 0) {
    console.error(`Missing generated ${projectName} report files:`);
    missing.forEach((file) => console.error(`- ${path.relative(workspaceRoot, file)}`));
  }

  process.exitCode = result.status !== 0 || missing.length > 0 ? 1 : 0;
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
}
