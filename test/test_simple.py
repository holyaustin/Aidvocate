# test/test_simple.py
"""Simple test following GenLayer testing guide"""

import pytest
import json

# Try to import gltest
try:
    from gltest import get_contract_factory
    from gltest.assertions import tx_execution_succeeded
    GLTEST_AVAILABLE = True
except ImportError as e:
    GLTEST_AVAILABLE = False
    print(f"gltest not available: {e}")


@pytest.mark.skipif(not GLTEST_AVAILABLE, reason="gltest not installed")
class TestAidvocate:
    """Test Aidvocate contract following the official guide"""
    
    def test_deploy_contract(self):
        """Test deploying the contract"""
        print("\n=== Testing Contract Deployment ===")
        
        try:
            factory = get_contract_factory("Aidvocate")
            contract = factory.deploy(args=[])
            
            assert contract is not None
            assert contract.address is not None
            print(f"✅ Contract deployed at: {contract.address}")
            
        except Exception as e:
            print(f"❌ Deployment failed: {e}")
            raise
    
    def test_get_stats(self):
        """Test the get_stats method"""
        print("\n=== Testing get_stats ===")
        
        try:
            factory = get_contract_factory("Aidvocate")
            contract = factory.deploy(args=[])
            
            stats_json = contract.get_stats(args=[]).call()
            stats = json.loads(stats_json)
            
            assert stats["total_disputes"] == 0
            assert stats["dev_fee_rate"] == 20
            print(f"✅ Stats: {stats}")
            
        except Exception as e:
            print(f"❌ Stats test failed: {e}")
            raise
    
    def test_create_dispute(self):
        """Test creating a dispute"""
        print("\n=== Testing create_dispute ===")
        
        try:
            factory = get_contract_factory("Aidvocate")
            contract = factory.deploy(args=[])
            
            # Create a dispute
            tx = contract.create_dispute(
                args=[
                    "0xdefendant123456789012345678901234567890123456",
                    "Test dispute for the hackathon",
                    "QmTestEvidence123"
                ],
                value=1000
            ).transact()
            
            assert tx_execution_succeeded(tx)
            print("✅ Dispute created successfully")
            
            # Check stats
            stats_json = contract.get_stats(args=[]).call()
            stats = json.loads(stats_json)
            assert stats["total_disputes"] >= 1
            print(f"✅ Stats after creation: {stats}")
            
        except Exception as e:
            print(f"❌ Create dispute failed: {e}")
            raise