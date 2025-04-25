# Nemesis

A modern Discord bot template designed to jumpstart your bot development with best practices and ready-to-use infrastructure. While primarily focused on Discord bots, Nemesis can also serve as a foundation for any Node.js application.

## 🚀 About This Template

This is a template repository that provides a solid foundation for building modern Discord bots and Node.js applications. It's designed to be forked or used as a starting point for new projects, saving you hours of initial setup and configuration.

The template offers:

- **Discord.js integration** with advanced sharding and bot framework
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

The template includes Pterodactyl egg files for deployment on Pterodactyl game server panels. This is the **recommended and primary deployment method** for this bot template:

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

   - **Startup Command**: Customize how the application starts (default: `prisma migrate deploy && node .`)
   - **GitHub Repository Settings**:
     - **GitHub Username**: Username of the repository owner
     - **GitHub Repository**: Name of the repository to clone
     - **GitHub Tag**: Release tag to deploy (use 'latest' for most recent)
     - **GitHub Personal Access Token**: For private repositories (optional)

4. **After Installation**:
   - The server will automatically install your project from the specified GitHub repository
   - It will configure the correct port in .env
   - On each startup, the update script will:
     - Clean the dist/ directory
     - Download the latest release from GitHub
     - Verify the integrity of the downloaded files
     - Extract the release
     - Install production dependencies
   - The server will then run your specified startup command

### Update Script

The bot includes an automatic update script (`scripts/update.sh`) that runs before the main application starts on Pterodactyl. This script:

- Retrieves the latest release from your GitHub repository
- Cleans up the dist/ directory to ensure a fresh deployment
- Verifies file integrity with checksums
- Installs production dependencies with `pnpm install --production`

The update script uses environment variables set in the Pterodactyl egg:

- `GITHUB_USERNAME` - GitHub username for the repository
- `GITHUB_REPOSITORY` - Name of the repository
- `GITHUB_TAG` - Release tag to fetch (default: latest)
- `GITHUB_TOKEN` - Optional token for private repositories

This ensures your bot is always running the latest release with all dependencies properly installed.

## 🏗️ Template Structure

```
nemesis/
├── .github/workflows/     # GitHub Actions CI/CD configurations
├── scripts/               # Utility scripts
│   └── update.sh          # Auto-update script for Pterodactyl
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
docker compose up
```

- Hot reload enabled
- Source code mounted as a volume
- Development dependencies included

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests and build
- `pnpm lint` - Check for code style issues
- `pnpm v:patch` - Version bump patch (0.0.x)
- `pnpm v:minor` - Version bump minor (0.x.0)
- `pnpm v:major` - Version bump major (x.0.0)

## 🤖 Discord Bot Sharding

This template includes support for Discord.js sharding, which helps distribute your bot's load across multiple processes when it grows to serve more guilds.

### What is Sharding?

Discord requires sharding for bots in 2,500+ guilds. Sharding splits your bot into multiple processes, each handling a portion of the guilds, which:

- Reduces memory usage and CPU load per process
- Improves performance by distributing workload
- Is required by Discord for larger bots

### Using Sharding

Sharding can be enabled/disabled through:

**Environment Variables**:

- `ENABLE_SHARDING`: Set to "true" to enable sharding
- `TOTAL_SHARDS`: Number of shards to spawn, or "auto" to let Discord.js decide

You can enable sharding by setting these environment variables before starting your bot:

```bash
# Enable sharding with environment variables
ENABLE_SHARDING=true node .

# Or with a specific number of shards
ENABLE_SHARDING=true TOTAL_SHARDS=2 node .
```

This approach gives you more flexibility since it doesn't rely on predefined scripts. Instead, you can control sharding directly through environment variables when starting the bot. This keeps things simpler and gives you more control over the configuration.

## 🚢 CI/CD

The template includes GitHub workflows for:

- **PR Staging**: Runs on pull requests to the main branch. Performs lint checks and runs tests to ensure code quality before merging.
- **Staging**: Runs on pushes to the main branch. Performs lint checks and tests similar to PR Staging.
- **Release**: Triggered when a version tag (v*.*.\*) is pushed. Builds the project, creates a bot archive (bot.tar.gz), generates checksums, and publishes a GitHub release. Also maintains a 'latest' tag for easy reference.

Each workflow can be customized with commit messages:

- Use `[skip lint]` to skip linting checks
- Use `[skip test]` to skip tests

Note: Workflows automatically skip certain paths like documentation, configuration files, and development tools.

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
