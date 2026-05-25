from typing import List, Optional

from sqlalchemy.orm import Session, selectinload

from app.models.e_ticket import ETicket
from app.models.event import Event
from app.models.event_day import EventDay
from app.models.event_schedule import EventSchedule
from app.models.ticket_config import TicketConfig


def get_event_list(db: Session, skip: int = 0, limit: int = 100) -> List[Event]:
    return (
        db.query(Event)
        .filter(Event.status == "ACTIVE")
        .order_by(Event.event_id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_event_detail(db: Session, event_id: int) -> Optional[dict]:
    event = (
        db.query(Event)
        .options(
            selectinload(Event.schedules).selectinload(EventSchedule.venue),
            selectinload(Event.schedules).selectinload(EventSchedule.ticket_configs),
            selectinload(Event.schedules).selectinload(EventSchedule.event_days).selectinload(EventDay.e_tickets).selectinload(ETicket.ticket_config),
        )
        .filter(Event.event_id == event_id, Event.status == "ACTIVE")
        .first()
    )
    if not event:
        return None

    schedules = []
    for schedule in event.schedules:
        configs = []
        for config in schedule.ticket_configs:
            remaining = sum(
                1
                for day in schedule.event_days
                for ticket in day.e_tickets
                if ticket.ticket_config_id == config.config_id and ticket.ticket_status == "Available" and ticket.booking_id is None
            )
            configs.append(
                {
                    "config_id": config.config_id,
                    "schedule_id": config.schedule_id,
                    "ticket_type": config.ticket_type,
                    "price": config.price,
                    "max_quantity": config.max_quantity,
                    "remaining_quantity": remaining,
                }
            )

        days = []
        for day in sorted(schedule.event_days, key=lambda item: item.date):
            seats = [
                {
                    "ticket_id": ticket.ticket_id,
                    "ticket_config_id": ticket.ticket_config_id,
                    "ticket_status": ticket.ticket_status,
                    "row_label": ticket.row_label,
                    "col_number": ticket.col_number,
                    "ticket_type": ticket.ticket_type,
                    "price": ticket.price,
                }
                for ticket in sorted(day.e_tickets, key=lambda item: ((item.row_label or ""), item.col_number or 0))
            ]
            available_tickets = [ticket for ticket in seats if ticket["ticket_status"] == "Available"]
            days.append(
                {
                    "event_day_id": day.event_day_id,
                    "schedule_id": day.schedule_id,
                    "date": day.date,
                    "seats": seats,
                    "available_tickets": available_tickets,
                }
            )

        schedules.append(
            {
                "schedule_id": schedule.schedule_id,
                "event_id": schedule.event_id,
                "venue_id": schedule.venue_id,
                "registration_start": schedule.registration_start,
                "registration_end": schedule.registration_end,
                "seat_layout": schedule.seat_layout,
                "venue": schedule.venue,
                "ticket_configs": configs,
                "event_days": days,
            }
        )

    return {
        "event_id": event.event_id,
        "event_name": event.event_name,
        "description": event.description,
        "number_of_days": event.number_of_days,
        "banner_url": event.banner_url,
        "status": event.status,
        "created_at": event.created_at,
        "updated_at": event.updated_at,
        "schedules": schedules,
    }


def calculate_remaining_tickets(db: Session, schedule_id: int, event_day_id: int, config_id: int) -> int:
    remaining = (
        db.query(ETicket)
        .filter(
            ETicket.event_day_id == event_day_id,
            ETicket.ticket_config_id == config_id,
            ETicket.ticket_status == "Available",
            ETicket.booking_id.is_(None),
        )
        .count()
    )
    return max(0, remaining)
