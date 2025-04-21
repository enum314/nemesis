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
TAG="latest"
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
        # Keep branch parameter for backward compatibility
        print_style "Warning: --branch parameter is deprecated. Use --tag instead.\n" "warning"
        TAG="$2"
        shift
        ;;
    --tag)
        TAG="$2"
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
        echo "  --tag TAG         Release tag to deploy (default: latest)"
        echo "  --token TOKEN     GitHub personal access token for private repos"
        echo "  --repo URL        Git repository URL (legacy, use github-user and repository instead)"
        echo "  --branch NAME     Branch to deploy (deprecated, use --tag instead)"
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

print_style "Repository URL: $REPO_URL (tag: $TAG)\n" "info"

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
    print_style "Error: Docker is not installed. Please install Docker first.\n" "danger"
    print_style "Visit https://docs.docker.com/get-docker/ for installation instructions.\n" "info"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &>/dev/null; then
    print_style "Error: Docker Compose is not installed or not available. Please install Docker Compose first.\n" "danger"
    print_style "Visit https://docs.docker.com/compose/install/ for installation instructions.\n" "info"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_style "Error: Docker is not running. Please start Docker first.\n" "danger"
    exit 1
fi

# Check if jq is installed (needed for API parsing)
if ! command -v jq &>/dev/null; then
    print_style "Error: jq is not installed. Please install jq first.\n" "danger"
    print_style "You can install it with: apt-get install jq (Debian/Ubuntu) or brew install jq (MacOS).\n" "info"
    exit 1
fi

# Create temp directory for downloads
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

print_style "Downloading from: ${GITHUB_USER}/${REPOSITORY} (tag: ${TAG})\n" "info"

# Decide API URL
RELEASE_API_URL="https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/releases"
if [ "$TAG" = "latest" ]; then
    RELEASE_API_URL="${RELEASE_API_URL}/latest"
else
    RELEASE_API_URL="${RELEASE_API_URL}/tags/${TAG}"
fi

