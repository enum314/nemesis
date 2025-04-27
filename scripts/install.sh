#!/bin/bash
# Nemesis Node.js Template Install Script
#
# Server Files: /mnt/server
apt update
# Install Node.js (from NodeSource, latest LTS version)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y curl wget tar jq file unzip make gcc g++ python3 python3-dev python3-pip libtool nodejs

# Install pnpm
npm install -g pnpm
pnpm config set store-dir /mnt/server/.pnpm-store

# Set repository variables from egg
GITHUB_USER="${GITHUB_USERNAME:-enum314}"
REPOSITORY="${GITHUB_REPOSITORY:-nemesis}"
TAG="${GITHUB_TAG:-latest}"
TOKEN="${GITHUB_TOKEN}"

DEPLOY_DIR="/mnt/server"

# Ensure deployment directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
    mkdir -p "$DEPLOY_DIR"
fi

# Download release tarball and checksum file
cd /tmp

echo "Downloading from: ${GITHUB_USER}/${REPOSITORY} (tag: ${TAG})"

# Decide API URL
RELEASE_API_URL="https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/releases"
if [ "$TAG" = "latest" ]; then
    RELEASE_API_URL="${RELEASE_API_URL}/latest"
else
    RELEASE_API_URL="${RELEASE_API_URL}/tags/${TAG}"
fi

# Download logic for PRIVATE repos (token provided)
if [ -n "$TOKEN" ]; then
    echo "Token detected. Using GitHub API for private release assets..."

    RELEASE_DATA=$(curl -s -H "Authorization: Bearer ${TOKEN}" "$RELEASE_API_URL")

    BOT_ASSET_ID=$(echo "$RELEASE_DATA" | jq '.assets[] | select(.name == "bot.tar.gz") | .id')
    CHECKSUM_ASSET_ID=$(echo "$RELEASE_DATA" | jq '.assets[] | select(.name == "checksum.txt") | .id')

    if [ -z "$BOT_ASSET_ID" ] || [ -z "$CHECKSUM_ASSET_ID" ]; then
        echo "Error: Could not find required release assets."
        exit 1
    fi

    echo "Downloading checksum.txt..."
    curl -sL -H "Authorization: Bearer ${TOKEN}" \
        -H "Accept: application/octet-stream" \
        "https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/releases/assets/${CHECKSUM_ASSET_ID}" \
        -o checksum.txt

    echo "Downloading bot.tar.gz..."
    curl -sL -H "Authorization: Bearer ${TOKEN}" \
        -H "Accept: application/octet-stream" \
        "https://api.github.com/repos/${GITHUB_USER}/${REPOSITORY}/releases/assets/${BOT_ASSET_ID}" \
        -o bot.tar.gz

else
    # Public repo fallback
    echo "No token provided. Assuming public release access."

    if [ "$TAG" = "latest" ]; then
        BASE_URL="https://github.com/${GITHUB_USER}/${REPOSITORY}/releases/latest/download"
    else
        BASE_URL="https://github.com/${GITHUB_USER}/${REPOSITORY}/releases/download/${TAG}"
    fi

    echo "Downloading checksum.txt from public release..."
    wget -q --show-progress "${BASE_URL}/checksum.txt" -O checksum.txt

    echo "Downloading bot.tar.gz from public release..."
    wget -q --show-progress "${BASE_URL}/bot.tar.gz" -O bot.tar.gz
fi

# Validate downloads
if [ ! -f bot.tar.gz ] || [ ! -f checksum.txt ]; then
    echo "Download failed. One or more files are missing."
    exit 1
fi

# Verify checksum
echo "Verifying file integrity..."
COMPUTED_CHECKSUM=$(sha256sum bot.tar.gz | awk '{print $1}')
EXPECTED_CHECKSUM=$(cat checksum.txt | awk '{print $1}')

if [ "$COMPUTED_CHECKSUM" != "$EXPECTED_CHECKSUM" ]; then
    echo "Checksum verification failed!"
    echo "Expected: $EXPECTED_CHECKSUM"
    echo "Got: $COMPUTED_CHECKSUM"
    echo "The downloaded file may be corrupted or tampered with. Aborting installation."
    rm bot.tar.gz checksum.txt
    exit 1
fi

echo "Checksum verification successful!"

# Extract to server directory
echo "Extracting files..."
tar -xzf bot.tar.gz -C "$DEPLOY_DIR"
rm bot.tar.gz checksum.txt

# Move into deployment directory
cd "$DEPLOY_DIR"

# Install dependencies
echo "Installing dependencies..."
pnpm install --production

# Migrate database
echo "Migrating database..."
pnpx prisma migrate deploy

echo "Release has been installed from ${GITHUB_USER}/${REPOSITORY} (tag: ${TAG})."

exit 0
