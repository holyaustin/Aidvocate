# test/test_no_framework.py
"""Tests that run without any test framework - just plain Python"""

import sys
import json
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from contracts.aidvocate import Aidvocate, DisputeStatus, Resolution


def run_tests():
    """Run all tests manually"""
    print("\n" + "=" * 60)
    print("Aidvocate Contract Tests")
    print("=" * 60)
    
    tests_passed = 0
    tests_failed = 0
    
    # Test 1: Contract class exists
    print("\n1. Testing contract class exists...")
    try:
        assert Aidvocate is not None
        print("   ✅ PASS")
        tests_passed += 1
    except AssertionError:
        print("   ❌ FAIL: Contract class not found")
        tests_failed += 1
    
    # Test 2: DisputeStatus enum
    print("\n2. Testing DisputeStatus enum...")
    try:
        assert DisputeStatus.PENDING == 0
        assert DisputeStatus.UNDER_REVIEW == 1
        assert DisputeStatus.RESOLVED == 2
        assert DisputeStatus.APPEALED == 3
        print("   ✅ PASS")
        tests_passed += 1
    except AssertionError as e:
        print(f"   ❌ FAIL: {e}")
        tests_failed += 1
    
    # Test 3: Resolution enum
    print("\n3. Testing Resolution enum...")
    try:
        assert Resolution.NOT_RESOLVED == 0
        assert Resolution.PLAINTIFF_WINS == 1
        assert Resolution.DEFENDANT_WINS == 2
        print("   ✅ PASS")
        tests_passed += 1
    except AssertionError as e:
        print(f"   ❌ FAIL: {e}")
        tests_failed += 1
    
    # Test 4: Contract initialization
    print("\n4. Testing contract initialization...")
    try:
        contract = Aidvocate()
        assert contract.next_id == 0
        assert contract.total_disputes == 0
        print("   ✅ PASS")
        tests_passed += 1
    except Exception as e:
        print(f"   ❌ FAIL: {e}")
        tests_failed += 1
    
    # Test 5: get_stats method
    print("\n5. Testing get_stats method...")
    try:
        contract = Aidvocate()
        stats_json = contract.get_stats()
        stats = json.loads(stats_json)
        assert stats["total_disputes"] == 0
        assert stats["resolved"] == 0
        assert stats["appealed"] == 0
        assert stats["pending"] == 0
        assert stats["contract_version"] == "1.0.0"
        assert stats["dev_fee_rate"] == 20
        print("   ✅ PASS")
        tests_passed += 1
    except Exception as e:
        print(f"   ❌ FAIL: {e}")
        tests_failed += 1
    
    # Test 6: Dispute dataclass
    print("\n6. Testing Dispute dataclass...")
    try:
        from contracts.aidvocate import Dispute
        dispute = Dispute(
            id="test_1",
            plaintiff="0xAlice",
            defendant="0xBob",
            amount=1000,
            evidence_cid="QmTest",
            description="Test dispute",
            status=DisputeStatus.PENDING,
            resolution=Resolution.NOT_RESOLVED,
            created_at=1000000,
            resolved_at=0,
            appeal_deadline=0,
            validator_count=5,
            confidence_score=0,
            owner="0xAlice"
        )
        assert dispute.id == "test_1"
        assert dispute.plaintiff == "0xAlice"
        print("   ✅ PASS")
        tests_passed += 1
    except Exception as e:
        print(f"   ❌ FAIL: {e}")
        tests_failed += 1
    
    # Test 7: Evidence dataclass
    print("\n7. Testing Evidence dataclass...")
    try:
        from contracts.aidvocate import Evidence
        evidence = Evidence(
            cid="QmEvidence",
            evidence_type="document",
            description="Test evidence",
            timestamp=1000000,
            submitter="0xAlice"
        )
        assert evidence.cid == "QmEvidence"
        assert evidence.evidence_type == "document"
        print("   ✅ PASS")
        tests_passed += 1
    except Exception as e:
        print(f"   ❌ FAIL: {e}")
        tests_failed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print(f"RESULTS: {tests_passed} passed, {tests_failed} failed")
    print("=" * 60)
    
    return tests_failed == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)