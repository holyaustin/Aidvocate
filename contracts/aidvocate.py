# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing
from dataclasses import dataclass
from enum import Enum

class DisputeStatus(Enum):
    PENDING = 0      # Waiting for AI validation
    UNDER_REVIEW = 1 # Validators are evaluating
    RESOLVED = 2     # Final decision made
    APPEALED = 3     # Under expanded review

class Resolution(Enum):
    PLAINTIFF_WINS = 0
    DEFENDANT_WINS = 1
    NOT_RESOLVED = 2

@dataclass
class Dispute:
    id: u256
    plaintiff: str
    defendant: str
    amount: u256                      # GEN amount in dispute (wei)
    evidence_cid: str                 # IPFS CID for aggregated evidence
    description: str
    status: DisputeStatus
    resolution: Resolution
    created_at: u256
    resolved_at: u256
    appeal_deadline: u256
    validator_count: u256

@dataclass
class Evidence:
    cid: str
    evidence_type: str                # "text", "image", "document"
    description: str
    timestamp: u256
    submitter: str

class Aidvocate(gl.Contract):
    # Persistent storage
    disputes: DynArray[Dispute]
    dispute_evidence: TreeMap[u256, DynArray[Evidence]]
    next_id: u256
    
    def __init__(self):
        """Initialize the contract with empty state"""
        self.disputes = DynArray()
        self.dispute_evidence = TreeMap()
        self.next_id = 0
    
    @gl.public.write.payable
    def create_dispute(self, defendant: str, description: str, evidence_cid: str) -> u256:
        """
        Create a new dispute with escrowed funds
        Args:
            defendant: Address of the defendant
            description: Description of the dispute
            evidence_cid: IPFS CID of initial evidence
        Returns:
            dispute_id: The ID of the created dispute
        """
        # Validate inputs
        assert gl.msg.value > 0, "Must deposit GEN to dispute"
        assert len(description) > 0, "Description required"
        assert len(evidence_cid) > 0, "Evidence required"
        
        dispute_id = self.next_id
        dispute = Dispute(
            id=dispute_id,
            plaintiff=gl.msg.sender,
            defendant=defendant,
            amount=gl.msg.value,
            evidence_cid=evidence_cid,
            description=description,
            status=DisputeStatus.PENDING,
            resolution=Resolution.NOT_RESOLVED,
            created_at=gl.block.timestamp,
            resolved_at=0,
            appeal_deadline=0,
            validator_count=5  # Start with 5 validators (Optimistic Democracy)
        )
        
        self.disputes.append(dispute)
        self.dispute_evidence[dispute_id] = DynArray()
        self.next_id += 1
        
        # Trigger initial AI evaluation
        self._evaluate_dispute(dispute_id)
        
        return dispute_id
    
    @gl.public.write
    def submit_evidence(self, dispute_id: u256, cid: str, evidence_type: str, description: str):
        """
        Submit additional evidence for a dispute
        """
        dispute = self.disputes[dispute_id]
        assert dispute.plaintiff == gl.msg.sender or dispute.defendant == gl.msg.sender, "Not party to dispute"
        assert dispute.status == DisputeStatus.UNDER_REVIEW, "Dispute not under review"
        
        evidence = Evidence(
            cid=cid,
            evidence_type=evidence_type,
            description=description,
            timestamp=gl.block.timestamp,
            submitter=gl.msg.sender
        )
        
        self.dispute_evidence[dispute_id].append(evidence)
        
        # Update aggregated evidence CID (using latest evidence as representative for simplicity)
        dispute.evidence_cid = cid
        self.disputes[dispute_id] = dispute
        
        # Re-evaluate with new evidence
        self._evaluate_dispute(dispute_id)
    
    @gl.public.write
    def appeal(self, dispute_id: u256):
        """
        Appeal a resolved dispute - triggers expanded validator set (1000)
        """
        dispute = self.disputes[dispute_id]
        assert dispute.status == DisputeStatus.RESOLVED, "Not resolved"
        assert gl.block.timestamp < dispute.appeal_deadline, "Appeal deadline passed"
        assert gl.msg.sender == dispute.plaintiff or gl.msg.sender == dispute.defendant, "Not party"
        
        dispute.status = DisputeStatus.APPEALED
        dispute.validator_count = 1000  # Expand to full validator set
        self.disputes[dispute_id] = dispute
        
        # Re-evaluate with expanded validators
        self._evaluate_dispute(dispute_id)
    
    def _evaluate_dispute(self, dispute_id: u256):
        """
        Internal method to evaluate a dispute using AI consensus
        This is where the Equivalence Principle is applied
        """
        dispute = self.disputes[dispute_id]
        dispute.status = DisputeStatus.UNDER_REVIEW
        self.disputes[dispute_id] = dispute
        
        # Define the non-deterministic block for AI evaluation
        def evaluate_nondet() -> str:
            # Fetch evidence from IPFS via web connectivity
            evidence_url = f"https://gateway.pinata.cloud/ipfs/{dispute.evidence_cid}"
            evidence_data = gl.nondet.web.get(evidence_url)
            evidence_text = evidence_data.body.decode("utf-8")
            
            # Construct the evaluation prompt
            prompt = f"""
You are an impartial arbitrator in a decentralized justice system called Aidvocate.

## Dispute Details
**Plaintiff**: {dispute.plaintiff}
**Defendant**: {dispute.defendant}
**Amount in Dispute**: {dispute.amount} GEN

**Description**:
{dispute.description}

## Evidence
{evidence_text[:5000]}  # Limit to 5000 chars for token efficiency

## Your Task
Analyze the evidence and determine who should win this dispute.

Consider:
1. The validity of the evidence provided
2. The credibility of each party's claims
3. The fairness of the outcome
4. Any patterns of behavior or bad faith

## Response Format
Respond with ONLY a JSON object:
{{
    "winner": int,    // 0 for plaintiff wins, 1 for defendant wins
    "confidence": int, // 0-100 confidence score
    "reasoning": str  // Brief explanation of your decision
}}

It is mandatory that you respond only using the JSON format above, nothing else.
"""
            
            # Execute AI inference
            result = gl.nondet.exec_prompt(prompt)
            
            # Clean the result (remove markdown code blocks if present)
            result = result.replace("```json", "").replace("```", "").strip()
            return result
        
        # Apply Equivalence Principle - strict equality for this use case
        # All validators must return the exact same JSON structure
        result_json_str = gl.eq_principle.strict_eq(evaluate_nondet)
        
        # Parse and apply the result
        try:
            result = json.loads(result_json_str)
            winner = result.get("winner", 2)
            confidence = result.get("confidence", 0)
            reasoning = result.get("reasoning", "")
            
            # Log for debugging (appears in GenVM logs)
            print(f"Dispute {dispute_id} resolved: Winner={winner}, Confidence={confidence}%, Reasoning={reasoning}")
            
            # Update dispute state
            if winner == 0:
                dispute.resolution = Resolution.PLAINTIFF_WINS
            elif winner == 1:
                dispute.resolution = Resolution.DEFENDANT_WINS
            else:
                # Invalid response, keep as not resolved
                dispute.status = DisputeStatus.PENDING
                self.disputes[dispute_id] = dispute
                return
            
            dispute.status = DisputeStatus.RESOLVED
            dispute.resolved_at = gl.block.timestamp
            dispute.appeal_deadline = gl.block.timestamp + 7 * 24 * 3600  # 7 days in seconds
            
            # Distribute funds based on resolution
            if dispute.resolution == Resolution.PLAINTIFF_WINS:
                # Transfer to plaintiff
                gl.transfer(dispute.plaintiff, dispute.amount)
                print(f"Transferring {dispute.amount} GEN to plaintiff {dispute.plaintiff}")
            else:
                # Transfer to defendant
                gl.transfer(dispute.defendant, dispute.amount)
                print(f"Transferring {dispute.amount} GEN to defendant {dispute.defendant}")
            
            self.disputes[dispute_id] = dispute
            
        except json.JSONDecodeError as e:
            # Handle malformed response
            print(f"Error parsing AI response: {e}")
            dispute.status = DisputeStatus.PENDING
            self.disputes[dispute_id] = dispute
    
    @gl.public.view
    def get_dispute(self, dispute_id: u256) -> Dispute:
        """Get dispute details by ID"""
        return self.disputes[dispute_id]
    
    @gl.public.view
    def get_evidence(self, dispute_id: u256) -> DynArray[Evidence]:
        """Get all evidence for a dispute"""
        return self.dispute_evidence.get(dispute_id, DynArray())
    
    @gl.public.view
    def get_disputes_by_party(self, party: str) -> DynArray[Dispute]:
        """Get all disputes where party is plaintiff or defendant"""
        result = DynArray()
        for dispute in self.disputes:
            if dispute.plaintiff == party or dispute.defendant == party:
                result.append(dispute)
        return result
    
    @gl.public.view
    def get_stats(self) -> str:
        """Get contract statistics"""
        total = len(self.disputes)
        resolved = sum(1 for d in self.disputes if d.status == DisputeStatus.RESOLVED)
        appealed = sum(1 for d in self.disputes if d.status == DisputeStatus.APPEALED)
        
        return json.dumps({
            "total_disputes": total,
            "resolved": resolved,
            "appealed": appealed,
            "contract_version": "1.0.0"
        })