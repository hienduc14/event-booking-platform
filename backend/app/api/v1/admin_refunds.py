from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.services.refund_service import process_pending_refunds

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.get("/pending")
def get_all_pending_refunds(db: Session = Depends(get_db)):
    """schema.sql has no refund_transactions table, so pending refunds are not stored separately."""
    return []

@router.post("/process-all")
def trigger_process_all_refunds(db: Session = Depends(get_db)):
    """Manually trigger the refund processing worker task."""
    processed_count = process_pending_refunds(db)
    return {"message": f"Processed {processed_count} refunds."}
