# Specification

## Summary
**Goal:** Allow authenticated non-admin users to view their own submitted feedback entries by adding a caller-scoped feedback retrieval endpoint and updating the frontend to use it.

**Planned changes:**
- Add a backend query method (e.g., `getCallerFeedback`) that returns only feedback entries belonging to the signed-in caller, rejecting unauthenticated callers.
- Keep the existing admin-only `getAllFeedback` behavior unchanged and still restricted to admins.
- Update `frontend/src/hooks/useFeedback.ts` to use the caller-scoped backend method for the feedback query so `/feedback` works for regular users and refreshes after submission via React Query invalidation.

**User-visible outcome:** Signed-in non-admin users can open `/feedback` and see their own past feedback entries (if any) without authorization errors, and the list updates after they submit new feedback.
