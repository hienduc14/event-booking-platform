from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.database import SessionLocal
from app.services.reservation_service import cancel_expired_reservations
from app.services.refund_service import process_pending_refunds


def job_cancel_expired_reservations():
    db = SessionLocal()
    try:
        count = cancel_expired_reservations(db)
        if count > 0:
            print(f"[WORKER] Cancelled {count} expired reservations.")
    except Exception as e:
        print(f"[WORKER ERROR] job_cancel_expired_reservations: {e}")
    finally:
        db.close()


def job_process_refunds():
    db = SessionLocal()
    try:
        count = process_pending_refunds(db)
        if count > 0:
            print(f"[WORKER] Processed {count} pending refunds.")
    except Exception as e:
        print(f"[WORKER ERROR] job_process_refunds: {e}")
    finally:
        db.close()


scheduler = BackgroundScheduler()

def start_scheduler():
    # Run every 1 minute
    scheduler.add_job(
        func=job_cancel_expired_reservations,
        trigger=IntervalTrigger(minutes=1),
        id='cancel_expired_reservations_job',
        name='Cancel expired reservations',
        replace_existing=True,
    )
    
    # Run every 5 minutes
    scheduler.add_job(
        func=job_process_refunds,
        trigger=IntervalTrigger(minutes=5),
        id='process_refunds_job',
        name='Process pending refunds',
        replace_existing=True,
    )
    
    scheduler.start()
    print("[WORKER] Background scheduler started.")


def stop_scheduler():
    scheduler.shutdown()
    print("[WORKER] Background scheduler stopped.")
