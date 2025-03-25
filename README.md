# Nemesis

A modern Node.js application template designed to jumpstart your projects with best practices and ready-to-use infrastructure.

## 🚀 About This Template

This is a template repository that provides a solid foundation for building modern Node.js applications. It's designed to be forked or used as a starting point for new projects, saving you hours of initial setup and configuration.

The template offers:

- **Ready-to-use infrastructure** with Docker, CI/CD workflows, and deployment scripts
- **Modern tech stack** with Node.js 22 and PNPM 10
- **Development best practices** baked in from the start
- **Production-ready configuration** for immediate deployment
- **Pterodactyl integration** for easy hosting on game server panels

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v22 or later
- [PNPM](https://pnpm.io/) v10 or later
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (optional, for containerized development)
- [Git](https://git-scm.com/)

## 🛠️ Getting Started

### Using This Template

```bash
# Clone the template (or use GitHub's "Use this template" button)
git clone https://github.com/enum314/nemesis.git my-new-project
cd my-new-project

# Customize for your project
# - Update package.json with your project details
# - Modify .env.example for your environment variables
# - Customize the Dockerfile if needed
# - Update this README!

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Local Development

```bash
# Start development environment
pnpm dev

# OR with Docker
docker-compose up app-dev
```

### Production Environment

```bash
# Start production environment with Docker
docker-compose up app-prod
```

## 🚢 Deployment Options

### 1. Server Deployment with Script

This template includes a deployment script that pulls directly from GitHub:

```bash
# First-time deployment
./deploy.sh --first-run --path /opt/nemesis

# Update existing deployment
./deploy.sh --update --path /opt/nemesis

# Specify a different GitHub repository
./deploy.sh --first-run --github-user username --repository repo-name --path /opt/nemesis

# For private repositories, include a personal access token
./deploy.sh --first-run --github-user username --repository repo-name --token YOUR_TOKEN --path /opt/nemesis
```

The deployment script supports various options:

```bash
Usage: deploy.sh [OPTIONS]
Options:
  --github-user USER GitHub username (default: enum314)
  --repository REPO  Repository name (default: nemesis)
  --token TOKEN     GitHub personal access token for private repos
  --branch NAME     Branch to deploy (default: main)
  --path PATH       Installation path (default: /opt/nemesis)
  --first-run       Perform first-time setup
  --force-rebuild   Force rebuild of Docker containers
  --show-logs       Show Docker logs after deployment
  --update          Update existing deployment
  --help            Show this help message
```

### 2. Pterodactyl Panel Deployment

The template includes Pterodactyl egg files for deployment on Pterodactyl game server panels:

- `egg-nemesis.json` - JSON format egg for Pterodactyl
- `egg-nemesis.yml` - YAML format egg for Pterodactyl

#### How to Use the Pterodactyl Egg:

1. **Import to Pterodactyl Panel**:

   - Log in to your Pterodactyl admin panel
   - Go to Nests > Import Egg
   - Upload the `egg-nemesis.json` file

2. **Create a New Server**:

   - In the Pterodactyl admin panel, create a new server
   - Select the Nemesis egg from the list
   - Configure server settings including port allocations and resources

3. **Configurable Options**:

   - **Auto Update**: Automatically pull changes on startup
   - **Node Environment**: Choose between production, development, staging, or test
   - **Additional Packages**: Install extra Node.js packages if needed
   - **Wipe Directory**: Option to clean installation directory
   - **Startup Command**: Customize how the application starts
   - **GitHub Repository Settings**:
     - **GitHub Username**: Username of the repository owner
     - **GitHub Repository**: Name of the repository to clone
     - **GitHub Branch**: Branch to use (default: main)
     - **GitHub Personal Access Token**: For private repositories (optional)

4. **After Installation**:
   - The server will automatically install your project from the specified GitHub repository
   - It will configure the correct port in .env
   - The server will build and start automatically

The deployment script handles:

- Environment setup
- Pulling latest changes from GitHub
- Building and starting Docker containers
- Intelligent rebuilding (only when needed)
- Status checking and error reporting

## 🏗️ Template Structure

```
nemesis/
├── .github/workflows/     # GitHub Actions CI/CD configurations
├── src/                   # Application source code
├── .dockerignore          # Files to exclude from Docker build
├── .env.example           # Example environment variables
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── deploy.sh              # Deployment script
├── egg-nemesis.json       # Pterodactyl egg (JSON format)
├── egg-nemesis.yml        # Pterodactyl egg (YAML format)
├── package.json           # Project metadata and scripts
├── pnpm-lock.yaml         # Lock file for dependencies
└── tsconfig.json          # TypeScript configuration
```

## 🐳 Docker

This project includes a multi-stage Dockerfile and Docker Compose configuration:

### Development

```bash
docker-compose up app-dev
```

- Hot reload enabled
- Source code mounted as a volume
- Running on port 3001
- Development dependencies included

### Production

```bash
docker-compose up app-prod
```

- Optimized build with minimal dependencies
- Running on port 3001
- Production-ready configuration

### Building Images Manually

```bash
# Build development image
docker build --target development -t nemesis-dev .

# Build production image
docker build --target production -t nemesis-prod .
```

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests and build
- `pnpm lint` - Check for code style issues
- `pnpm v:patch` - Version bump patch (0.0.x)
- `pnpm v:minor` - Version bump minor (0.x.0)
- `pnpm v:major` - Version bump major (x.0.0)

## 🚢 CI/CD

The template includes GitHub workflows for:

- **PR Staging**: Runs tests, lint checks, and builds on pull requests
- **Staging**: Runs tests and lint checks when merging to main

## 🛡️ Environment Variables

Copy `.env.example` to `.env` and adjust the variables as needed:

```bash
cp .env.example .env
```

Required environment variables:

- `PORT`: Application port (default: 3001)
- Other variables as specified in `.env.example`

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run linting
pnpm lint
```

## 📄 License

This template is licensed under the MIT License - see the LICENSE file for details.

## 👥 Customizing This Template

1. Replace this README with information specific to your project
2. Update package.json with your project details
3. Customize the Docker setup if needed
4. Update environment variables in .env.example
5. Add your application code to the src directory
