#!/bin/bash

# Script to help with the release process

# =====================
# 1. Validate Arguments
#
# Check if a version argument was provided
#
# Examples:
#   ./scripts/release.sh patch    → Increment patch version (0.1.3 → 0.1.4)
#   ./scripts/release.sh minor    → Increment minor version (0.1.3 → 0.2.0)  
#   ./scripts/release.sh major    → Increment major version (0.1.3 → 1.0.0)
#   ./scripts/release.sh 0.2.5    → Set specific version to 0.2.5
#   ./scripts/release.sh 1.0.0-beta.1 → Set pre-release version
# =====================
if [ -z "$1" ]; then
  echo "Error: No version specified"
  echo "Usage: ./scripts/release.sh <version|patch|minor|major>"
  echo "Examples:"
  echo "  ./scripts/release.sh 0.1.4    # Set specific version"
  echo "  ./scripts/release.sh patch    # Increment patch version (0.1.3 -> 0.1.4)"
  echo "  ./scripts/release.sh minor    # Increment minor version (0.1.3 -> 0.2.0)"
  echo "  ./scripts/release.sh major    # Increment major version (0.1.3 -> 1.0.0)"
  exit 1
fi

VERSION_ARG=$1

# =====================
# 2. Parse Version Type
#
# Determine if argument is semantic increment or specific version
#
# Examples:
#   Input: "patch" → INCREMENT_TYPE="patch", outputs "Using semantic increment: patch (current version: 0.1.3)"
#   Input: "0.2.0" → SPECIFIC_VERSION="0.2.0", outputs "Using specific version: 0.2.0"
#   Input: "1.0.0-alpha.1" → SPECIFIC_VERSION="1.0.0-alpha.1"
#   Input: "invalid" → Error: "Version must follow semantic versioning"
# =====================
if [[ "$VERSION_ARG" =~ ^(patch|minor|major)$ ]]; then
  # It's a semantic increment
  INCREMENT_TYPE=$VERSION_ARG
  CURRENT_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
  echo "Using semantic increment: $INCREMENT_TYPE (current version: $CURRENT_VERSION)"
else
  # It's a specific version - validate semver format
  if ! [[ $VERSION_ARG =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+)?(\+[0-9A-Za-z-]+)?$ ]]; then
    echo "Error: Version must follow semantic versioning (e.g., 1.2.3, 1.2.3-beta, etc.)"
    echo "Or use one of: patch, minor, major"
    exit 1
  fi
  SPECIFIC_VERSION=$VERSION_ARG
  echo "Using specific version: $SPECIFIC_VERSION"
fi

# =====================
# 3. Git Branch Check
#
# Ensure we're releasing from main branch
#
# Examples:
#   On main branch → Continue silently
#   On feature/auth → Warning: "You are not on the main branch. Current branch: feature/auth"
#   On develop → Warning: "You are not on the main branch. Current branch: develop"
#   User types 'n' → Script exits with code 1
#   User types 'y' → Script continues with warning acknowledged
# =====================
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Warning: You are not on the main branch. Current branch: $CURRENT_BRANCH"
  read -p "Do you want to continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# =====================
# 4. Git Status Check
#
# Ensure working directory is clean before release
#
# Examples:
#   Clean directory → Continue silently
#   Modified files → Error: "Working directory is not clean. Please commit or stash your changes."
#   Untracked files → Error: "Working directory is not clean..."
#   Staged changes → Error: "Working directory is not clean..."
# =====================
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean. Please commit or stash your changes."
  exit 1
fi

# =====================
# 5. Sync with Remote
#
# Pull latest changes from remote repository
#
# Examples:
#   Up to date → "Already up to date."
#   New commits → "Updating 1a2b3c4..5d6e7f8"
#   Merge conflicts → Script will fail and exit
#   No remote → Error: "fatal: 'origin' does not appear to be a git repository"
# =====================
echo "Pulling latest changes from origin..."
git pull origin main

# =====================
# 6. Version Consistency Check
#
# Check versions across package.json, package-lock.json, and index.ts
#
# Examples:
#   All synced → package.json: 0.1.3, package-lock.json: 0.1.3, index.ts: 0.1.3
#   Mismatch → package.json: 0.1.4, package-lock.json: 0.1.3, index.ts: 0.1.3
#   Missing version in index.ts → index.ts: (empty)
#   Different formats → package.json: 1.0.0, index.ts: 1.0.0, package-lock.json: 1.0.0
# =====================
PACKAGE_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
PACKAGE_LOCK_VERSION=$(grep -o '"version": "[^"]*"' package-lock.json | head -1 | cut -d'"' -f4)
INDEX_VERSION=$(grep -o 'version: "[^"]*"' index.ts | cut -d'"' -f2)

echo "Current versions:"
echo "- package.json: $PACKAGE_VERSION"
echo "- package-lock.json: $PACKAGE_LOCK_VERSION"
echo "- index.ts: $INDEX_VERSION"

