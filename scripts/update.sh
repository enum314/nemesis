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

# Welcome message
print_style "\n=============================================\n" "info"
print_style "           Nemesis Update Script              \n" "info"
print_style "=============================================\n\n" "info"

# Set repository variables from egg configuration
GITHUB_USER="${GITHUB_USERNAME:-enum314}"
REPOSITORY="${GITHUB_REPOSITORY:-nemesis}"
TAG="${GITHUB_TAG:-latest}"
TOKEN="${GITHUB_TOKEN}"

print_style "Using configuration from egg-nemesis.json:\n" "info"
print_style "GitHub User: $GITHUB_USER\n" "info"
print_style "Repository: $REPOSITORY\n" "info"
print_style "Tag: $TAG\n" "info"
if [ -n "$TOKEN" ]; then
    print_style "Token: [Provided]\n" "info"
else
    print_style "Token: [Not Provided]\n" "info"
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

# Clean up dist directory
print_style "Cleaning up dist directory...\n" "info"
rm -rf dist/

# Decide API URL
RELEASE_API_URL="https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/releases"
if [ "$TAG" = "latest" ]; then
    RELEASE_API_URL="${RELEASE_API_URL}/latest"
else
    RELEASE_API_URL="${RELEASE_API_URL}/tags/${TAG}"
fi

# Download logic for PRIVATE repos (token provided)
if [ -n "$TOKEN" ]; then
    print_style "Token detected. Using GitHub API for private release assets...\n" "info"

    RELEASE_DATA=$(curl -s -H "Authorization: Bearer ${TOKEN}" "$RELEASE_API_URL")

    BOT_ASSET_ID=$(echo "$RELEASE_DATA" | jq '.assets[] | select(.name == "bot.tar.gz") | .id')
    CHECKSUM_ASSET_ID=$(echo "$RELEASE_DATA" | jq '.assets[] | select(.name == "checksum.txt") | .id')

    if [ -z "$BOT_ASSET_ID" ] || [ -z "$CHECKSUM_ASSET_ID" ]; then
        print_style "Error: Could not find required release assets.\n" "danger"
        exit 1
    fi

    print_style "Downloading checksum.txt...\n" "info"
    curl -sL -H "Authorization: Bearer ${TOKEN}" \
        -H "Accept: application/octet-stream" \
        "https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/releases/assets/${CHECKSUM_ASSET_ID}" \
        -o "$TEMP_DIR/checksum.txt"

    print_style "Downloading bot.tar.gz...\n" "info"
    curl -sL -H "Authorization: Bearer ${TOKEN}" \
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
    print_style "The downloaded file may be corrupted or tampered with. Aborting update.\n" "danger"
    exit 1
fi

print_style "Checksum verification successful!\n" "success"

# Extract release
print_style "Extracting files...\n" "info"
tar -xzf "$TEMP_DIR/bot.tar.gz" -C .

# Install production dependencies
print_style "Installing production dependencies...\n" "info"
pnpm install --production

print_style "\nUpdate completed successfully!\n" "success"
print_style "=============================================\n" "success"
