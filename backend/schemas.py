from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str


class NoteResponse(BaseModel):
    id: int
    note_text: str
    created_at: datetime

    class Config:
        from_attributes = True


class TicketResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: datetime
    notes: List[NoteResponse] = []

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class TicketWebhook(BaseModel):
    event: str
    ticket_id: str
    customer_name: str
    subject: str
    status: str
