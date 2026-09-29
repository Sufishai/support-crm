from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_  # type: ignore[reportMissingImports]
from typing import Any
import requests
import models
import schemas

from database import engine, get_db, Base

# AI SETUP

import os
import json
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing in .env")

client = genai.Client(api_key=GEMINI_API_KEY)


# DATABASE
Base.metadata.create_all(bind=engine)

# webhook URL
WEBHOOK_URL = "http://127.0.0.1:8000/api/webhooks/ticket"

# FASTAPI
app = FastAPI(
    title="Support CRM API",
    description="Customer Support Ticketing CRM",
    version="1.0.0"
)

# CORS configuration

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# HOME

@app.get("/")
def root():
    return {
        "message": "Support CRM API is running"
    }


# CREATE TICKET

@app.post("/api/webhooks/ticket")
def ticket_webhook(
    payload: schemas.TicketWebhook,
    db: Any = Depends(get_db)
):

    data = payload.model_dump()

    print("Webhook received:")
    print(data)

    automation_log = models.AutomationLog(
        event=payload.event,
        ticket_id=payload.ticket_id,
        message=f"Automation triggered for ticket {payload.ticket_id}"
    )

    db.add(automation_log)
    db.commit()

    return {
        "success": True,
        "message": "Ticket webhook received and automation logged",
        "data": data
    }
# CREATE TICKET

