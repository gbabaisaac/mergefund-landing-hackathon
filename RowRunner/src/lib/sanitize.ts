export const sanitizeText = (input: string, maxLength = 300): string =>
  input.trim().replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').substring(0, maxLength);

export const sanitizeSeatField = (input: string): string =>
  input.trim().replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);

export const sanitizeEmail = (input: string): string =>
  input.trim().toLowerCase().substring(0, 254);

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidSeatField = (value: string): boolean =>
  /^[a-zA-Z0-9]{1,10}$/.test(value);

export const isValidPassword = (password: string): boolean =>
  password.length >= 8 && /\d/.test(password);