# Download logic for PRIVATE repos (token provided)
if [ -n "$GITHUB_TOKEN" ]; then
    print_style "Token detected. Using GitHub API for private release assets...\n" "info"

    RELEASE_DATA=$(curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" "$RELEASE_API_URL")

    BOT_ASSET_ID=$(echo "$RELEASE_DATA" | jq '.assets[] | select(.name == "bot.tar.gz") | .id')
    CHECKSUM_ASSET_ID=$(echo "$RELEASE_DATA" | jq '.assets[] | select(.name == "checksum.txt") | .id')

    if [ -z "$BOT_ASSET_ID" ] || [ -z "$CHECKSUM_ASSET_ID" ]; then
        print_style "Error: Could not find required release assets.\n" "danger"
        exit 1
    fi

    print_style "Downloading checksum.txt...\n" "info"
    curl -sL -H "Authorization: Bearer ${GITHUB_TOKEN}" \
        -H "Accept: application/octet-stream" \
        "https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/releases/assets/${CHECKSUM_ASSET_ID}" \
        -o "$TEMP_DIR/checksum.txt"

    print_style "Downloading bot.tar.gz...\n" "info"
    curl -sL -H "Authorization: Bearer ${GITHUB_TOKEN}" \
        -H "Accept: application/octet-stream" \
        "https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/releases/assets/${BOT_ASSET_ID}" \
        -o "$TEMP_DIR/bot.tar.gz"

else
    # Public repo fallback
    print_style "No token provided. Assuming public release access.\n" "info"

    if [ "$TAG" = "latest" ]; then
        BASE_URL="https://github.com/${GITHUB_USER}/${REPOSITORY}/releases/latest/download"
    else
        BASE_URL="https://github.com/${GITHUB_USER}/${REPOSITORY}/releases/download/${TAG}"
    fi

    print_style "Downloading checksum.txt from public release...\n" "info"
    curl -sL "${BASE_URL}/checksum.txt" -o "$TEMP_DIR/checksum.txt"

    print_style "Downloading bot.tar.gz from public release...\n" "info"
    curl -sL "${BASE_URL}/bot.tar.gz" -o "$TEMP_DIR/bot.tar.gz"
fi

# Validate downloads
if [ ! -f "$TEMP_DIR/bot.tar.gz" ] || [ ! -f "$TEMP_DIR/checksum.txt" ]; then
    print_style "Download failed. One or more files are missing.\n" "danger"
    exit 1
fi

# Verify checksum
print_style "Verifying file integrity...\n" "info"
COMPUTED_CHECKSUM=$(sha256sum "$TEMP_DIR/bot.tar.gz" | awk '{print $1}')
EXPECTED_CHECKSUM=$(cat "$TEMP_DIR/checksum.txt" | awk '{print $1}')

if [ "$COMPUTED_CHECKSUM" != "$EXPECTED_CHECKSUM" ]; then
    print_style "Checksum verification failed!\n" "danger"
    print_style "Expected: $EXPECTED_CHECKSUM\n" "danger"
    print_style "Got: $COMPUTED_CHECKSUM\n" "danger"
    print_style "The downloaded file may be corrupted or tampered with. Aborting installation.\n" "danger"
    exit 1
fi

print_style "Checksum verification successful!\n" "success"

# Handle first run or update mode
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

    # Create app directory
    mkdir -p "$APP_PATH"

    # Extract release to app directory
    print_style "Extracting files...\n" "info"
    tar -xzf "$TEMP_DIR/bot.tar.gz" -C "$APP_PATH"
    FORCE_REBUILD=true
else
    # This is an update
    if [ "$UPDATE_MODE" = true ]; then
        print_style "Updating existing installation...\n" "info"

        # Create a backup of the current application
        BACKUP_DIR="$APP_PATH-backup-$(date +%Y%m%d%H%M%S)"
        print_style "Creating backup at $BACKUP_DIR...\n" "info"
        cp -a "$APP_PATH" "$BACKUP_DIR"

        # Stop existing containers if any
        if docker compose -f "$APP_PATH/docker-compose.yml" ps 2>/dev/null | grep -q "Up"; then
            print_style "Stopping existing containers...\n" "info"
            docker compose -f "$APP_PATH/docker-compose.yml" down
        fi

        # Extract the new release, but preserve .env
        if [ -f "$APP_PATH/.env" ]; then
            print_style "Preserving existing .env file...\n" "info"
            cp "$APP_PATH/.env" "$TEMP_DIR/.env.backup"
        fi

        # Extract release over existing directory
        print_style "Extracting update...\n" "info"
        tar -xzf "$TEMP_DIR/bot.tar.gz" -C "$APP_PATH"

        # Restore .env file
        if [ -f "$TEMP_DIR/.env.backup" ]; then
            print_style "Restoring .env file...\n" "info"
            cp "$TEMP_DIR/.env.backup" "$APP_PATH/.env"
        fi

        FORCE_REBUILD=true
    else
        print_style "Error: Directory $APP_PATH exists but --update or --first-run not specified.\n" "danger"
        print_style "Use --update to update an existing installation or --first-run to start fresh.\n" "info"
        exit 1
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

    # Build and start containers
    print_style "Building and starting containers...\n" "info"
    docker compose -f "$APP_PATH/docker-compose.yml" up -d --build app-prod
else
    print_style "\nRestarting containers with updated code...\n" "info"

    # Check if containers are running
    if docker compose -f "$APP_PATH/docker-compose.yml" ps 2>/dev/null | grep -q "Up"; then
        print_style "Restarting existing containers...\n" "info"
        docker compose -f "$APP_PATH/docker-compose.yml" restart app-prod
    else
        print_style "Starting containers...\n" "info"
        docker compose -f "$APP_PATH/docker-compose.yml" up -d app-prod
    fi
fi

# Check if the containers are running
if docker compose -f "$APP_PATH/docker-compose.yml" ps | grep -q "app-prod.*Up"; then
    print_style "\nDeployment completed successfully! Containers are running.\n" "success"

    # Show logs if requested
    if [ "$SHOW_LOGS" = true ]; then
        print_style "\nShowing logs (press Ctrl+C to exit):\n" "info"
        print_style "=============================================\n\n" "info"
        docker compose -f "$APP_PATH/docker-compose.yml" logs --follow app-prod
    fi
else
    print_style "Error: Containers failed to start after deployment.\n" "danger"
    print_style "Check the logs with: docker compose -f \"$APP_PATH/docker-compose.yml\" logs app-prod\n" "info"
    exit 1
fi

# Final message
print_style "\n=============================================\n" "success"
print_style "The application is now running at: http://localhost:3001\n" "success"
print_style "=============================================\n" "success"
print_style "\nTo update the application in the future, run:\n" "info"
print_style "$0 --update --path $APP_PATH --github-user $GITHUB_USER --repository $REPOSITORY --tag latest\n\n" "info"

# Create a convenience script for updates if it doesn't exist
UPDATE_SCRIPT="$APP_PATH/update-app.sh"
if [ ! -f "$UPDATE_SCRIPT" ]; then
    print_style "Creating update convenience script at $UPDATE_SCRIPT\n" "info"

    cat >"$UPDATE_SCRIPT" <<EOL
#!/bin/bash
$(realpath $0) --update --path $APP_PATH --github-user $GITHUB_USER --repository $REPOSITORY --tag latest \$@
EOL

    chmod +x "$UPDATE_SCRIPT"
    print_style "You can now use this command to update: $UPDATE_SCRIPT\n" "success"
fi
