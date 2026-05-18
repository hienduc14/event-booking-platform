from sqlalchemy.orm import Session
from typing import List
from app.models.booking import Booking
from app.models.e_ticket import ETicket
from app.crud.refund import create_refund_transaction
from app.models.refund_transaction import RefundTransaction


def create_refund_requests_for_event(db: Session, event_id: int, reason: str):
    from app.crud.booking import get_paid_bookings_by_event
    paid_bookings = get_paid_bookings_by_event(db, event_id)
    
    for booking in paid_bookings:
        booking.booking_status = "REFUNDING"
        create_refund_transaction(
            db=db,
            booking_id=booking.booking_id,
            amount=booking.total_amount,
            reason=reason
        )
        
        # Mark tickets as REFUNDED
        for detail in booking.booking_details:
            for ticket in detail.e_tickets:
                ticket.ticket_status = "REFUNDED"
                
    db.commit()


def process_pending_refunds(db: Session):
    """Called by background worker to process refunds (mock gateway)"""
    from app.crud.refund import get_pending_refunds
    refunds = get_pending_refunds(db)
    
    for refund in refunds:
        refund.status = "PROCESSING"
        db.commit()
        
        # MOCK PAYMENT GATEWAY REFUND CALL
        # In reality, this would call VNPay/Stripe APIs
        success = True  # Mocked success
        
        if success:
            refund.status = "SUCCESS"
            refund.booking.booking_status = "REFUNDED"
        else:
            refund.status = "FAILED"
            refund.booking.booking_status = "REFUND_FAILED"
            
    if refunds:
        db.commit()
    return len(refunds)
