import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(
  `\n${colors.cyan}🔍 [Project Doctor] Checking your development environment...${colors.reset}\n`,
);

function checkCommand(name, command, fallback = null) {
  try {
    const version = execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    console.log(
      `${colors.green}  ✅ ${name.padEnd(15)}: Installed (${version})${colors.reset}`,
    );
    return true;
  } catch {
    if (fallback) {
      return checkCommand(name, fallback);
    }
    console.log(
      `${colors.red}  ❌ ${name.padEnd(15)}: Not found. Please install it.${colors.reset}`,
    );
    return false;
  }
}

function checkPath(name, relativePath, isRequired = true) {
  const fullPath = path.join(rootDir, relativePath);
  if (fs.existsSync(fullPath)) {
    console.log(
      `${colors.green}  ✅ ${name.padEnd(15)}: Exists (${relativePath})${colors.reset}`,
    );
    return true;
  } else {
    const color = isRequired ? colors.red : colors.yellow;
    const icon = isRequired ? '❌' : '⚠️';
    console.log(
      `${color}  ${icon} ${name.padEnd(15)}: Missing! (${relativePath})${colors.reset}`,
    );
    return false;
  }
}

// 1. Tool Checks
console.log(`${colors.white}--- Tools ---${colors.reset}`);
checkCommand('Node.js', 'node -v');
checkCommand('NPM', 'npm -v');
checkCommand('Git', 'git --version');
checkCommand('Docker', 'docker --version');
checkCommand('Docker Compose', 'docker compose version');
checkCommand('Vitest', 'npx vitest -v');

// 2. Project Structure Checks
console.log(`\n${colors.white}--- Project Structure ---${colors.reset}`);
checkPath('Frontend Dir', 'frontend');
checkPath('Backend Dir', 'backend');
checkPath('Shared Dir', 'shared');
checkPath('Tailwind Config', 'frontend/tailwind.config.js');

// 3. Dependency Checks
console.log(`\n${colors.white}--- Dependencies ---${colors.reset}`);
const rootNM = checkPath('Root modules', 'node_modules', true);
const frontNM = checkPath('Frontend modules', 'frontend/node_modules', true);
const backNM = checkPath('Backend modules', 'backend/node_modules', true);

if (!rootNM || !frontNM || !backNM) {
  console.log(
    `${colors.yellow}\n  💡 Tip: Some dependencies are missing. Run 'npm run init' to install all of them.${colors.reset}`,
  );
}

// 4. Configuration Checks
console.log(`\n${colors.white}--- Configuration ---${colors.reset}`);
const backendEnv = path.join(rootDir, 'backend', '.env');
if (!fs.existsSync(backendEnv)) {
  console.log(
    `${colors.yellow}  ⚠️  Backend .env  : Missing (Run 'npm run init' to fix)${colors.reset}`,
  );
} else {
  console.log(`${colors.green}  ✅ Backend .env  : Ready${colors.reset}`);
}

const backendEnvDocker = path.join(rootDir, 'backend', '.env.docker');
if (!fs.existsSync(backendEnvDocker)) {
  console.log(
    `${colors.yellow}  ⚠️  Backend .env.docker: Missing (Run 'npm run init' to fix)${colors.reset}`,
  );
} else {
  console.log(`${colors.green}  ✅ Backend .env.docker: Ready${colors.reset}`);
}

console.log(
  `\n${colors.cyan}💡 Tip: If you plan to use Docker only, you can ignore missing local node_modules.${colors.reset}`,
);

console.log('\n---------------------------------------');
console.log(
  `${colors.cyan}Done! If you see any red marks, please resolve them before developing.${colors.reset}\n`,
);
