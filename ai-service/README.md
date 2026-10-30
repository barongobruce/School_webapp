# AI Tutor service on Render

This folder contains the FastAPI service used by the SchoolWeb API. It provides chat and learning-material endpoints and requires a shared bearer token for those endpoints.

## Render service settings

Create one Python Web Service from the existing `barongobruce/School_webapp` repository:

- Name: `school-web-ai-tutor`
- Branch: `main`
- Root Directory: `ai-service`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn api_service:app --host 0.0.0.0 --port $PORT`
- Health Check Path: `/health`
- Region: Oregon, matching the existing SchoolWeb API

The service needs these Render environment variables:

- `OPENROUTER_API_KEY`: the OpenRouter key
- `AI_TUTOR_SERVICE_TOKEN`: a long random secret shared with the SchoolWeb API

Set these on the existing SchoolWeb API service as well:

- `AI_TUTOR_SERVICE_URL`: the new AI Tutor service's public `onrender.com` URL
- `AI_TUTOR_SERVICE_TOKEN`: the same secret used by the Python service

Do not commit either secret to GitHub or put them in a source file. The AI Tutor endpoints require the bearer token. The `/health` endpoint is public for Render health checks.

The existing SchoolWeb API is on Render Free. Free services cannot receive private-network requests, so the AI Tutor service must use a public Web Service URL for this setup. Free services can sleep after inactivity, so the first AI Tutor request after a quiet period may take longer.