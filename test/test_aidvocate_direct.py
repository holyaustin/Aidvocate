"""Direct Mode tests for Aidvocate using genlayer-test fixtures"""

import pytest
import json


class TestAidvocateDirect:
    """Simple Direct Mode tests following the official guide"""

    def test_create_dispute(self, direct_vm, direct_deploy, direct_alice, direct_bob):
        """Test creating a dispute with mocked web/LLM"""
        # Mock IPFS response
        direct_vm.mock_web(
            r"gateway\.pinata\.cloud/ipfs/.*",
            {"status": 200, "body": "Mock evidence content"}
        )

        # Mock LLM response for dispute evaluation
        mock_llm_response = {
            "winner": 1,
            "confidence": 85,
            "reasoning": "Plaintiff provided sufficient evidence."
        }
        direct_vm.mock_llm(r".*", json.dumps(mock_llm_response))

        # Deploy the contract
        contract = direct_deploy("contracts/aidvocate.py")

        # Set transaction sender and value
        direct_vm.sender = direct_alice
        direct_vm.value = 1000  # 1000 GEN

        # Create a dispute
        dispute_id = contract.create_dispute(
            direct_bob,
            "Failed to deliver goods",
            "QmTestEvidence123"
        )

        # Verify dispute was created
        dispute = contract.get_dispute(dispute_id)
        assert dispute["plaintiff"] == direct_alice
        assert dispute["defendant"] == direct_bob
        assert dispute["amount"] == 1000
        assert dispute["description"] == "Failed to deliver goods"

        # Check that the dispute is in the correct state (under review or resolved)
        assert dispute["status"] in (0, 1, 2)  # PENDING, UNDER_REVIEW, or RESOLVED

        # Verify stats updated
        stats_json = contract.get_stats()
        stats = json.loads(stats_json)
        assert stats["total_disputes"] == 1