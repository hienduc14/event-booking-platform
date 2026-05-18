from sqlalchemy.orm import Session


def create_refund_requests_for_event(db: Session, event_id: int, reason: str):
    from app.crud.booking import get_paid_bookings_by_event
    paid_bookings = get_paid_bookings_by_event(db, event_id)

    for booking in paid_bookings:
        booking.payment_status = "Refunding"
        for detail in booking.booking_details:
            for ticket in detail.e_tickets:
                ticket.ticket_status = "Refunded"

    db.commit()


def process_pending_refunds(db: Session):
    """schema.sql has no refund_transactions table; complete queued refunds on bookings."""
    from app.models.booking import Booking

    bookings = db.query(Booking).filter(Booking.payment_status == "Refunding").all()

    for booking in bookings:
        booking.payment_status = "Refunded"

    if bookings:
        db.commit()
    return len(bookings)
