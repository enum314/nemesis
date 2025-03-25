#!/bin/bash
set -e

# Print colored text
print_style() {
    if [ "$2" == "info" ]; then
        COLOR="96m"
    elif [ "$2" == "success" ]; then
        COLOR="92m"
    elif [ "$2" == "warning" ]; then
        COLOR="93m"
    elif [ "$2" == "danger" ]; then
        COLOR="91m"
    else
        COLOR="0m"
    fi

    STARTCOLOR="\e[$COLOR"
    ENDCOLOR="\e[0m"
    printf "$STARTCOLOR%b$ENDCOLOR" "$1"
}

# Default values
GITHUB_USER="enum314"
REPOSITORY="nemesis"
BRANCH="main"
GITHUB_TOKEN=""
APP_PATH="/opt/nemesis"
FIRST_RUN=false
FORCE_REBUILD=false
SHOW_LOGS=false
UPDATE_MODE=false

# Welcome message
print_style "\n=============================================\n" "info"
print_style "           Nemesis Deployment Script          \n" "info"
print_style "=============================================\n\n" "info"

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
    --repo)
        REPO_URL="$2"
        shift
        ;;
    --branch)
        BRANCH="$2"
        shift
        ;;
    --path)
        APP_PATH="$2"
        shift
        ;;
    --github-user)
        GITHUB_USER="$2"
        shift
        ;;
    --repository)
        REPOSITORY="$2"
        shift
        ;;
    --token)
        GITHUB_TOKEN="$2"
        shift
        ;;
    --first-run) FIRST_RUN=true ;;
    --force-rebuild) FORCE_REBUILD=true ;;
    --show-logs) SHOW_LOGS=true ;;
    --update) UPDATE_MODE=true ;;
    --help)
        echo "Usage: deploy.sh [OPTIONS]"
        echo "Options:"
        echo "  --github-user USER GitHub username (default: $GITHUB_USER)"
        echo "  --repository REPO  Repository name (default: $REPOSITORY)"
        echo "  --token TOKEN     GitHub personal access token for private repos"
        echo "  --repo URL        Git repository URL (legacy, use github-user and repository instead)"
        echo "  --branch NAME     Branch to deploy (default: $BRANCH)"
        echo "  --path PATH       Installation path (default: $APP_PATH)"
        echo "  --first-run       Perform first-time setup"
        echo "  --force-rebuild   Force rebuild of Docker containers"
        echo "  --show-logs       Show Docker logs after deployment"
        echo "  --update          Update existing deployment"
        echo "  --help            Show this help message"
        exit 0
        ;;
    *)
        print_style "Unknown parameter: $1\n" "danger"
        exit 1
        ;;
    esac
    shift
done

# Construct the repository URL
if [ -z "$REPO_URL" ]; then
    if [ -z "$GITHUB_TOKEN" ]; then
        # Public repository
        REPO_URL="https://github.com/${GITHUB_USER}/${REPOSITORY}.git"
    else
        # Private repository with token
        REPO_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPOSITORY}.git"
    fi
fi

print_style "Repository URL: $REPO_URL (branch: $BRANCH)\n" "info"

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
    print_style "Error: Docker is not installed. Please install Docker first.\n" "danger"
    print_style "Visit https://docs.docker.com/get-docker/ for installation instructions.\n" "info"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &>/dev/null; then
    print_style "Error: Docker Compose is not installed. Please install Docker Compose first.\n" "danger"
    print_style "Visit https://docs.docker.com/compose/install/ for installation instructions.\n" "info"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_style "Error: Docker is not running. Please start Docker first.\n" "danger"
    exit 1
fi

# Check if Git is installed
if ! command -v git &>/dev/null; then
    print_style "Error: Git is not installed. Please install Git first.\n" "danger"
    exit 1
fi

# Clone or update repository
if [ "$FIRST_RUN" = true ] || [ ! -d "$APP_PATH" ]; then
    if [ -d "$APP_PATH" ]; then
        print_style "Warning: Directory $APP_PATH already exists but --first-run was specified.\n" "warning"
        read -p "Do you want to remove the existing directory and start fresh? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_style "Removing existing directory...\n" "warning"
            rm -rf "$APP_PATH"
        else
            print_style "Aborting first-run setup.\n" "danger"
            exit 1
        fi
    fi

    print_style "Cloning repository $REPO_URL (branch: $BRANCH)...\n" "info"
    git clone -b "$BRANCH" "$REPO_URL" "$APP_PATH"
    cd "$APP_PATH"
    FORCE_REBUILD=true
