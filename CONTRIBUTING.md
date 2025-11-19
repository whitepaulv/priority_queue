# Contributing to PriorityForge

Thank you for your interest in contributing to PriorityForge! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/priority_forge.git
   cd priority_forge
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Set up the development environment**:
   ```bash
   chmod +x scripts/setup_dev.sh
   ./scripts/setup_dev.sh
   ```

## Development Setup

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Initialize Database

```bash
python scripts/init_db.py
```

## Making Changes

### Coding Standards

- **Python**: Follow [PEP 8](https://pep8.org/) style guide
- **JavaScript/React**: Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- **Type Hints**: Use type hints for all Python functions
- **Docstrings**: Add docstrings to all classes and functions
- **Comments**: Add comments for complex logic

### Code Formatting

We use automated formatting tools:
- **Python**: `black`, `isort`, `flake8`
- **JavaScript**: `prettier`, `eslint`

Before committing, run:
```bash
# Install pre-commit hooks
pre-commit install

# Or run manually
pre-commit run --all-files
```

### Testing

- Write tests for new features
- Ensure all existing tests pass
- Maintain or improve test coverage

Run tests:
```bash
# Backend tests
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm test
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: add priority queue visualization endpoint

- Added GET /api/visualize/pq endpoint
- Implemented queue snapshot generation
- Added corresponding tests
```

## Pull Request Process

1. **Update Documentation**: Update relevant documentation for your changes
2. **Add Tests**: Ensure tests cover your changes
3. **Run Linters**: Fix any linting errors
4. **Update CHANGELOG**: Add entry describing your changes (if applicable)
5. **Create Pull Request**:
   - Provide a clear description of changes
   - Reference any related issues
   - Request review from maintainers

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No new linting errors
- [ ] Commit messages follow conventions

## Reporting Issues

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python version, Node version)
- Relevant logs or error messages

### Feature Requests

Include:
- Clear description of the feature
- Use case or problem it solves
- Proposed implementation (if applicable)

## Project Structure

- `backend/` - FastAPI backend application
- `frontend/` - React frontend application
- `docs/` - Project documentation
- `scripts/` - Utility scripts

See [docs/project-structure.md](docs/project-structure.md) for details.

## Questions?

Feel free to:
- Open an issue for discussion
- Contact maintainers
- Join our community discussions

Thank you for contributing to PriorityForge! 🚀

