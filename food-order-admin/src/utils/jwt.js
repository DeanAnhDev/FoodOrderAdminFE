/**
 * Decode JWT token without verification (for client-side use only)
 * @param {string} token - JWT token
 * @returns {object} Decoded payload
 */
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Extract user information from JWT token
 * @param {string} token - JWT token
 * @returns {object} User information
 */
export const extractUserFromToken = (token) => {
  const payload = decodeJWT(token)
  if (!payload) return null

  // Map JWT claims to user object
  const user = {
    id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
    email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    fullName:
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    exp: payload.exp,
    iat: payload.iat,
    jti: payload.jti,
  }

  return user
}

/**
 * Extract roles from JWT token
 * @param {string} token - JWT token
 * @returns {array} Array of roles
 */
export const extractRolesFromToken = (token) => {
  const payload = decodeJWT(token)
  if (!payload) return []

  const rolesClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

  // Handle both single role (string) and multiple roles (array)
  if (Array.isArray(rolesClaim)) {
    return rolesClaim
  } else if (typeof rolesClaim === 'string') {
    return [rolesClaim]
  }

  return []
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) return true

  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date
 */
export const getTokenExpiration = (token) => {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) return null

  return new Date(payload.exp * 1000)
}
