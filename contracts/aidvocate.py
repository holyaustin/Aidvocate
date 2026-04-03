# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


class Aidvocate(gl.Contract):
    """
    AI-Powered Dispute Resolution Contract on GenLayer
    Uses Optimistic Democracy consensus with AI validators
    """
    
    # Storage fields - auto-initialized to empty TreeMap
    disputes: TreeMap[str, str]  # dispute_id -> JSON string
    evidence: TreeMap[str, str]  # evidence_key -> JSON array string
    points: TreeMap[Address, u256]
    next_id: u256
    total_disputes: u256

    def __init__(self):
        """
        Initialize the contract
        Storage fields are automatically initialized as empty TreeMaps
        """
        pass

    def _get_winner_from_ai(self, dispute_data: dict) -> dict:
        """
        Get AI decision on dispute using the Equivalence Principle
        
        Args:
            dispute_data: Dictionary containing dispute details
            
        Returns:
            Dictionary with winner (1 or 2), confidence (0-100), and reasoning
        """
        def get_evaluation():
            # Fetch evidence from IPFS
            evidence_url = f"https://apricot-accepted-felidae-89.mypinata.cloud/ipfs/{dispute_data['evidence_cid']}"
            
            try:
                web_data = gl.nondet.web.render(evidence_url, mode="text")
            except:
                web_data = "Could not retrieve evidence from IPFS"
            
            prompt = f"""
You are an impartial arbitrator in Aidvocate, a decentralized justice system on GenLayer.

## DISPUTE DETAILS
- Plaintiff: {dispute_data['plaintiff']}
- Defendant: {dispute_data['defendant']}
- Amount at Stake: {dispute_data['amount']} GEN
- Description: {dispute_data['description']}

## EVIDENCE
{web_data[:3000]}

## YOUR TASK
Analyze the dispute and evidence thoroughly. Determine who should win based on:
1. The validity and credibility of the evidence presented
2. The reasonableness of each party's claims
3. Fairness and equity considerations
4. Any patterns of behavior or bad faith

## RESPONSE FORMAT
Respond with ONLY a valid JSON object in this exact format:
{{"winner": 1 or 2, "confidence": 0-100, "reasoning": "explanation"}}

- winner: 1 = Plaintiff wins, 2 = Defendant wins
- confidence: Your confidence level (0-100)
- reasoning: Brief explanation of your decision

It is mandatory that you respond only using the JSON format above,
nothing else. Don't include any other words or characters.
"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            cleaned = result.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        
        return gl.eq_principle.strict_eq(get_evaluation)

    @gl.public.write.payable
    def create_dispute(
        self,
        defendant: str,
        description: str,
        evidence_cid: str
    ) -> str:
        """
        Create a new dispute with escrowed funds
        
        Args:
            defendant: The address of the defendant
            description: Description of the dispute (max 2000 chars)
            evidence_cid: IPFS CID of the initial evidence
            
        Returns:
            dispute_id: The ID of the created dispute
        """
        # Input validation
        if gl.message.value <= 0:
            raise gl.vm.UserError("Must deposit GEN tokens to create a dispute")
        if len(defendant) == 0:
            raise gl.vm.UserError("Defendant address is required")
        if len(description) == 0:
            raise gl.vm.UserError("Description is required")
        if len(description) > 2000:
            raise gl.vm.UserError("Description must be less than 2000 characters")
        if len(evidence_cid) == 0:
            raise gl.vm.UserError("Evidence CID is required")
        
        sender = gl.message.sender
        dispute_id = f"{sender.as_hex}_{self.next_id}"
        
        dispute_data = {
            "id": dispute_id,
            "plaintiff": sender.as_hex,
            "defendant": defendant,
            "amount": str(gl.message.value),
            "evidence_cid": evidence_cid,
            "description": description,
            "status": 0,  # PENDING
            "resolution": 0,  # NOT_RESOLVED
            "created_at": str(gl.block.timestamp),
            "resolved_at": "0",
            "appeal_deadline": "0",
            "confidence": 0
        }
        
        self.disputes[dispute_id] = json.dumps(dispute_data)
        self.next_id += 1
        self.total_disputes += 1
        
        # Trigger AI resolution
        self._resolve_dispute(dispute_id)
        
        return dispute_id

    @gl.public.write
    def submit_evidence(
        self, 
        dispute_id: str, 
        cid: str, 
        evidence_type: str, 
        description: str
    ) -> None:
        """
        Submit additional evidence for a dispute
        
        Args:
            dispute_id: The ID of the dispute
            cid: IPFS CID of the evidence
            evidence_type: Type of evidence (text, image, document, audio, video)
            description: Description of the evidence
        """
        if dispute_id not in self.disputes:
            raise gl.vm.UserError("Dispute not found")
        
        dispute = json.loads(self.disputes[dispute_id])
        if dispute["plaintiff"] != gl.message.sender.as_hex and dispute["defendant"] != gl.message.sender.as_hex:
            raise gl.vm.UserError("Not a party to this dispute")
        
        if dispute["status"] != 1:  # UNDER_REVIEW
            raise gl.vm.UserError("Dispute is not currently under review")
        
        if len(cid) < 10:
            raise gl.vm.UserError("Invalid CID format")
        
        # Store evidence
        evidence_key = f"{dispute['plaintiff']}_{dispute_id}"
        if evidence_key not in self.evidence:
            self.evidence[evidence_key] = "[]"
        
        evidence_list = json.loads(self.evidence[evidence_key])
        evidence_list.append({
            "cid": cid,
            "type": evidence_type,
            "description": description,
            "timestamp": str(gl.block.timestamp),
            "submitter": gl.message.sender.as_hex
        })
        self.evidence[evidence_key] = json.dumps(evidence_list)
        
        # Update dispute with new evidence
        dispute["evidence_cid"] = cid
        self.disputes[dispute_id] = json.dumps(dispute)
        
        # Re-evaluate with new evidence
        self._resolve_dispute(dispute_id)

    @gl.public.write
    def appeal(self, dispute_id: str) -> None:
        """
        Appeal a resolved dispute - triggers expanded validator set (1000 validators)
        
        Args:
            dispute_id: The ID of the dispute to appeal
        """
        if dispute_id not in self.disputes:
            raise gl.vm.UserError("Dispute not found")
        
        dispute = json.loads(self.disputes[dispute_id])
        if dispute["status"] != 2:  # RESOLVED
            raise gl.vm.UserError("Only resolved disputes can be appealed")
        
        if int(dispute["appeal_deadline"]) < gl.block.timestamp:
            raise gl.vm.UserError("Appeal deadline has passed")
        
        if gl.message.sender.as_hex != dispute["plaintiff"] and gl.message.sender.as_hex != dispute["defendant"]:
            raise gl.vm.UserError("Not a party to this dispute")
        
        dispute["status"] = 3  # APPEALED
        self.disputes[dispute_id] = json.dumps(dispute)
        
        # Re-evaluate with expanded validator set
        self._resolve_dispute(dispute_id)

    def _resolve_dispute(self, dispute_id: str) -> None:
        """
        Internal method to resolve a dispute using AI consensus
        """
        if dispute_id not in self.disputes:
            return
        
        dispute = json.loads(self.disputes[dispute_id])
        dispute["status"] = 1  # UNDER_REVIEW
        self.disputes[dispute_id] = json.dumps(dispute)
        
        try:
            result = self._get_winner_from_ai(dispute)
            winner = result.get("winner", 0)
            confidence = result.get("confidence", 0)
            
            if winner == 1:
                dispute["resolution"] = 1  # PLAINTIFF_WINS
                winner_addr = dispute["plaintiff"]
            elif winner == 2:
                dispute["resolution"] = 2  # DEFENDANT_WINS
                winner_addr = dispute["defendant"]
            else:
                # Invalid winner, keep as pending
                dispute["status"] = 0
                self.disputes[dispute_id] = json.dumps(dispute)
                return
            
            dispute["status"] = 2  # RESOLVED
            dispute["resolved_at"] = str(gl.block.timestamp)
            dispute["appeal_deadline"] = str(gl.block.timestamp + 7 * 24 * 3600)
            dispute["confidence"] = confidence
            self.disputes[dispute_id] = json.dumps(dispute)
            
            # Transfer funds to winner
            amount = int(dispute["amount"])
            if winner == 1:
                gl.transfer(Address(dispute["plaintiff"]), amount)
            else:
                gl.transfer(Address(dispute["defendant"]), amount)
            
            # Award points to winner
            current = self.points.get(Address(winner_addr), u256(0))
            self.points[Address(winner_addr)] = current + 1
            
        except Exception as e:
            # On error, revert to pending state
            dispute["status"] = 0
            self.disputes[dispute_id] = json.dumps(dispute)

    @gl.public.view
    def get_dispute(self, dispute_id: str) -> dict:
        """
        Get a dispute by ID
        
        Args:
            dispute_id: The ID of the dispute
            
        Returns:
            Dictionary containing dispute details
        """
        if dispute_id not in self.disputes:
            raise gl.vm.UserError("Dispute not found")
        return json.loads(self.disputes[dispute_id])

    @gl.public.view
    def get_evidence(self, dispute_id: str) -> list[dict]:
        """
        Get all evidence for a dispute
        
        Args:
            dispute_id: The ID of the dispute
            
        Returns:
            List of evidence dictionaries
        """
        result = []
        evidence_suffix = f"_{dispute_id}"
        
        for key in self.evidence:
            if key.endswith(evidence_suffix):
                evidence_list = json.loads(self.evidence[key])
                result.extend(evidence_list)
        return result

    @gl.public.view
    def get_disputes_by_party(self, party: str) -> list[dict]:
        """
        Get all disputes where the given address is plaintiff or defendant
        
        Args:
            party: The address to search for
            
        Returns:
            List of dispute dictionaries
        """
        result = []
        for dispute_data in self.disputes.values():
            dispute = json.loads(dispute_data)
            if dispute["plaintiff"] == party or dispute["defendant"] == party:
                result.append(dispute)
        return result

    @gl.public.view
    def get_player_points(self, player_address: str) -> u256:
        """
        Get points for a specific player
        
        Args:
            player_address: The address of the player
            
        Returns:
            Number of points earned
        """
        return self.points.get(Address(player_address), u256(0))

    @gl.public.view
    def get_points(self) -> dict:
        """
        Get all points for all players
        
        Returns:
            Dictionary mapping addresses to points
        """
        return {k.as_hex: v for k, v in self.points.items()}

    @gl.public.view
    def get_stats(self) -> str:
        """
        Get contract statistics
        
        Returns:
            JSON string with contract statistics
        """
        total = len(self.disputes)
        resolved = 0
        appealed = 0
        pending = 0
        
        for dispute_data in self.disputes.values():
            dispute = json.loads(dispute_data)
            status = dispute.get("status", 0)
            if status == 2:  # RESOLVED
                resolved += 1
            elif status == 3:  # APPEALED
                appealed += 1
            else:  # PENDING or UNDER_REVIEW
                pending += 1
        
        stats = {
            "total_disputes": total,
            "resolved": resolved,
            "appealed": appealed,
            "pending": pending,
            "contract_version": "1.0.0",
            "dev_fee_rate": 20
        }
        return json.dumps(stats)