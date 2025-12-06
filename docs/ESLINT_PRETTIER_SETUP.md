# ESLint & Prettier Setup Guide

## Configuration Files Created

✅ `.eslintrc.json` - ESLint configuration  
✅ `.prettierrc` - Prettier configuration  
✅ `.prettierignore` - Prettier ignore patterns

## Installation Steps

### 1. Install Required Dependencies

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier
```

### 2. Add NPM Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,css,md}\""
  }
}
```

### 3. Verify Setup

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format all files
npm run format

# Check formatting without changing files
npm run format:check
```

## Configuration Details

### ESLint Rules

- **React**: Disabled `react-in-jsx-scope` (React 17+)
- **TypeScript**: Strict type checking, unused vars warning
- **React Hooks**: Enforces rules of hooks
- **Accessibility**: JSX a11y rules enabled

### Prettier Settings

- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Semicolons**: Enabled
- **Single Quotes**: Disabled (double quotes)

## IDE Integration

### VS Code

1. Install extensions:
   - ESLint
   - Prettier - Code formatter

2. Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Optional: Pre-commit Hooks

To run linting/formatting before commits:

```bash
npm install --save-dev husky lint-staged
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

Initialize husky:
```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

