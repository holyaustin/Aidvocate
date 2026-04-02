"""Test fixtures for Aidvocate testing"""

# Sample evidence data for testing
SAMPLE_EVIDENCE_TEXT = """
CONTRACT AGREEMENT
==================
Date: January 15, 2025
Parties:
- Plaintiff: Alice Johnson (0x123...)
- Defendant: Bob Smith (0x456...)

Services Agreed:
Alice agreed to deliver a website for Bob's business by February 1, 2025.
Payment: 1000 GEN upon completion.

Deliverables:
- Fully functional e-commerce website
- Mobile responsive design
- 5 product pages
- Payment gateway integration

Status: Website was delivered on February 5, 2025, which is 4 days late.
Bob refused to pay citing the delay.
"""

SAMPLE_EVIDENCE_JSON = {
    "contract_id": "CT-2025-001",
    "plaintiff": "0x1234567890123456789012345678901234567890",
    "defendant": "0x0987654321098765432109876543210987654321",
    "amount": 1000,
    "description": "Website delivery dispute - late delivery",
    "delivery_date": "2025-02-05",
    "agreed_date": "2025-02-01",
    "quality_issues": "None",
    "communication": "Defendant acknowledged receipt but refused payment"
}

# Mock LLM responses for different scenarios
MOCK_LLM_RESPONSES = {
    "plaintiff_wins": {
        "winner": 1,
        "confidence": 85,
        "reasoning": "Defendant breached contract by refusing payment after services were rendered. The 4-day delay does not constitute material breach."
    },
    "defendant_wins": {
        "winner": 2,
        "confidence": 90,
        "reasoning": "Plaintiff failed to deliver on time as agreed. Time was of the essence for the project."
    },
    "draw": {
        "winner": 2,
        "confidence": 60,
        "reasoning": "Both parties contributed to the delay. Plaintiff delivered late but defendant acknowledged receipt."
    }
}