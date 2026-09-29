# SupportCRM

A full-stack AI-powered customer support ticket management system built with **React, FastAPI, SQLite, SQLAlchemy, and Google Gemini**.

SupportCRM allows support teams to create, manage, search, filter, and update customer tickets while using AI to analyze support issues and generate suggested customer responses.

## Features

###  Ticket Management

* Create new support tickets
* View all support tickets
* Search tickets by customer name, email, ticket ID, or description
* Filter tickets by status
* View individual ticket details
* Update ticket status
* Add internal support notes

###  Dashboard

* Total ticket count
* Open ticket count
* In Progress ticket count
* Closed ticket count
* Ticket distribution
* Recent tickets
* Quick actions
* Automation activity logs

###  AI-Powered Support

* Analyze support tickets using Google Gemini
* Automatically identify:

  * Category
  * Priority
  * Sentiment
  * Summary
  * Recommended action
* Generate AI-assisted customer replies
* Copy generated replies for use by support agents

###  Automation & Webhooks

* Automatically triggers a webhook when a ticket is created
* Records automation events in the database
* Displays automation activity on the dashboard

## Tech Stack

### Frontend

* React
* React Router
* Vite
* JavaScript
* CSS

### Backend

* FastAPI
* Python
* SQLAlchemy
* Pydantic
* SQLite

### AI

* Google Gemini API
* `google-genai`

### Automation

* REST API
* Webhooks
* Automation logging

## Project Structure

```text
support-crm/
│
├── backend/
│   ├── venv/
│   ├── .env
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│   ├── schemas.py
│   └── support_crm.db
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Loading.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── TicketCard.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   └── TicketDetails.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## Application Flow

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   localhost:5173    │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    │   localhost:8000    │
                    └───────┬───────┬─────┘
                            │       │
                  ┌─────────┘       └──────────┐
                  ▼                            ▼
        ┌─────────────────┐          ┌─────────────────┐
        │ SQLite Database │          │  Google Gemini  │
        │   SQLAlchemy    │          │       AI        │
        └─────────────────┘          └─────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ Webhook /       │
        │ Automation Logs │
        └─────────────────┘
```

## API Endpoints

### Tickets

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| POST   | `/api/tickets`             | Create a ticket                 |
| GET    | `/api/tickets`             | List, search and filter tickets |
| GET    | `/api/tickets/{ticket_id}` | Get ticket details              |
| PUT    | `/api/tickets/{ticket_id}` | Update ticket status/notes      |

### AI

| Method | Endpoint                           | Description                   |
| ------ | ---------------------------------- | ----------------------------- |
| POST   | `/api/tickets/{ticket_id}/analyze` | Analyze a ticket using Gemini |
| POST   | `/api/tickets/{ticket_id}/reply`   | Generate an AI customer reply |

### Automation

| Method | Endpoint               | Description                       |
| ------ | ---------------------- | --------------------------------- |
| POST   | `/api/webhooks/ticket` | Receive ticket automation webhook |
| GET    | `/api/automation-logs` | View automation activity          |

## Ticket Statuses

SupportCRM currently supports three ticket statuses:

* **Open** — New or unresolved support request
* **In Progress** — Ticket is currently being handled
* **Closed** — Issue has been resolved

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd support-crm
```

### 2. Backend Setup

Open a terminal and navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit the `.env` file to GitHub.

### 4. Start the Backend

From the `backend` directory:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

## AI Configuration

The application uses the Google Gemini API for ticket analysis and customer reply generation.

The API key is loaded from the backend `.env` file and should never be committed to source control.

The application currently uses:

```text
gemini-3.5-flash-lite
```

## Example AI Analysis

For a ticket describing a payment problem, the AI can provide information such as:

```text
Category: Billing
Priority: High
Sentiment: Negative

Summary:
Customer is unable to complete a payment.

Recommended Action:
Verify the customer's payment status and investigate the transaction.
```

The exact AI output may vary depending on the ticket description.

## Webhook Automation

When a new ticket is created, SupportCRM sends a webhook event containing information such as:

```json
{
  "event": "ticket.created",
  "ticket_id": "TKT-001",
  "customer_name": "Example Customer",
  "subject": "Payment issue",
  "status": "Open"
}
```

The webhook is processed by the backend and an automation log is stored in the SQLite database.

The dashboard displays these automation events under **Automation Activity**.

## Error Handling

The application includes basic error handling for:

* Failed API requests
* Invalid ticket data
* AI generation failures
* Ticket update failures
* Webhook failures
* Empty search results

## Security Notes

* API credentials are stored in `.env`
* `.env` is excluded through `.gitignore`
* Virtual environments and dependency folders are excluded from source control
* The Gemini API key should never be exposed in frontend code

## Future Improvements

Possible future enhancements include:

* Authentication and role-based access
* Email notifications
* Agent assignment
* Ticket priority filtering
* Pagination
* Production deployment
* External automation platforms such as n8n
* Customer-facing ticket portal
* Advanced analytics

## Project Purpose

SupportCRM was developed as a practical full-stack project demonstrating:

* REST API development
* Frontend and backend integration
* Database management
* AI API integration
* AI-assisted customer support
* Webhook-based automation
* Dashboard development
* Error handling
* Responsive UI design

The project demonstrates an end-to-end workflow from **customer issue creation → ticket management → AI analysis → suggested response → automation logging**.
