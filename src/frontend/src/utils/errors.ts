export function getUserFriendlyError(error: unknown): string {
  if (typeof error === "string") {
    // Check for common backend error patterns
    if (error.includes("Unauthorized")) {
      if (error.includes("Only the creator")) {
        return "You can only update items that you created";
      }
      if (error.includes("Only users can submit feedback")) {
        return "You must be signed in to submit feedback";
      }
      if (error.includes("Only users")) {
        return "You must be signed in to perform this action";
      }
      if (error.includes("Only conversation participants")) {
        return "You can only view conversations you are part of";
      }
      if (error.includes("Only admins")) {
        return "You do not have permission to access this resource";
      }
      return "You do not have permission to perform this action";
    }
    if (error.includes("not found")) {
      return "The requested item could not be found";
    }
    if (error.includes("Cannot create conversation with yourself")) {
      return "You cannot start a conversation with yourself";
    }
    return error;
  }

  if (error instanceof Error) {
    return getUserFriendlyError(error.message);
  }

  return "An unexpected error occurred. Please try again.";
}
