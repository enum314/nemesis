# Nemesis

A modern Discord bot template that can also be used as a foundation for any Node.js application. This template is designed to jumpstart your development with best practices and ready-to-use infrastructure.

## 🚀 About This Template

This is a template repository that provides a solid foundation for building modern Discord bots and Node.js applications. It's designed to be forked or used as a starting point for new projects, saving you hours of initial setup and configuration.

The template offers:

- **Ready-to-use infrastructure** with Docker, CI/CD workflows, and deployment scripts
- **Modern tech stack** with Node.js 22 and PNPM 10
- **Development best practices** baked in from the start
- **Production-ready configuration** for immediate deployment with Docker
- **Pterodactyl integration** for easy hosting on game server panels

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v22 or later
- [PNPM](https://pnpm.io/) v10 or later
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## 🛠️ Getting Started

### Using This Template

1. **Create a new repository from this template**:

   - Click the green "Use this template" button at the top of the GitHub repository page
   - Select "Create a new repository"
   - Name your new project and configure repository settings
   - Click "Create repository from template"

2. **Clone your new repository**:

```bash
# Clone your newly created repository (replace with your username/repo)
git clone https://github.com/your-username/your-new-repo.git
cd your-new-repo

# Customize for your project
# - Update package.json with your project details
# - Modify .env.example for your environment variables
# - Customize the Dockerfile if needed
# - Update this README!

# Install dependencies
pnpm install

# Start development server
docker compose up
```

### Local Development

```bash
# Start development environment with Docker
docker compose up
```

This development environment includes:

- Hot reload enabled
- Source code mounted as a volume
- Running on port 3001 (In case you want to expose an express.js server)
- Development dependencies included

## 🚢 Deployment Options

### Pterodactyl Panel Deployment

The template includes Pterodactyl egg files for deployment on Pterodactyl game server panels. This is the **recommended deployment method** for this template:

- `egg-nemesis.json` - JSON format egg for Pterodactyl

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

The template includes an automatic update script (`scripts/update.sh`) that runs before the main application starts on Pterodactyl. This script:

- Retrieves the latest release from your GitHub repository
- Cleans up the dist/ directory to ensure a fresh deployment
- Verifies file integrity with checksums
- Installs production dependencies with `pnpm install --production`

The update script uses environment variables set in the Pterodactyl egg:

- `GITHUB_USERNAME` - GitHub username for the repository
- `GITHUB_REPOSITORY` - Name of the repository
- `GITHUB_TAG` - Release tag to fetch (default: latest)
- `GITHUB_TOKEN` - Optional token for private repositories

This ensures your application is always running the latest release with all dependencies properly installed.

## 🏗️ Template Structure

```
nemesis/
├── .github/workflows/     # GitHub Actions CI/CD configurations
├── scripts/               # Utility scripts
│   └── install.sh         # Install script for Pterodactyl (Used in egg-nemesis.json)
│   └── update.sh          # Auto-update script for Pterodactyl
├── src/                   # Application source code
├── .dockerignore          # Files to exclude from Docker build
├── .env.example           # Example environment variables
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── egg-nemesis.json       # Pterodactyl egg (JSON format)
├── package.json           # Project metadata and scripts
├── pnpm-lock.yaml         # Lock file for dependencies
└── tsconfig.json          # TypeScript configuration
```

## 🐳 Docker

This project uses Docker as the primary development and deployment method, with a multi-stage Dockerfile and Docker Compose configuration:

```bash
# Start development environment
docker compose up

# Start production environment
docker compose up app-prod
```

The development environment provides:

- Hot reload enabled
- Source code mounted as a volume
- Development dependencies included

## 📝 Available Scripts

- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests and build
- `pnpm lint` - Check for code style issues
- `pnpm v:patch` - Version bump patch (0.0.x)
- `pnpm v:minor` - Version bump minor (0.x.0)
- `pnpm v:major` - Version bump major (x.0.0)

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

## 🤖 Discord Bot Features

If you're looking to use this template for a Discord bot, please see [DISCORD.md](DISCORD.md) for specific Discord.js integration features and configuration.
