/**
 * Builds initials from first and last name for use as a profile avatar.
 * e.g. "Ernest" + "Acheiver" → "EA"
 */
export const getInitials = (firstName = '', lastName = '') => {
  const first = String(firstName || '').trim().charAt(0)
  const last = String(lastName || '').trim().charAt(0)
  const initials = `${first}${last}`.toUpperCase()
  return initials || 'A'
}
