# Git Hooks Setup

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality through automated git hooks.

## Configured Hooks

### Pre-commit Hook
- **Trigger**: Before each commit
- **Actions**: Runs `npm run lint`
- **Purpose**: Ensures code meets linting standards before committing

### Pre-push Hook
- **Trigger**: Before each push to remote
- **Actions**: 
  1. Runs `npm run lint` - Checks code style and quality
  2. Runs `npm run build` - Ensures the project builds successfully
- **Purpose**: Prevents broken code from being pushed to the repository

## Installation

Husky hooks are automatically installed when you run:
```bash
npm install
```

This is handled by the `prepare` script in `package.json`.

## How It Works

1. **Pre-commit**: When you run `git commit`, the hook automatically runs linting
2. **Pre-push**: When you run `git push`, the hook runs both linting and build checks
3. If any check fails, the commit/push is aborted with an error message
4. You must fix the issues before proceeding

## Bypassing Hooks (Not Recommended)

In emergency situations, you can bypass hooks with:
```bash
# Bypass pre-commit hook
git commit --no-verify -m "emergency fix"

# Bypass pre-push hook  
git push --no-verify
```

**⚠️ Warning**: Only use `--no-verify` in genuine emergencies as it defeats the purpose of quality gates.

## Troubleshooting

### Hook Not Running
If hooks aren't running, check:
1. Run `git config core.hooksPath` - should return `.husky/_`
2. Ensure hooks are executable: `chmod +x .husky/pre-commit .husky/pre-push`
3. Reinstall: `npm run prepare`

### Build/Lint Failures
1. Run the failed command manually: `npm run lint` or `npm run build`
2. Fix the reported issues
3. Try your git operation again

## Available Scripts

- `npm run lint` - Check code style
- `npm run lint:fix` - Fix auto-fixable lint issues
- `npm run build` - Build the project for production
