/**
 * Builds initials from first and last name for use as a profile avatar.
 * e.g. "Barongo" + "Academy" → "BA"
 */
export const getInitials = (firstName = '', lastName = '') => {
  const first = String(firstName || '').trim().charAt(0)
  const last = String(lastName || '').trim().charAt(0)
  const initials = `${first}${last}`.toUpperCase()
  return initials || 'U'
}
