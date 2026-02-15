export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validatePhoto(file: File | null): string | null {
  if (!file) return null;

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, or WebP)';
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return null;
}

export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
  if (value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
}
