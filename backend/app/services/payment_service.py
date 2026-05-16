from typing import Dict


def process_payment(payment_data: Dict) -> Dict:
    # Placeholder for integration with an external payment gateway
    return {
        "transaction_id": "txn_12345",
        "status": "success",
        "amount": payment_data.get("amount", 0),
    }


def refund_payment(transaction_id: str) -> Dict:
    return {"transaction_id": transaction_id, "status": "refunded"}
