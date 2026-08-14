# AWS Route 53 Mini Clone

A full-stack web application replicating the core functionality and user experience of the **Amazon Web Services (AWS) Route 53** DNS management console.

Built with a **FastAPI** backend, **SQLAlchemy 2.x** with SQLite persistence, and a **Next.js (App Router)** frontend styled with enterprise AWS console aesthetics.

---

## Architecture & System Overview

```
AWS Route 53 Mini Clone
├── backend/                # Layered FastAPI backend (Python 3.11+)
│   ├── app/
│   │   ├── core/           # Config, environment settings, session auth
│   │   ├── db/             # SQLAlchemy engine, SQLite models & sessionmaker
│   │   ├── routers/        # Auth, Hosted Zones, and DNS Records API endpoints
│   │   ├── schemas/        # Pydantic v2 validation and serialization models
│   │   └── services/       # DNS validation, Zone service, Record service
│
└── frontend/               # Next.js 16 App Router & TypeScript (React 19)
    ├── app/                # App Router pages (/login, /hosted-zones, /hosted-zones/[zoneId], etc.)
    ├── components/         # AWS-styled components (TopNav, Sidebar, RecordsTable, DnsRecordDialog, etc.)
    └── lib/                # API client (lib/api/*), types, AuthContext
```

### Layered Backend Design
- **Routers**: Handle HTTP request routing, cookie validation, status codes, query parsing, and response serialization.
- **Services**: Encapsulate all business logic:
  - `hosted_zone_service.py`: Atomic transactional creation of hosted zones and deterministic mock `NS` (4 nameservers) and `SOA` system records.
  - `record_service.py`: Record lifecycle management, CNAME exclusivity enforcement, duplicate simple-routing protection, and protection of system records.
  - `dns_validation.py`: Strict RFC validation rules for domain names, wildcards, apex normalization, and type-specific DNS formats.
- **Database / ORM**: SQLAlchemy 2.0 with SQLite foreign keys enabled and cascade deletion (`HostedZone -> DNSRecord`).

### Frontend Console Design
- **AWS Console Styling**: Designed to emulate the AWS Management Console with high information density, neutral backgrounds (`#f2f3f3`), crisp subtle borders, dark top navigation bar (`#232f3e`), and signature AWS orange CTA accents (`#ec7211`).
- **State via URL Query Params**: Search queries (debounced by 300ms), type filters, and pagination are synced with URL parameters (`/hosted-zones/1?search=api&type=A&page=1`).
- **Contextual AWS Toolbar**:
  - `0 selected`: Edit and Delete disabled.
  - `1 selected`: Edit and Delete enabled (disabled if system `NS`/`SOA` record).
  - `> 1 selected`: Edit and Delete disabled (bulk operations prevented).

---

## Tech Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **ORM & Database**: SQLAlchemy 2.0, SQLite
- **Validation**: Pydantic v2 & `pydantic-settings`
- **Security & Session**: `itsdangerous` URLSafeTimedSerializer (HTTP-only cookies)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Primitives**: Radix UI (Dialog, Dropdown Menu, Select, Checkbox, Label)
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Sonner

---

## Database Schema

```
┌────────────────────────────────────────┐       ┌────────────────────────────────────────────────────────┐
│              hosted_zones              │       │                      dns_records                       │
├────────────────────────────────────────┤       ├────────────────────────────────────────────────────────┤
│ id: INTEGER (PK, autoincrement)        │◄──┐   │ id: INTEGER (PK, autoincrement)                        │
│ name: VARCHAR(255) (UNIQUE, indexed)   │   └───┤ hosted_zone_id: INTEGER (FK -> hosted_zones.id)       │
│ comment: VARCHAR(500) (nullable)       │       │ name: VARCHAR(255) (indexed)                           │
│ created_at: DATETIME (UTC)             │       │ type: VARCHAR(10) (A, AAAA, CNAME, TXT, MX, etc.)      │
│ updated_at: DATETIME (UTC)             │       │ values: JSON (Array of string values)                  │
└────────────────────────────────────────┘       │ ttl: INTEGER (positive seconds)                        │
                                                 │ routing_policy: VARCHAR(50) (default: SIMPLE)          │
                                                 │ is_system_record: BOOLEAN (default: False)             │
                                                 │ created_at: DATETIME (UTC)                             │
                                                 │ updated_at: DATETIME (UTC)                             │
                                                 └────────────────────────────────────────────────────────┘
```

---

## Supported DNS Record Types & Validation Rules

