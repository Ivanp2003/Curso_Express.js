function isValidEmail(email) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
}

function isValidName(name) {
  return typeof name === 'string' && name.length >= 3;
}

function isUniqueNumericId(id, users, userId) {
  userIdSome = users.some(user => user.id === id);
  return typeof id === 'number' && (!userIdSome || (userIdSome && id === userId));
}

function validateUser(user, users, userId) {
  const { name, email, id } = user;
  if ( !name ) {
    return { isValid: false, error: 'Missing required field: name' };
  }
  if ( !isValidName(name) ) {
    return {
      isValid: false,
      error: 'User name must be at least 3 characters long and contain only letters'
    };
  }
  if ( !email ) {
    return { isValid: false, error: 'Missing required field: email' };
  }
  if ( !isValidEmail(email) ) {
    return { isValid: false, error: 'Invalid email format' };
  }
  if ( id && !isUniqueNumericId(id, users, userId) ) {
    return { isValid: false, error: 'User id must be unique' };
  }
  return { isValid: true };
}

module.exports = {
  isValidEmail,
  isValidName,
  isUniqueNumericId,
  validateUser
};