else
    # This is an update
    if [ ! -d "$APP_PATH/.git" ]; then
        print_style "Error: $APP_PATH is not a Git repository.\n" "danger"
        exit 1
    fi

    cd "$APP_PATH"
    print_style "Fetching latest changes from repository...\n" "info"

    # Save current HEAD commit hash
    OLD_COMMIT=$(git rev-parse HEAD)

    # Update the origin URL if it has changed
    git remote set-url origin "$REPO_URL"

    # Try to pull changes
    git fetch origin "$BRANCH"
    git checkout "$BRANCH"
    git reset --hard "origin/$BRANCH"

    # Get new HEAD commit hash
    NEW_COMMIT=$(git rev-parse HEAD)

    if [ "$OLD_COMMIT" == "$NEW_COMMIT" ]; then
        print_style "Already up to date. No changes detected.\n" "success"
        if [ "$FORCE_REBUILD" != true ]; then
            print_style "If you want to rebuild anyway, use --force-rebuild flag.\n" "info"
            if [ "$UPDATE_MODE" = true ]; then
                exit 0
            fi
        fi
    else
        print_style "Repository updated from $OLD_COMMIT to $NEW_COMMIT\n" "success"

        # Check for changes in package.json (dependencies)
        if git diff --name-only "$OLD_COMMIT" "$NEW_COMMIT" | grep -q "package.json\|pnpm-lock.yaml"; then
            print_style "Dependencies changed.\n" "info"
            FORCE_REBUILD=true
        fi

        # Check for changes in Dockerfile or docker-compose.yml
        if git diff --name-only "$OLD_COMMIT" "$NEW_COMMIT" | grep -q "Dockerfile\|docker-compose.yml"; then
            print_style "Docker configuration changed.\n" "info"
            FORCE_REBUILD=true
        fi
    fi
fi

# Setup environment
print_style "Setting up environment...\n" "info"
if [ ! -f "$APP_PATH/.env" ]; then
    if [ -f "$APP_PATH/.env.example" ]; then
        cp "$APP_PATH/.env.example" "$APP_PATH/.env"
        print_style "Created .env file from .env.example\n" "success"
        print_style "Please edit the .env file with your configuration before running the application.\n" "warning"
        read -p "Press Enter to continue or Ctrl+C to cancel and edit the file..."
    else
        print_style "Warning: No .env.example file found. You'll need to create a .env file manually.\n" "warning"
    fi
else
    print_style ".env file already exists. Using existing configuration.\n" "info"
fi

# Build and start docker containers
if [ "$FORCE_REBUILD" = true ]; then
    print_style "\nRebuilding and restarting containers...\n" "info"

    # Stop existing containers if any
    if docker-compose -f "$APP_PATH/docker-compose.yml" ps 2>/dev/null | grep -q "Up"; then
        print_style "Stopping existing containers...\n" "info"
        docker-compose -f "$APP_PATH/docker-compose.yml" down
    fi

    # Build and start containers
    print_style "Building and starting containers...\n" "info"
    docker-compose -f "$APP_PATH/docker-compose.yml" up -d --build app-prod
else
    print_style "\nRestarting containers with updated code...\n" "info"

    # Check if containers are running
    if docker-compose -f "$APP_PATH/docker-compose.yml" ps 2>/dev/null | grep -q "Up"; then
        print_style "Restarting existing containers...\n" "info"
        docker-compose -f "$APP_PATH/docker-compose.yml" restart app-prod
    else
        print_style "Starting containers...\n" "info"
        docker-compose -f "$APP_PATH/docker-compose.yml" up -d app-prod
    fi
fi

# Check if the containers are running
if docker-compose -f "$APP_PATH/docker-compose.yml" ps | grep -q "app-prod.*Up"; then
    print_style "\nDeployment completed successfully! Containers are running.\n" "success"

    # Show logs if requested
    if [ "$SHOW_LOGS" = true ]; then
        print_style "\nShowing logs (press Ctrl+C to exit):\n" "info"
        print_style "=============================================\n\n" "info"
        docker-compose -f "$APP_PATH/docker-compose.yml" logs --follow app-prod
    fi
else
    print_style "Error: Containers failed to start after deployment.\n" "danger"
    print_style "Check the logs with: docker-compose -f \"$APP_PATH/docker-compose.yml\" logs app-prod\n" "info"
    exit 1
fi

# Final message
print_style "\n=============================================\n" "success"
print_style "The application is now running at: http://localhost:3001\n" "success"
print_style "=============================================\n" "success"
print_style "\nTo update the application in the future, run:\n" "info"
print_style "$0 --update --path $APP_PATH --github-user $GITHUB_USER --repository $REPOSITORY\n\n" "info"

# Create a convenience script for updates if it doesn't exist
UPDATE_SCRIPT="$APP_PATH/update-app.sh"
if [ ! -f "$UPDATE_SCRIPT" ]; then
    print_style "Creating update convenience script at $UPDATE_SCRIPT\n" "info"

    cat >"$UPDATE_SCRIPT" <<EOL
#!/bin/bash
$(realpath $0) --update --path $APP_PATH --github-user $GITHUB_USER --repository $REPOSITORY \$@
EOL

    chmod +x "$UPDATE_SCRIPT"
    print_style "You can now use this command to update: $UPDATE_SCRIPT\n" "success"
fi
