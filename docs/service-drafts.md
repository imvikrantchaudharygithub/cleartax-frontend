# Service Drafts (Frontend)

## Overview
The Add Service stepper now supports hybrid drafts:
- **Server drafts** via draft endpoints.
- **Local fallback** in `localStorage` for quick recovery.

Drafts are loaded on modal open and can be resumed later.

## Where It Lives
- Modal: `app/components/admin/AddServiceModal.tsx`
- API client: `app/lib/api/services/service.service.ts`
- Types: `app/lib/api/types.ts`

## Draft Lifecycle
1. Open “Add New Service”
2. If a draft exists, prompt to resume
3. Autosave on change (debounced) and on step change
4. On submit, publish the draft
5. Clear local draft on success

## API Usage
The frontend uses these endpoints via `serviceService`:
- `POST /services/draft` → create draft
- `PUT /services/draft/:id` → update draft
- `GET /services/drafts?category=<slug>` → list drafts
- `GET /services/draft/:id` → load draft
- `POST /services/publish/:id` → publish draft

## Local Storage
Key format:
```
service-draft:<categorySlug>
```

Payload format:
```json
{
  "draftId": "<backendId>",
  "values": { /* formik values */ },
  "currentStep": 2,
  "updatedAt": "2026-01-24T12:00:00.000Z"
}
```

## Autosave Behavior
- Debounced save (~2s) on form value changes
- Save on step change (Next/Previous)
- Draft meta stored with `completionStep` and `lastSavedAt`

## Publish Behavior
When user submits the final step:
1. Ensure a draft exists (create if needed)
2. Publish draft via `/services/publish/:id`
3. Clear local draft

## Notes
- Drafts are disabled when editing an existing service (edit flow uses update endpoint).
- Category mapping uses slug conversion before saving drafts.
