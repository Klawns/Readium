#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';

const ENV_FILE = process.env.READIUM_MOBILE_ENV_FILE ?? '.env.mobile';
const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const resolveEnvFile = () => path.resolve(process.cwd(), ENV_FILE);

const isValidEnvKey = (key) => ENV_KEY_PATTERN.test(key);

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
        if (!isValidEnvKey(key)) {
          console.warn(`build-mobile: ignoring invalid environment key "${key}" from ${filePath}`);
          return acc;
        }

        let value = line.slice(separatorIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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

const applyEnvOverrides = (fileEnv) => {
  const previousValues = new Map();

  for (const [key, value] of Object.entries(fileEnv)) {
    previousValues.set(key, process.env[key]);
    process.env[key] = value;
  }

  return () => {
    for (const [key, previousValue] of previousValues.entries()) {
      if (previousValue === undefined) {
        delete process.env[key];
        continue;
      }

      process.env[key] = previousValue;
    }
  };
};

const main = async () => {
  const envFilePath = resolveEnvFile();
  const fileEnv = await parseEnvFile(envFilePath);
  const restoreEnv = applyEnvOverrides(fileEnv);

  try {
    await build();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`build-mobile: vite build failed: ${reason}`);
    process.exit(1);
  } finally {
    restoreEnv();
  }
};

main();
