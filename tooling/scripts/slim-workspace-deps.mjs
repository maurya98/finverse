#!/usr/bin/env node
/**
 * Replaces @finverse/* workspace symlinks in node_modules with dist + package.json only.
 * Run after pnpm install (postinstall) so apps only see dist and package.json, not full lib source.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const NODE_MODULES_FINVERSE = path.join(ROOT, 'node_modules', '@finverse');
const LIBS = ['logger', 'utils', 'middlewares', 'cache'];

function slimDir(finversePath) {
  if (!fs.existsSync(finversePath)) return;
  const entries = fs.readdirSync(finversePath, { withFileTypes: true });
  for (const dirent of entries) {
    if (!dirent.isSymbolicLink() && !dirent.isDirectory()) continue;
    const name = dirent.name;
    if (!LIBS.includes(name)) continue;

    const targetPath = path.join(finversePath, name);
    let libPath;
    try {
      libPath = fs.realpathSync(targetPath);
    } catch {
      continue;
    }
    const relativeToRoot = path.relative(ROOT, libPath);
    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) continue;
    if (!relativeToRoot.startsWith('libs' + path.sep)) continue;

    const distPath = path.join(libPath, 'dist');
    const pkgPath = path.join(libPath, 'package.json');
    if (!fs.existsSync(distPath) || !fs.existsSync(pkgPath)) {
      continue;
    }

    const baseDir = path.dirname(finversePath);
    const tempDir = path.join(baseDir, '.slim-' + name);
    try {
      fs.mkdirSync(tempDir, { recursive: true });
      fs.cpSync(distPath, path.join(tempDir, 'dist'), { recursive: true });
      fs.copyFileSync(pkgPath, path.join(tempDir, 'package.json'));
      fs.rmSync(targetPath, { recursive: true, force: true });
      fs.renameSync(tempDir, targetPath);
    } catch (err) {
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

function slimWorkspaceDeps() {
  slimDir(NODE_MODULES_FINVERSE);
  const appsDir = path.join(ROOT, 'apps', 'backend');
  if (fs.existsSync(appsDir)) {
    for (const app of fs.readdirSync(appsDir)) {
      const appFinverse = path.join(appsDir, app, 'node_modules', '@finverse');
      slimDir(appFinverse);
    }
  }
  const frontendDir = path.join(ROOT, 'apps', 'frontend');
  if (fs.existsSync(frontendDir)) {
    for (const app of fs.readdirSync(frontendDir)) {
      const appFinverse = path.join(frontendDir, app, 'node_modules', '@finverse');
      slimDir(appFinverse);
    }
  }
}

slimWorkspaceDeps();
