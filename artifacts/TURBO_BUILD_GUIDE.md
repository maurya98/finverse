# Turbo Build Configuration Guide

## Overview

This monorepo uses **Turbo** for efficient, cache-aware builds with automatic dependency resolution. All projects in `libs/`, `apps/backend/`, and `apps/frontend/` are properly configured to build in the correct sequential order, even when building specific projects.

## Build Dependency Graph

```
Leaf Libraries (no dependencies):
├── @finverse/cache
├── @finverse/utils
└── @finverse/logger
    └── (depended by @finverse/middlewares)

Utility Libraries:
└── @finverse/middlewares
    └── depends: @finverse/logger

Special Projects:
└── @gorules/jdm-editor (has internal lerna workspace)

Backend Applications:
├── lms
│   └── depends: @finverse/utils
├── ruleenginebe
│   └── depends: @finverse/logger, @finverse/middlewares, @finverse/utils
└── @finverse/site-platform
    └── depends: @finverse/cache, @finverse/logger, @finverse/middlewares, @finverse/utils

Frontend Applications:
├── admin_dashboard
│   └── (no internal lib dependencies)
└── ruleenginefe
    └── depends: @gorules/jdm-editor
```

## Available Build Commands

### Build Everything
```bash
pnpm build
```
Builds all projects in the correct dependency order:
1. Leaf libraries (@finverse/cache, @finverse/utils, @finverse/logger)
2. Dependent libraries (@finverse/middlewares)
3. All backend applications
4. All frontend applications

**Use case**: Initial setup, CI/CD pipelines, or when you need the complete build.

### Build Only Libraries
```bash
pnpm build:libs
```
Builds all libraries in `libs/` directory in the correct order:
1. @finverse/logger
2. @finverse/cache
3. @finverse/utils
4. @finverse/middlewares

**Use case**: When you only need to rebuild shared packages without touching apps.

### Build Only Backend
```bash
pnpm build:backend
```
Builds all backend applications with their dependencies:
- Automatically builds: @finverse/logger, @finverse/middlewares, @finverse/utils, @finverse/cache
- Then builds: lms, ruleenginebe, @finverse/site-platform

**Use case**: When working on backend features only.

### Build Only Frontend
```bash
pnpm build:frontend
```
Builds all frontend applications with their dependencies:
- Automatically builds: @gorules/jdm-editor
- Then builds: admin_dashboard, ruleenginefe

**Use case**: When working on frontend features only.

### Build Specific Applications

#### Backend Applications
```bash
pnpm build:lms
pnpm build:ruleenginebe
pnpm build:siteplatform
```

#### Frontend Applications
```bash
pnpm build:admin
pnpm build:ruleenginefe
```

These commands automatically build required dependencies first, ensuring no build failures due to missing imports.

## How It Works

### Turbo Configuration (`turbo.json`)

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"],
      "cache": true
    }
  }
}
```

**Key points:**
- `"dependsOn": ["^build"]` - Each build task depends on all its dependencies' build tasks (topological sorting)
- `"cache": true` - Results are cached locally for faster rebuilds
- `"outputs"` - Specifies what directories Turbo should cache

### Root Scripts (`package.json`)

All scripts use Turbo's `--filter` flag with package paths:
```bash
turbo run build --filter='./apps/backend/*'
```

This tells Turbo to:
1. Include packages matching the filter
2. Automatically include all their dependencies
3. Build in the correct order

## Filtering Patterns

You can use `--filter` for custom builds:

```bash
# Build only packages in libs/
turbo run build --filter='./libs/*'

# Build only a specific package
turbo run build --filter='lms'
turbo run build --filter='@finverse/site-platform'

# Exclude patterns
turbo run build --filter='./apps/backend/*' --filter='!ruleenginebe'
```

## Development Commands

```bash
# Run development servers in parallel
pnpm dev

# Run tests (after building dependencies)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run linting
pnpm lint

# Clean all build artifacts
pnpm clean
```

## Understanding Sequential Builds

When you run `pnpm build:backend`, Turbo automatically:

1. **Analyzes dependencies** in each backend app's package.json
2. **Identifies missing packages** from the workspace
3. **Builds dependencies first** in the correct order
4. **Then builds** the target packages

**Example: Building `@finverse/site-platform`**
```
Step 1: Build @finverse/logger (no dependencies)
Step 2: Build @finverse/cache (no dependencies)
Step 3: Build @finverse/utils (no dependencies)
Step 4: Build @finverse/middlewares (depends on @finverse/logger)
Step 5: Build @finverse/site-platform (depends on all above)
```

This happens **automatically** - no manual orchestration needed!

## Dry-Run Testing

Test build plans without executing:

```bash
# See what would happen
pnpm build:backend --dry-run

# Get detailed JSON output
pnpm build:backend --dry-run=json
```

Very useful for debugging if something seems off.

## Performance Optimization Tips

1. **Use build caching** - Turbo caches results by default
2. **Build only what you need** - Use specific build commands instead of `pnpm build` when possible
3. **Use `--parallel`** - For independent tasks:
   ```bash
   turbo run test:watch --parallel
   ```
4. **Monitor build times**:
   ```bash
   turbo run build --profile=build.json
   # Open profile in Chrome DevTools
   ```

## Troubleshooting

### Issue: "Module not found" in build
**Solution**: Run `pnpm build:libs` first to ensure all libraries are compiled before building apps.

### Issue: Build includes too many packages
**Solution**: Use more specific filters:
```bash
# Wrong: builds all backend + dependencies
pnpm build:backend

# Right: builds only the app
turbo run build --filter='lms' --no-deps
```

### Issue: Cache issues
**Solution**: Clean and rebuild:
```bash
pnpm clean
pnpm build
```

## CI/CD Integration

For continuous integration, use:

```bash
# Full build
pnpm install
pnpm build

# Or specific to changed packages (Turbo feature)
turbo run build --affected
```

## Adding New Projects

When you add a new package:

1. Ensure it has a `build` script in package.json
2. Add dependencies as workspace references: `"@finverse/utils": "workspace:*"`
3. Build ordering happens automatically based on these declarations
4. Test with: `pnpm build`

## Commands Summary

| Command | Purpose |
|---------|---------|
| `pnpm build` | Build everything |
| `pnpm build:libs` | Build libraries only |
| `pnpm build:backend` | Build backend + dependencies |
| `pnpm build:frontend` | Build frontend + dependencies |
| `pnpm build:lms` | Build LMS with dependencies |
| `pnpm build:ruleenginebe` | Build Rule Engine BE with dependencies |
| `pnpm build:siteplatform` | Build Site Platform with dependencies |
| `pnpm build:admin` | Build Admin Dashboard with dependencies |
| `pnpm build:ruleenginefe` | Build Rule Engine FE with dependencies |
| `pnpm dev` | Run dev servers in parallel |
| `pnpm test` | Run tests |
| `pnpm lint` | Run linting |
| `pnpm clean` | Clean all artifacts |
