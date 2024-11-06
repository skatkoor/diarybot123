# DiaryBot Microservices Architecture

## Services Overview

1. **API Gateway** (Port 3000)
   - Entry point for all client requests
   - Routes requests to appropriate services
   - Location: `/services/gateway`

2. **Auth Service** (Port 3001)
   - Handles user authentication and authorization
   - Manages user sessions
   - Location: `/services/auth`

3. **Diary Service** (Port 3002)
   - Manages diary entries
   - Handles mood tracking
   - Location: `/services/diary`

4. **Notes Service** (Port 3003)
   - Manages flashcards and notes
   - Handles hierarchical structure
   - Location: `/services/notes`

5. **Todo Service** (Port 3004)
   - Manages todo items
   - Handles task completion
   - Location: `/services/todo`

6. **Finance Service** (Port 3005)
   - Handles transactions
   - Manages accounts
   - Location: `/services/finance`

7. **AI Assistant Service** (Port 3006)
   - Handles AI interactions
   - Natural language processing
   - Location: `/services/ai`

8. **Search Service** (Port 3007)
   - Indexes content from all services
   - Handles cross-service search
   - Location: `/services/search`

## Shared Resources

- Common utilities: `/services/shared`
- Database schemas: `/services/shared/schemas`
- Types: `/services/shared/types`
- Middleware: `/services/shared/middleware`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in required values

3. Start all services:
   ```bash
   npm run start:all
   ```

4. Start individual service:
   ```bash
   npm run start:auth    # Start auth service
   npm run start:diary   # Start diary service
   # etc...
   ```