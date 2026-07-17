import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));

export const workspaceRoot = path.resolve(toolsDirectory, '..', '..');
export const reportsRoot = path.join(workspaceRoot, 'reports');
export const projects = Object.freeze(['core', 'demo-app']);

export function assertProject(projectName) {
  if (!projects.includes(projectName)) {
    throw new Error(`Unknown report project "${projectName}". Expected one of: ${projects.join(', ')}.`);
  }
}

export function projectReportRoot(projectName) {
  assertProject(projectName);
  return path.join(reportsRoot, projectName);
}

export function requiredProjectReports(projectName) {
  const root = projectReportRoot(projectName);
  return [
    path.join(root, 'tests', 'index.html'),
    path.join(root, 'tests', 'summary.json'),
    path.join(root, 'coverage', 'index.html'),
    path.join(root, 'coverage', 'coverage-summary.json'),
    path.join(root, 'junit', 'test-results.xml')
  ];
}

export function npmRunInvocation(scriptName) {
  const npmExecPath = process.env.npm_execpath;
  if (!npmExecPath) {
    throw new Error('The report runner must be started through an npm script so npm_execpath is available.');
  }

  return {
    command: process.execPath,
    args: [npmExecPath, 'run', scriptName]
  };
}

export function isDirectModule(moduleUrl) {
  if (!process.argv[1]) {
    return false;
  }

  return fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(moduleUrl));
}
