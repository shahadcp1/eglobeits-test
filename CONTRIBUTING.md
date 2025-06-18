# Contributing to Event Management API

We're excited that you're interested in contributing to the Event Management API! Whether it's a bug report, new feature, or documentation improvement, your contributions are welcome.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Style Guide](#style-guide)
- [Commit Message Guidelines](#commit-message-guidelines)
- [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check [this list](#before-submitting-a-bug-report) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible.

### Before Submitting A Bug Report

- **Perform a [cursory search](https://github.com/yourusername/event-management-api/issues) to see if the problem has already been reported.** If it has **and the issue is still open**, add a comment to the existing issue instead of opening a new one.

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/yourusername/event-management-api/issues).

### Your First Code Contribution

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Requests

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations, and container parameters.
3. Increase the version numbers in any example files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (optional)
- PostgreSQL (if not using Docker)

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/event-management-api.git
   cd event-management-api
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

### Running Tests

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### Using Docker

```bash
# Start all services
make docker-up

# Stop all services
make docker-down

# View logs
docker-compose logs -f
```

## Style Guide

- **TypeScript**: Follow the [TypeScript Coding Guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
- **Naming Conventions**: Use camelCase for variables and functions, PascalCase for classes and interfaces
- **Comments**: Document complex logic and non-obvious code
- **Formatting**: Use Prettier for consistent code formatting

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for our commit messages. Here are some examples:

```
feat: add new endpoint for user registration
fix: correct validation in user creation
docs: update README with new setup instructions
chore: update dependencies
test: add unit tests for user service
refactor: improve error handling in auth middleware
```

## License

By contributing, you agree that your contributions will be licensed under its [MIT License](LICENSE).