# =====================
# 7. Version Update Function
#
# Function to update version in index.ts file
#
# Examples:
#   update_index_version "0.1.3" "0.1.4" → Changes 'version: "0.1.3"' to 'version: "0.1.4"'
#   update_index_version "1.0.0" "1.1.0" → Changes 'version: "1.0.0"' to 'version: "1.1.0"'
#   update_index_version "0.1.0" "1.0.0-beta.1" → Changes to pre-release version
#   With commit message → Also creates git commit with provided message
# =====================
update_index_version() {
  local old_version=$1
  local new_version=$2
  local commit_msg=$3
  
  echo "Updating version in index.ts from $old_version to $new_version..."
  sed -i '' "s/version: \"$old_version\"/version: \"$new_version\"/" index.ts
  git add index.ts
  
  if [ -n "$commit_msg" ]; then
    git commit -m "$commit_msg"
  fi
}

# =====================
# 8. Version Mismatch Warning
#
# Warn if versions differ between files and confirm continuation
#
# Examples:
#   No mismatch → Skip this section entirely
#   package.json: 0.1.4, index.ts: 0.1.3 → "Warning: Version mismatch detected between files."
#   With specific version → "Will update all files to version: 0.2.0"
#   With increment → "Will update all files using increment: patch"
#   User types 'n' → Script exits
#   User types 'y' → Script continues with synchronization
# =====================
if [ "$PACKAGE_VERSION" != "$PACKAGE_LOCK_VERSION" ] || [ "$PACKAGE_VERSION" != "$INDEX_VERSION" ]; then
  echo "Warning: Version mismatch detected between files."
  
  if [ -n "$SPECIFIC_VERSION" ]; then
    echo "Will update all files to version: $SPECIFIC_VERSION"
  else
    echo "Will update all files using increment: $INCREMENT_TYPE"
  fi
  
  read -p "Do you want to continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# =====================
# 9. Version Update Process
#
# Update versions in all files and commit changes
#
# Examples:
#   patch increment → 0.1.3 → 0.1.4 (package.json, package-lock.json, index.ts)
#   minor increment → 0.1.3 → 0.2.0 (package.json, package-lock.json, index.ts)
#   major increment → 0.1.3 → 1.0.0 (package.json, package-lock.json, index.ts)
#   specific version → any version → 0.5.0 (package.json, package-lock.json, index.ts)
#   Creates commit → "chore: release version 0.1.4"
#   Creates tag → "v0.1.4" with message "Version 0.1.4"
# =====================
if [ -n "$INCREMENT_TYPE" ]; then
  # For semantic increments (patch/minor/major)
  echo "Incrementing version ($INCREMENT_TYPE)..."
  
  npm version $INCREMENT_TYPE --no-git-tag-version
  NEW_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
  
  update_index_version "$INDEX_VERSION" "$NEW_VERSION"
  
  git add package.json package-lock.json
  git commit -m "chore: release version $NEW_VERSION"
  git tag -a "v$NEW_VERSION" -m "Version $NEW_VERSION"
else
  # For specific version (e.g., 0.1.4)
  echo "Updating version in package.json and package-lock.json..."
  
  npm version $SPECIFIC_VERSION --no-git-tag-version
  update_index_version "$INDEX_VERSION" "$SPECIFIC_VERSION"
  
  git add package.json package-lock.json
  git commit -m "chore: release version $SPECIFIC_VERSION"
  git tag -a "v$SPECIFIC_VERSION" -m "Version $SPECIFIC_VERSION"
fi

# =====================
# 10. Push to Remote
#
# Push commit and tag to GitHub repository
#
# Examples:
#   Successful push → "Enumerating objects: 5, done."
#   New tag creation → "To github.com:TakanariShimbo/datetime-mcp-server.git * [new tag] v0.1.4 -> v0.1.4"
#   Authentication required → Prompts for GitHub username/token
#   Network error → "fatal: unable to access 'https://github.com/...': Could not resolve host"
#   Push triggers GitHub Actions → Workflow starts automatically for tag v0.1.4
# =====================
FINAL_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)

echo "Pushing changes and tag to remote..."
git push origin main
git push origin v$FINAL_VERSION

# =====================
# 11. Success Message
#
# Display completion message and next steps
#
# Examples:
#   "Release process completed for version 0.1.4"
#   "The GitHub workflow will now build and publish the package to npm"
#   "Check the Actions tab in your GitHub repository for progress"
#   User should visit: https://github.com/TakanariShimbo/datetime-mcp-server/actions
#   NPM package will be available at: https://www.npmjs.com/package/@takanarishimbo/datetime-mcp-server
# =====================
echo "Release process completed for version $FINAL_VERSION"
echo "The GitHub workflow will now build and publish the package to npm"
echo "Check the Actions tab in your GitHub repository for progress"