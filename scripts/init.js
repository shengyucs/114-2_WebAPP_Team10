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
};

console.log(
  `\n${colors.cyan}🚀 [Project Init] Starting initialization...${colors.reset}\n`,
);

function run(command, cwd = rootDir) {
  const displayCwd = path.relative(rootDir, cwd) || 'root';
  console.log(
    `${colors.yellow}📦 [${displayCwd}] Running: ${command}${colors.reset}`,
  );
  try {
    execSync(command, { cwd, stdio: 'inherit' });
  } catch {
    console.error(
      `\n${colors.red}❌ Command failed in [${displayCwd}]: ${command}${colors.reset}`,
    );
    process.exit(1);
  }
}

// 1. Install Dependencies
run('npm install');
if (fs.existsSync(path.join(rootDir, 'frontend')))
  run('npm install', path.join(rootDir, 'frontend'));
if (fs.existsSync(path.join(rootDir, 'backend')))
  run('npm install', path.join(rootDir, 'backend'));

// 2. Setup Backend .env
const backendEnvPath = path.join(rootDir, 'backend', '.env');
const backendEnvExamplePath = path.join(rootDir, 'backend', '.env.example');

if (!fs.existsSync(backendEnvPath)) {
  console.log(`\n${colors.cyan}📄 Setting up backend/.env...${colors.reset}`);
  if (fs.existsSync(backendEnvExamplePath)) {
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
    console.log(`${colors.green}   ✅ Copied from .env.example${colors.reset}`);
  } else {
    const defaultEnv = 'PORT=5000';
    fs.writeFileSync(backendEnvPath, defaultEnv);
    console.log(
      `${colors.green}   ✅ Created with default values${colors.reset}`,
    );
  }
}

// 2.1 Setup Backend .env.docker
const backendEnvDockerPath = path.join(rootDir, 'backend', '.env.docker');
if (!fs.existsSync(backendEnvDockerPath)) {
  console.log(
    `\n${colors.cyan}📄 Setting up backend/.env.docker...${colors.reset}`,
  );
  const dockerEnv = 'PORT=5000\nNODE_ENV=development';
  fs.writeFileSync(backendEnvDockerPath, dockerEnv);
  console.log(`${colors.green}   ✅ Created for Docker stack${colors.reset}`);
}

// 3. Setup Frontend .env (Optional but good practice)
const frontendEnvPath = path.join(rootDir, 'frontend', '.env');
if (!fs.existsSync(frontendEnvPath)) {
  console.log(`${colors.cyan}📄 Setting up frontend/.env...${colors.reset}`);
  const defaultFrontendEnv = 'VITE_API_URL=http://localhost:5000';
  fs.writeFileSync(frontendEnvPath, defaultFrontendEnv);
  console.log(
    `${colors.green}   ✅ Created with default VITE_API_URL${colors.reset}`,
  );
}

// 4. Initialize Husky
run('npx husky');

console.log('\n---------------------------------------');
console.log(
  `${colors.green}✨ Initialization complete! Running final check...${colors.reset}`,
);

// 5. Run Doctor
run('npm run doctor');
