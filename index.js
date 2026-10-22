import yargs from 'yargs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import { createInterface } from 'readline';
import { setupPrimary, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';

const rl = createInterface(process.stdin, process.stdout);
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { name, author } = require(join(__dirname, './package.json'));

console.log(chalk.hex('#9b5cff')('┌──────────────────────────────────────┐'))
console.log(chalk.magentaBright('│                                      │'))
console.log(chalk.cyanBright.bold('│   ██████╗ ██╗   ██╗ ██████╗          │'))
console.log(chalk.cyanBright.bold('│   ██╔══██╗╚██╗ ██╔╝██╔═══██╗         │'))
console.log(chalk.yellowBright.bold('│   ██████╔╝ ╚████╔╝ ██║   ██║         │'))
console.log(chalk.yellowBright.bold('│   ██╔══██╗  ╚██╔╝  ██║   ██║         │'))
console.log(chalk.greenBright.bold('│   ██║  ██║   ██║   ╚██████╔╝         │'))
console.log(chalk.greenBright.bold('│   ╚═╝  ╚═╝   ╚═╝    ╚═════╝          │'))
console.log(chalk.magentaBright('│                                      │'))
console.log(chalk.hex('#9b5cff')('├──────────────────────────────────────┤'))
console.log(chalk.white(`│ Bot Name : ${name || 'ryo-yamada-md'}           │`))
console.log(chalk.white(`│ Author   : @${author.name || author || 'Hilman'}               │`))
console.log(chalk.hex('#9b5cff')('└──────────────────────────────────────┘'))
console.log(chalk.green('🎸 [SYSTEM] Ryo Yamada MD is booting up...\n'));

let isRunning = false;
let worker = null;
let manualReset = false;
let restartTimer = null;
let crashStreak = 0;

const MIN_DELAY = 3000;
const MAX_DELAY = 30000;
const STABLE_AFTER = 10000;

const opts = yargs(process.argv.slice(2)).exitProcess(false).parse();

if (!opts['test']) {
  rl.on('line', line => {
    worker?.emit('message', line.trim());
  });
}

function start(file) {
  if (isRunning) return;
  isRunning = true;

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  
  setupPrimary({ exec: args[0], args: args.slice(1) });
  const p = fork();
  worker = p;
  const startedAt = Date.now();

  p.on('message', data => {
    console.log('[✅RECEIVED]', data);
    switch (data) {
      case 'reset':
        manualReset = true;
        p.kill();
        break;
      case 'uptime':
        p.send(process.uptime());
        break;
      default:
        console.warn('[⚠️ UNRECOGNIZED MESSAGE]', data);
    }
  });

  p.on('exit', (code, signal) => {
    isRunning = false;
    if (worker === p) worker = null;
    console.error('[❗] Exited with code:', code, signal ? `signal: ${signal}` : '');

    if (manualReset) {
      manualReset = false;
      crashStreak = 0;
      return start(file);
    }

    if (code !== 0) {
      crashStreak = Date.now() - startedAt < STABLE_AFTER ? crashStreak + 1 : 0;
      const delay = Math.min(MIN_DELAY * 2 ** Math.max(crashStreak - 1, 0), MAX_DELAY);
      console.log(`[🔄] Restarting worker in ${delay / 1000}s...`);
      clearTimeout(restartTimer);
      restartTimer = setTimeout(() => start(file), delay);
      return;
    }

    crashStreak = 0;
    watchFile(args[0], () => {
      unwatchFile(args[0]);
      start(file);
    });
  });
}

start('main.js');
