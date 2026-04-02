# test/conftest.py
"""Pytest configuration for Aidvocate tests - enables genlayer-test fixtures"""

import pytest

# Import genlayer-test fixtures to make them available
# This is required for direct_vm, direct_deploy, direct_alice, etc.
pytest_plugins = [
    "gltest.pytest_plugin",
]

# You can add custom fixtures here if needed