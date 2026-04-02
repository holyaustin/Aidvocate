# test/test_aidvocate.py
"""Aidvocate tests using genlayer-test framework"""

import pytest
import json

# Try to import genlayer-test fixtures
try:
    from gltest import get_contract_factory
    from gltest.assertions import tx_execution_succeeded
    
    # These fixtures should be available when running with gltest
    HAS_GLTEST = True
except ImportError:
    HAS_GLTEST = False
    print("Warning: genlayer-test not available. Run with 'gltest' command.")


@pytest.mark.skipif(not HAS_GLTEST, reason="genlayer-test not available")
class TestAidvocateWithGLTest:
    """Tests that require genlayer-test framework - run with 'gltest' command"""
    
    def test_deploy_contract(self, default_account):
        """Test contract deployment"""
        factory = get_contract_factory("Aidvocate")
        contract = factory.deploy(args=[])
        
        assert contract is not None
        assert contract.address is not None
        
        # Check initial stats
        stats_json = contract.get_stats(args=[]).call()
        stats = json.loads(stats_json)
        assert stats["total_disputes"] == 0
        assert stats["dev_fee_rate"] == 20
    
    def test_create_dispute(self, default_account):
        """Test creating a dispute"""
        factory = get_contract_factory("Aidvocate")
        contract = factory.deploy(args=[])
        
        # Create dispute with value
        tx = contract.create_dispute(
            args=[
                "0xdefendant123456789012345678901234567890123456",
                "Test dispute",
                "QmTestEvidence123"
            ],
            value=1000
        ).transact()
        
        assert tx_execution_succeeded(tx)
        
        # Get stats to verify
        stats_json = contract.get_stats(args=[]).call()
        stats = json.loads(stats_json)
        assert stats["total_disputes"] >= 1
    
    def test_get_stats(self, default_account):
        """Test getting contract statistics"""
        factory = get_contract_factory("Aidvocate")
        contract = factory.deploy(args=[])
        
        stats_json = contract.get_stats(args=[]).call()
        stats = json.loads(stats_json)
        
        assert "total_disputes" in stats
        assert "resolved" in stats
        assert "appealed" in stats
        assert "pending" in stats
        assert "contract_version" in stats
        assert "dev_fee_rate" in stats
        assert stats["dev_fee_rate"] == 20
    
    def test_get_player_points(self, default_account):
        """Test getting player points"""
        factory = get_contract_factory("Aidvocate")
        contract = factory.deploy(args=[])
        
        # Initially points should be 0
        points = contract.get_player_points(args=[default_account.address]).call()
        assert points == 0