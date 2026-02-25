#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const ENV_FILE = process.env.READIUM_MOBILE_ENV_FILE ?? '.env.mobile';

const resolveEnvFile = () => path.resolve(process.cwd(), ENV_FILE);

const parseEnvFile = async (filePath) => {
  try {
    const content = await readFile(filePath, 'utf8');
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .reduce((acc, line) => {
        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) {
          return acc;
        }
        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();
        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        acc[key] = value;
        return acc;
      }, {});
  } catch (error) {
    console.warn(`build-mobile: failed to read ${filePath}: ${error.message}`);
    return {};
  }
};

const runBuild = (env) => {
  const nodeBin = process.execPath;
  const viteScript = path.resolve(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(nodeBin, [viteScript, 'build'], {
    env,
    stdio: 'inherit',
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (error) => {
    console.error(`build-mobile: failed to execute vite build: ${error.message}`);
    process.exit(1);
  });
};

const main = async () => {
  const envFilePath = resolveEnvFile();
  const fileEnv = await parseEnvFile(envFilePath);
  const mergedEnv = { ...process.env, ...fileEnv };
  runBuild(mergedEnv);
};

main();
