from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.refund import RefundRead
from app.crud.refund import get_pending_refunds
from app.services.refund_service import process_pending_refunds

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.get("/pending", response_model=List[RefundRead])
def get_all_pending_refunds(db: Session = Depends(get_db)):
    """List all refunds that have not been processed yet."""
    return get_pending_refunds(db)

@router.post("/process-all")
def trigger_process_all_refunds(db: Session = Depends(get_db)):
    """Manually trigger the refund processing worker task."""
    processed_count = process_pending_refunds(db)
    return {"message": f"Processed {processed_count} refunds."}
