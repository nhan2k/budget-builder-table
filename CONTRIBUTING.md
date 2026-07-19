# Contributing to Budget Builder Table

Thank you for your interest in contributing to Budget Builder Table! This document provides guidelines and instructions for contributing to the project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control

## Getting Started

### 1. Fork and Clone the Repository

If you haven't already, fork the repository on GitHub and clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/budget-builder-table.git
cd budget-builder-table
```

### 2. Install Dependencies

Install all project dependencies:

```bash
npm install
```

## Development Workflow

### Running the Development Server

Start the development server with live reload:

```bash
npm start
```

Or use the Angular CLI directly:

```bash
ng serve
```

The application will be available at `http://localhost:4200/`. The server will automatically reload when you make changes to source files.

### Building the Project

#### Development Build with Watch Mode

For development with automatic rebuilds:

```bash
npm run watch
```

#### Production Build

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

### Running Tests

Execute the test suite:

```bash
npm test
```

This runs the tests using Karma test runner and Jasmine framework. Test results and coverage will be displayed in your terminal.

## Branch and PR Conventions

### Branch Naming

When creating a new branch for your contribution, use these naming conventions:

- `feature/` - New features (`feature/add-budget-filter`)
- `fix/` - Bug fixes (`fix/fix-calculation-error`)
- `docs/` - Documentation updates (`docs/update-readme`)
- `refactor/` - Code refactoring (`refactor/simplify-component`)

### Creating a Pull Request

1. Ensure your branch is up to date with the main branch:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. Push your changes to your fork:
   ```bash
   git push origin your-branch
   ```

3. Create a pull request from your fork to the main repository
4. Provide a clear description of what your PR does and why
5. Link any related issues

### Code Style

- Follow existing code style and formatting
- Write meaningful commit messages
- Add comments for complex logic
- Ensure all tests pass before submitting

## Getting Help

If you need help:

- Open an issue for bugs or feature requests
- Check existing issues and discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