| Type | Format / Example | Validation Rules |
| :--- | :--- | :--- |
| **A** | `192.0.2.1` | Every value must be a valid IPv4 address. |
| **AAAA** | `2001:0db8:85a3::8a2e:0370:7334` | Every value must be a valid IPv6 address. |
| **CNAME** | `target.example.org` | Exactly 1 value; valid hostname (cannot be IP); rejected at zone apex; cannot coexist with other records. |
| **TXT** | `v=spf1 include:_spf.google.com ~all` | Non-empty text strings up to 4000 characters per value. |
| **MX** | `10 mail.example.com` | Format: `<priority: 0-65535> <valid hostname>`. |
| **NS** | `ns1.example.com` | Each value must be a valid domain hostname. |
| **PTR** | `host.example.com` | Each value must be a valid domain hostname. |
| **SRV** | `10 5 443 api.example.com` | Format: `<priority> <weight> <port: 0-65535> <target hostname>`. |
| **CAA** | `0 issue "letsencrypt.org"` | Format: `<flags: 0-255> <tag> "<value>"`. |
| **SOA** | `ns1.awsdns.org. hostmaster.domain. 1 7200 900 1209600 86400` | System-generated authoritative zone record. |

---

## API Overview

### Authentication
- `POST /api/auth/login`: Accepts `username` and `password`, sets HTTP-only session cookie.
- `POST /api/auth/logout`: Clears session cookie (`204 No Content`).
- `GET /api/auth/me`: Returns current authenticated user profile.

### Hosted Zones
- `GET /api/hosted-zones?search=&page=1&limit=20`: List hosted zones with case-insensitive search and pagination.
- `POST /api/hosted-zones`: Creates zone and atomically generates default `NS` and `SOA` records (`201 Created`).
- `GET /api/hosted-zones/{zone_id}`: Retrieves zone details and record count.
- `PUT /api/hosted-zones/{zone_id}`: Updates zone comment (domain name cannot be modified).
- `DELETE /api/hosted-zones/{zone_id}`: Deletes zone and cascades to all records (`204 No Content`).

### DNS Records
- `GET /api/hosted-zones/{zone_id}/records?search=&type=&page=1&limit=20`: List records with type filtering and search.
- `POST /api/hosted-zones/{zone_id}/records`: Creates DNS record with RFC validation and conflict checking (`201 Created`).
- `GET /api/records/{record_id}`: Retrieves record by ID.
- `PUT /api/records/{record_id}`: Updates record values or TTL. System records cannot be modified (`400 Bad Request`).
- `DELETE /api/records/{record_id}`: Deletes user record. System records cannot be deleted (`400 Bad Request`).

---

## Local Setup & Running

### Prerequisites
- Python 3.11+
- Node.js 18+ / npm

### 1. Environment Configuration

Backend configuration:
```bash
# In backend/.env or configured defaults:
DATABASE_URL="sqlite:///./route53.db"
SECRET_KEY="supersecretkey-change-in-production-use-random-bytes"
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
MOCK_USER_USERNAME="admin"
MOCK_USER_PASSWORD="adminpassword123"
```

Frontend configuration:
```bash
# In frontend/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Run Backend
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Run Frontend
```bash
# Install frontend dependencies
cd frontend
npm install

# Start Next.js development server
npm run dev
```
Access the application at: [http://localhost:3000](http://localhost:3000)

### 4. Default Login Credentials
- **Username**: `admin`
- **Password**: `adminpassword123`

### 5. Frontend Production Build (Optional)
```bash
cd frontend
npm run build
```

---

## Features & Implementation Status

- [x] Mocked HTTP-only cookie session authentication (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`).
- [x] Hosted zones full lifecycle (Create, Search, Paginate, Update comment, Delete with cascade).
- [x] Automatic deterministic `NS` (4 nameservers) and `SOA` system records generation on zone creation.
- [x] Protection of system records (`NS` / `SOA` cannot be edited or deleted via UI or API).
- [x] Full RFC validation for 9 DNS record types (`A`, `AAAA`, `CNAME`, `TXT`, `MX`, `NS`, `PTR`, `SRV`, `CAA`).
- [x] Domain apex (`@` or empty string) and wildcard (`*.example.com`) normalization.
- [x] Simple-routing uniqueness check (`zone_id + name + type + routing_policy`).
- [x] CNAME single value rule and exclusivity check (no coexisting records at same name).
- [x] AWS Route 53 contextual toolbar (0 selected / 1 selected / >1 selected rules).
- [x] Multi-line textarea for DNS values (one value per line, no comma-separated inputs).
- [x] Debounced search (~300ms) and type filters synced to URL search parameters.
- [x] Polished "Coming Soon" sections for Dashboard, Traffic Policies, Health Checks, Resolver, and Profiles.

---

## Explicit Limitations & Non-Goals

As specified in the assignment requirements:
1. **No Live DNS Resolution**: The application does not spin up a DNS nameserver or resolve DNS queries over port 53 (UDP/TCP).
2. **Mocked Authentication**: Uses mocked single-user authentication with signed cookies instead of real AWS IAM/Cognito/OAuth.
3. **Routing Policies**: Currently only `Simple` routing policy is functional; advanced routing policies (Weighted, Geolocation, Latency, Failover) are placeholders.
4. **Health Checks & Alias Records**: Health check probes and Route 53 Alias targets (e.g. AWS CloudFront, S3, ALB) are not simulated.
