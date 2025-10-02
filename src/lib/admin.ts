const ADMIN_EMAILS = [
  'jeffby8@gmail.com',
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}