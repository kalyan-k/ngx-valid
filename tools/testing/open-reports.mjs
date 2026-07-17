import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { reportsRoot, workspaceRoot } from './report-paths.mjs';

const dashboard = path.join(reportsRoot, 'index.html');

if (!fs.existsSync(dashboard)) {
  console.error('Report dashboard not found. Run "npm run test:reports" first.');
  process.exitCode = 1;
} else {
  const launchers = {
    win32: { command: 'cmd.exe', args: ['/c', 'start', '', dashboard] },
    darwin: { command: 'open', args: [dashboard] },
    linux: { command: 'xdg-open', args: [dashboard] }
  };
  const launcher = launchers[process.platform];

  if (!launcher) {
    console.error(`Opening reports is not configured for platform "${process.platform}".`);
    process.exitCode = 1;
  } else {
    try {
      const result = spawnSync(launcher.command, launcher.args, {
        cwd: workspaceRoot,
        stdio: 'ignore',
        shell: false,
        windowsHide: true
      });
      if (result.error) {
        throw result.error;
      }
      if (result.status !== 0) {
        throw new Error(`platform opener exited with status ${result.status}`);
      }
      console.log(`Opened report dashboard: ${path.relative(workspaceRoot, dashboard)}`);
    } catch (error) {
      console.error(`Unable to open report dashboard: ${error instanceof Error ? error.message : error}`);
      process.exitCode = 1;
    }
  }
}