@app.post("/api/tickets", response_model=dict)
def create_ticket(
    ticket: schemas.TicketCreate,
    db: Any = Depends(get_db)
):

    ticket_count = db.query(models.Ticket).count()

    ticket_id = f"TKT-{ticket_count + 1:03d}"

    new_ticket = models.Ticket(
        ticket_id=ticket_id,
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status="Open"
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    # AUTOMATION WEBHOOK
    
    webhook_data = {
        "event": "ticket.created",
        "ticket_id": new_ticket.ticket_id,
        "customer_name": new_ticket.customer_name,
        "subject": new_ticket.subject,
        "status": new_ticket.status
    }

    try:
        requests.post(
            WEBHOOK_URL,
            json=webhook_data,
            timeout=5
        )

        print("Ticket automation webhook triggered successfully.")

    except Exception as e:
        print("Webhook failed:", e)

    return {
        "ticket_id": new_ticket.ticket_id,
        "created_at": new_ticket.created_at
    }


# LIST / SEARCH / FILTER


@app.get("/api/tickets")
def get_tickets(
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Any = Depends(get_db)
):
    query = db.query(models.Ticket)

    # Status filter
    if status:
        query = query.filter(
            models.Ticket.status == status
        )

    # Search
    if search:
        search_term = f"%{search}%"

        query = query.filter(
            or_(
                models.Ticket.ticket_id.ilike(search_term),
                models.Ticket.customer_name.ilike(search_term),
                models.Ticket.customer_email.ilike(search_term),
                models.Ticket.description.ilike(search_term)
            )
        )

    tickets = query.order_by(
        models.Ticket.created_at.desc()
    ).all()

    return [
        {
            "ticket_id": ticket.ticket_id,
            "customer_name": ticket.customer_name,
            "subject": ticket.subject,
            "status": ticket.status,
            "created_at": ticket.created_at
        }
        for ticket in tickets
    ]


# GET one ticket

@app.get("/api/tickets/{ticket_id}")
def get_ticket(
    ticket_id: str,
    db: Any = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.ticket_id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return {
        "ticket_id": ticket.ticket_id,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "created_at": ticket.created_at,
        "notes": [
            {
                "id": note.id,
                "note_text": note.note_text,
                "created_at": note.created_at
            }
            for note in ticket.notes
        ]
    }

#update tickets


@app.put("/api/tickets/{ticket_id}")
def update_ticket(
    ticket_id: str,
    update_data: schemas.TicketUpdate,
    db: Any = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.ticket_id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    # Update status
    if update_data.status:
        allowed_statuses = [
            "Open",
            "In Progress",
            "Closed"
        ]

        if update_data.status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid status"
            )

        ticket.status = update_data.status

    # Add note
    if update_data.notes:
        new_note = models.Note(
            ticket_id=ticket.ticket_id,
            note_text=update_data.notes
        )

        db.add(new_note)

    # Save changes
    db.commit()
    db.refresh(ticket)

    return {
        "success": True,
        "updated_at": ticket.updated_at
    }

# AI TICKET ANALYSIS

@app.post("/api/tickets/{ticket_id}/analyze")
def analyze_ticket(
    ticket_id: str,
    db: Any = Depends(get_db)
):
    # Find ticket
    ticket = db.query(models.Ticket).filter(
        models.Ticket.ticket_id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    # AI prompt
    prompt = f"""
You are an AI customer support assistant.

Analyze the following support ticket.

Ticket ID: {ticket.ticket_id}
Customer: {ticket.customer_name}
Subject: {ticket.subject}
Description: {ticket.description}
Current Status: {ticket.status}

Return a JSON object with exactly these fields:

{{
    "category": "one of: Technical, Billing, Account, Payment, Delivery, Product, General",
    "priority": "one of: Low, Medium, High, Critical",
    "sentiment": "one of: Positive, Neutral, Frustrated, Angry, Urgent",
    "summary": "A short summary of the customer's issue",
    "recommended_action": "The recommended next action for the support agent"
}}

Do not include markdown.
Return only valid JSON.
"""

    # Working Gemini model
    response = None
    last_error = None

    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=prompt,
                config={
                    "response_mime_type": "application/json"
                }
            )

            if response and response.text:
                break

        except Exception as e:
            last_error = e
            time.sleep(2)

    # If AI failed
    if not response or not response.text:
        raise HTTPException(
            status_code=503,
            detail=f"AI service temporarily unavailable: {last_error}"
        )

    # Parse AI response
    try:
        result = json.loads(response.text)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="AI returned an invalid JSON response"
        )

    # Return analysis
    return {
        "success": True,
        "ticket_id": ticket.ticket_id,
        "analysis": result
    }


# AI suggested customer reply

@app.post("/api/tickets/{ticket_id}/reply")
def generate_ai_reply(
    ticket_id: str,
    db: Any = Depends(get_db)
):
    # Find ticket
    ticket = db.query(models.Ticket).filter(
        models.Ticket.ticket_id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    # Prompt Gemini
    prompt = f"""
You are a professional customer support agent.

Write a helpful and professional reply to the customer
based on the support ticket below.

Ticket ID: {ticket.ticket_id}
Customer Name: {ticket.customer_name}
Subject: {ticket.subject}
Description: {ticket.description}
Current Status: {ticket.status}

Requirements:
- Address the customer politely.
- Acknowledge their issue.
- Clearly explain the next step.
- Be concise and professional.
- Do not invent refunds, discounts, timelines, or actions
  that are not supported by the ticket.
- Do not mention that AI was used.
- Do not use markdown.
- Return only the customer-facing reply.
"""

    models_to_try = [
        "gemini-3.5-flash-lite"
    ]

    response = None
    last_error = None

    for model_name in models_to_try:

        for attempt in range(2):

            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )

                if response and response.text:
                    break

            except Exception as e:
                last_error = e
                time.sleep(2)

        if response and response.text:
            break

    # AI unavailable
    if not response or not response.text:
        raise HTTPException(
            status_code=503,
            detail=f"AI service temporarily unavailable: {last_error}"
        )

    return {
        "success": True,
        "ticket_id": ticket.ticket_id,
        "suggested_reply": response.text.strip()
    }

# webhook endpoint for ticket updates
@app.get("/api/automation-logs")
def get_automation_logs(
    db: Any = Depends(get_db)
):
    logs = (
        db.query(models.AutomationLog)
        .order_by(models.AutomationLog.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": log.id,
            "event": log.event,
            "ticket_id": log.ticket_id,
            "message": log.message,
            "created_at": log.created_at
        }
        for log in logs
    ]

