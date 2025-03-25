# Nemesis

A modern Node.js application template with Docker configuration and GitHub workflows.

## 🚀 Features

- **Node.js**: Using Node.js 22 for latest JavaScript/TypeScript features
- **PNPM**: Fast and efficient package management with PNPM 10
- **Docker**: Multi-stage Docker setup for development and production
- **CI/CD**: GitHub Actions workflows for testing, linting, and deployment
- **Production-Ready**: Optimized for performance and maintainability

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v22 or later
- [PNPM](https://pnpm.io/) v10 or later
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (optional, for containerized development)
- [Git](https://git-scm.com/)

## 🛠️ Installation

### Local Development

```bash
# Clone the repository
git clone https://github.com/enum314/nemesis.git
cd nemesis

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Using Docker

```bash
# Start development environment
docker-compose up app-dev

# OR start production environment
docker-compose up app-prod
```

## 🏗️ Project Structure

```
nemesis/
├── .github/workflows/     # GitHub Actions CI/CD configurations
├── src/                   # Application source code
├── .dockerignore          # Files to exclude from Docker build
├── .env.example           # Example environment variables
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
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
- `pnpm test` - Run tests
- `pnpm lint` - Check for code style issues

## 🚢 Deployment

The project includes GitHub workflows for:

- **PR Staging**: Runs tests and lint checks on pull requests
- **Staging**: Deploys to staging environment when merging to main
- **Release**: Creates a release when pushing to production or tags

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

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
