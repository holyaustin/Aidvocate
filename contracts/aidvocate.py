# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing


class Aidvocate(gl.Contract):
    """
    AI-Powered Dispute Resolution Contract on GenLayer
    Uses Optimistic Democracy consensus with AI validators
    """
    
    # Storage fields
    disputes: TreeMap[str, str]
    evidence: TreeMap[str, str]
    points: TreeMap[Address, u256]
    next_id: u256
    total_disputes: u256

    def __init__(self):
        pass

    @gl.public.write
    def create_dispute(
        self,
        defendant: str,
        description: str,
        evidence_cid: str
    ) -> str:
        """
        Create a new dispute with escrowed funds
        """
        # Get sender and value using correct GenLayer syntax
        sender = gl.message.sender_address
        amount = gl.message.value
        
        # Input validation
        if amount <= 0:
            raise gl.vm.UserError("Must deposit GEN tokens to create a dispute")
        if len(defendant) == 0:
            raise gl.vm.UserError("Defendant address is required")
        if len(description) == 0:
            raise gl.vm.UserError("Description is required")
        if len(description) > 2000:
            raise gl.vm.UserError("Description must be less than 2000 characters")
        if len(evidence_cid) == 0:
            raise gl.vm.UserError("Evidence CID is required")
        
        # Convert Address to string for storage
        sender_str = sender.as_hex
        dispute_id = f"{sender_str}_{self.next_id}"
        
        dispute_data = {
            "id": dispute_id,
            "plaintiff": sender_str,
            "defendant": defendant,
            "amount": str(amount),
            "evidence_cid": evidence_cid,
            "description": description,
            "status": 0,
            "resolution": 0,
            "created_at": "0",
            "resolved_at": "0",
            "appeal_deadline": "0",
            "confidence": 0
        }
        
        self.disputes[dispute_id] = json.dumps(dispute_data)
        self.next_id = self.next_id + 1
        self.total_disputes = self.total_disputes + 1
        
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
        """
        sender = gl.message.sender_address
        sender_str = sender.as_hex
        
        # Check if dispute exists
        dispute_json = self.disputes.get(dispute_id, "")
        if dispute_json == "":
            raise gl.vm.UserError("Dispute not found")
        
        dispute = json.loads(dispute_json)
        if dispute["plaintiff"] != sender_str and dispute["defendant"] != sender_str:
            raise gl.vm.UserError("Not a party to this dispute")
        
        if dispute["status"] != 1:
            raise gl.vm.UserError("Dispute is not currently under review")
        
        if len(cid) < 10:
            raise gl.vm.UserError("Invalid CID format")
        
        # Store evidence
        evidence_key = f"{dispute['plaintiff']}_{dispute_id}"
        evidence_json = self.evidence.get(evidence_key, "")
        
        if evidence_json == "":
            evidence_list = []
        else:
            evidence_list = json.loads(evidence_json)
        
        evidence_list.append({
            "cid": cid,
            "type": evidence_type,
            "description": description,
            "timestamp": "0",
            "submitter": sender_str
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
        Appeal a resolved dispute
        """
        sender = gl.message.sender_address
        sender_str = sender.as_hex
        
        # Check if dispute exists
        dispute_json = self.disputes.get(dispute_id, "")
        if dispute_json == "":
            raise gl.vm.UserError("Dispute not found")
        
        dispute = json.loads(dispute_json)
        if dispute["status"] != 2:
            raise gl.vm.UserError("Only resolved disputes can be appealed")
        
        if sender_str != dispute["plaintiff"] and sender_str != dispute["defendant"]:
            raise gl.vm.UserError("Not a party to this dispute")
        
        dispute["status"] = 3
        self.disputes[dispute_id] = json.dumps(dispute)
        
        self._resolve_dispute(dispute_id)

    def _resolve_dispute(self, dispute_id: str) -> None:
        """
        Internal method to resolve a dispute using AI consensus
        Uses prompt_non_comparative as recommended in GenLayer docs for LLM responses
        """
        # Check if dispute exists
        dispute_json = self.disputes.get(dispute_id, "")
        if dispute_json == "":
            return
        
        dispute = json.loads(dispute_json)
        dispute["status"] = 1
        self.disputes[dispute_id] = json.dumps(dispute)
        
        try:
            # Define the input provider function
            def get_evidence():
                evidence_url = f"https://apricot-accepted-felidae-89.mypinata.cloud/ipfs/{dispute['evidence_cid']}"
                try:
                    web_data = gl.nondet.web.render(evidence_url, mode="text")
                except:
                    web_data = "Could not retrieve evidence from IPFS"
                return web_data
            
            # Use prompt_non_comparative as recommended in GenLayer documentation
            # This is specifically designed for LLM responses where validators evaluate
            # the leader's output against criteria rather than reproducing it
            result = gl.eq_principle.prompt_non_comparative(
                get_evidence,
                task=f"""
Analyze this dispute and determine who should win.

Dispute Details:
- Plaintiff: {dispute['plaintiff']}
- Defendant: {dispute['defendant']}
- Amount: {dispute['amount']} GEN
- Description: {dispute['description']}

Based on the evidence provided, decide:
- Winner: 1 for Plaintiff, 2 for Defendant
- Confidence: Your confidence level (0-100)
- Reasoning: Brief explanation

Return ONLY valid JSON with these exact fields.
""",
                criteria="""
The output must be valid JSON with exactly these fields:
- winner: integer (1 or 2)
- confidence: integer (0-100)
- reasoning: string

The winner should be determined based on the evidence provided.
The reasoning should be clear and based on the facts presented.
"""
            )
            
            # Parse the result
            if isinstance(result, str):
                # Clean up markdown if present
                cleaned = result.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(cleaned)
            else:
                parsed = result
            
            winner = parsed.get("winner", 0)
            confidence = parsed.get("confidence", 0)
            
            if winner == 1:
                dispute["resolution"] = 1
                winner_addr_str = dispute["plaintiff"]
            elif winner == 2:
                dispute["resolution"] = 2
                winner_addr_str = dispute["defendant"]
            else:
                dispute["status"] = 0
                self.disputes[dispute_id] = json.dumps(dispute)
                return
            
            dispute["status"] = 2
            dispute["resolved_at"] = "1"
            dispute["appeal_deadline"] = "1"
            dispute["confidence"] = confidence
            self.disputes[dispute_id] = json.dumps(dispute)
            
            # Transfer funds to winner
            amount = int(dispute["amount"])
            winner_addr = Address(winner_addr_str)
            gl.get_contract_at(winner_addr).emit_transfer(value=amount)
            
            # Award points
            current = self.points.get(winner_addr, u256(0))
            self.points[winner_addr] = current + 1
            
        except Exception as e:
            dispute["status"] = 0
            self.disputes[dispute_id] = json.dumps(dispute)

    @gl.public.view
    def get_dispute(self, dispute_id: str) -> dict:
        """Get a dispute by ID"""
        dispute_json = self.disputes.get(dispute_id, "")
        if dispute_json == "":
            raise gl.vm.UserError("Dispute not found")
        return json.loads(dispute_json)

    @gl.public.view
    def get_evidence(self, dispute_id: str) -> list:
        """Get all evidence for a dispute"""
        result = []
        evidence_suffix = f"_{dispute_id}"
        
        for key, value in self.evidence.items():
            if key.endswith(evidence_suffix):
                evidence_list = json.loads(value)
                result.extend(evidence_list)
        return result

    @gl.public.view
    def get_disputes_by_party(self, party: str) -> list:
        """Get all disputes for a party"""
        result = []
        for dispute_json in self.disputes.values():
            dispute = json.loads(dispute_json)
            if dispute["plaintiff"] == party or dispute["defendant"] == party:
                result.append(dispute)
        return result

    @gl.public.view
    def get_player_points(self, player_address: str) -> u256:
        """Get points for a player"""
        addr = Address(player_address)
        return self.points.get(addr, u256(0))

    @gl.public.view
    def get_points(self) -> dict:
        """Get all points"""
        result = {}
        for addr, pts in self.points.items():
            result[addr.as_hex] = int(pts)
        return result

    @gl.public.view
    def get_stats(self) -> str:
        """Get contract statistics"""
        total = 0
        resolved = 0
        appealed = 0
        pending = 0
        
        for dispute_json in self.disputes.values():
            total += 1
            dispute = json.loads(dispute_json)
            status = dispute.get("status", 0)
            if status == 2:
                resolved += 1
            elif status == 3:
                appealed += 1
            else:
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