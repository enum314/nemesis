# Nemesis

A modern Discord bot template that can also be used as a foundation for any Node.js application. This template is designed to jumpstart your development with best practices and ready-to-use infrastructure.

## 🚀 About This Template

This is a template repository that provides a solid foundation for building modern Discord bots and Node.js applications. It's designed to be forked or used as a starting point for new projects, saving you hours of initial setup and configuration.

The template offers:

- **Ready-to-use infrastructure** with CI/CD workflows and deployment scripts
- **Modern tech stack** with Node.js 22 and PNPM 10
- **Development best practices** baked in from the start
- **Production-ready configuration** for immediate deployment
- **Pterodactyl integration** for easy hosting on game server panels
- **Clean imports** using Node.js subpath imports to avoid relative path hell

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v22 or later
- [PNPM](https://pnpm.io/) v10 or later
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
# - Update this README!

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start development environment
pnpm dev
```

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

   - **Startup Command**: Customize how the application starts (default: `node .`)
   - **GitHub Repository Settings**:
     - **GitHub Username**: Username of the repository owner
     - **GitHub Repository**: Name of the repository to clone
     - **GitHub Tag**: Release tag to deploy (use 'latest' for most recent)
     - **GitHub Personal Access Token**: For private repositories (optional)

4. **After Installation**:
   - The server will automatically install your project from the specified GitHub repository

### Installation Script

The template includes an installation script (`scripts/install.sh`) used by the Pterodactyl egg.

The installation script uses environment variables set in the Pterodactyl egg:

- `GITHUB_USERNAME` - GitHub username for the repository
- `GITHUB_REPOSITORY` - Name of the repository
- `GITHUB_TAG` - Release tag to fetch (default: latest)
- `GITHUB_TOKEN` - Optional token for private repositories

The `install.sh` script is embedded within `egg-nemesis.json` and executes the following process when a server is deployed:

1. **Environment Setup**:

   - Updates package lists and installs Node.js 22.x
   - Installs required dependencies (curl, wget, tar, jq, etc.)
   - Installs PNPM and configures its package store

2. **Configuration**:

   - Sets variables based on Pterodactyl egg inputs (`GITHUB_USERNAME`, `GITHUB_REPOSITORY`, etc.)
   - Handles defaults for missing values (e.g., username defaults to "enum314")

3. **Release Download**:

   - Determines the GitHub release URL based on the specified tag
   - Supports two download paths:
     - **Private repositories**: Uses GitHub API with token authentication
     - **Public repositories**: Uses direct GitHub release download URLs
   - Downloads both the application archive (`bot.tar.gz`) and checksum file

4. **Security Verification**:

   - Calculates SHA-256 checksum of the downloaded archive
   - Compares against the expected checksum file
   - Aborts installation if verification fails, protecting against corrupted or tampered files

5. **Installation**:
   - Extracts the application to the server directory
   - Installs production dependencies using PNPM
   - Runs database migrations via Prisma

This automated process ensures consistent, secure deployments with minimal manual intervention.

## 🏗️ Template Structure

```
nemesis/
├── .github/workflows/     # GitHub Actions CI/CD configurations
├── scripts/               # Utility scripts
│   └── install.sh         # Install script for Pterodactyl (Used in egg-nemesis.json)
├── src/                   # Application source code
├── docs/                  # Documentation
├── .env.example           # Example environment variables
├── egg-nemesis.json       # Pterodactyl egg (JSON format)
├── package.json           # Project metadata and scripts
├── pnpm-lock.yaml         # Lock file for dependencies
└── tsconfig.json          # TypeScript configuration
```

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
3. Update environment variables in .env.example
4. Add your application code to the src directory

## 🤖 Discord Bot Features

If you're looking to use this template for a Discord bot, please see [DISCORD.md](docs/discord-index.md) for specific Discord.js integration features and configuration.
