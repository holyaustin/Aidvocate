# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


class Aidvocate(gl.Contract):
    # All storage fields - simple types only
    # These are auto-initialized to empty TreeMap when contract is created
    disputes: TreeMap[str, str]  # JSON string storage
    evidence: TreeMap[str, str]  # dispute_id -> evidence_json
    points: TreeMap[Address, u256]
    next_id: u256
    total_disputes: u256

    def __init__(self):
        # DO NOT assign to storage fields in __init__
        # They are automatically initialized
        # Just leave them as is - they're already empty TreeMaps
        pass

    def _get_winner_from_ai(self, dispute_data: dict) -> dict:
        """Get AI decision on dispute"""
        def get_evaluation():
            evidence_url = f"https://apricot-accepted-felidae-89.mypinata.cloud/ipfs/{dispute_data['evidence_cid']}"
            
            try:
                web_data = gl.nondet.web.render(evidence_url, mode="text")
            except:
                web_data = "Could not retrieve evidence"
            
            prompt = f"""
You are an impartial arbitrator. Analyze this dispute:

Plaintiff: {dispute_data['plaintiff']}
Defendant: {dispute_data['defendant']}
Amount: {dispute_data['amount']} GEN
Description: {dispute_data['description']}

Evidence:
{web_data[:2000]}

Decide who should win. Respond with JSON:
{{"winner": 1 or 2, "confidence": 0-100, "reasoning": "explanation"}}
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
        # Use gl.message, not gl.msg
        if gl.message.value <= 0:
            raise gl.vm.UserError("Must deposit GEN tokens")
        if len(defendant) == 0:
            raise gl.vm.UserError("Defendant address required")
        if len(description) == 0:
            raise gl.vm.UserError("Description required")
        if len(evidence_cid) == 0:
            raise gl.vm.UserError("Evidence CID required")
        
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
    def submit_evidence(self, dispute_id: str, cid: str, evidence_type: str, description: str) -> None:
        if dispute_id not in self.disputes:
            raise gl.vm.UserError("Dispute not found")
        
        dispute = json.loads(self.disputes[dispute_id])
        if dispute["plaintiff"] != gl.message.sender.as_hex and dispute["defendant"] != gl.message.sender.as_hex:
            raise gl.vm.UserError("Not a party to this dispute")
        
        if dispute["status"] != 1:  # UNDER_REVIEW
            raise gl.vm.UserError("Dispute not under review")
        
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
        
        # Re-evaluate
        self._resolve_dispute(dispute_id)

    @gl.public.write
    def appeal(self, dispute_id: str) -> None:
        if dispute_id not in self.disputes:
            raise gl.vm.UserError("Dispute not found")
        
        dispute = json.loads(self.disputes[dispute_id])
        if dispute["status"] != 2:  # RESOLVED
            raise gl.vm.UserError("Only resolved disputes can be appealed")
        
        if int(dispute["appeal_deadline"]) < gl.block.timestamp:
            raise gl.vm.UserError("Appeal deadline passed")
        
        if gl.message.sender.as_hex != dispute["plaintiff"] and gl.message.sender.as_hex != dispute["defendant"]:
            raise gl.vm.UserError("Not a party")
        
        dispute["status"] = 3  # APPEALED
        self.disputes[dispute_id] = json.dumps(dispute)
        
        self._resolve_dispute(dispute_id)

    def _resolve_dispute(self, dispute_id: str) -> None:
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
                return
            
            dispute["status"] = 2  # RESOLVED
            dispute["resolved_at"] = str(gl.block.timestamp)
            dispute["appeal_deadline"] = str(gl.block.timestamp + 7 * 24 * 3600)
            dispute["confidence"] = confidence
            self.disputes[dispute_id] = json.dumps(dispute)
            
            # Transfer funds
            amount = int(dispute["amount"])
            if winner == 1:
                gl.transfer(Address(dispute["plaintiff"]), amount)
            else:
                gl.transfer(Address(dispute["defendant"]), amount)
            
            # Award points
            current = self.points.get(Address(winner_addr), u256(0))
            self.points[Address(winner_addr)] = current + 1
            
        except Exception:
            dispute["status"] = 0  # PENDING
            self.disputes[dispute_id] = json.dumps(dispute)

    @gl.public.view
    def get_dispute(self, dispute_id: str) -> dict:
        if dispute_id not in self.disputes:
            raise gl.vm.UserError("Dispute not found")
        return json.loads(self.disputes[dispute_id])

    @gl.public.view
    def get_evidence(self, dispute_id: str) -> DynArray[dict]:
        result = DynArray()
        for key in self.evidence:
            if key.endswith(dispute_id):
                evidence_list = json.loads(self.evidence[key])
                for ev in evidence_list:
                    result.append(ev)
        return result

    @gl.public.view
    def get_disputes_by_party(self, party: str) -> DynArray[dict]:
        result = DynArray()
        for dispute_id in self.disputes:
            dispute = json.loads(self.disputes[dispute_id])
            if dispute["plaintiff"] == party or dispute["defendant"] == party:
                result.append(dispute)
        return result

    @gl.public.view
    def get_player_points(self, player_address: str) -> u256:
        return self.points.get(Address(player_address), u256(0))

    @gl.public.view
    def get_points(self) -> dict:
        return {k.as_hex: v for k, v in self.points.items()}

    @gl.public.view
    def get_stats(self) -> str:
        stats = {
            "total_disputes": int(self.total_disputes),
            "contract_version": "1.0.0",
            "dev_fee_rate": 20
        }
        return json.dumps(stats)