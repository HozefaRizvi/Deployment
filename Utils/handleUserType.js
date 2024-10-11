const validateSignupData = (userType, data) => {
  const { email, password, firstName, lastName, companyName, address, city, postCode, VATNumber, isNextGearCustomer } = data;

  let errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push('Email format is invalid');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } 

  // Trader-specific validations
  if (userType === 'trader') {
    if (!firstName) errors.push('First Name is required for traders');
    if (!lastName) errors.push('Last Name is required for traders');
    if (!companyName) errors.push('Company Name is required for traders');
    if (!address) errors.push('Address is required for traders');
    if (!city) errors.push('City is required for traders');

    // Postcode validation (optional: you can specify a regex pattern based on your region)
    if (!postCode) errors.push('Postcode is required for traders');
    
    // VAT Number validation (optional)
    if (!VATNumber) errors.push('VAT Number is required for traders');

    // NextGear customer validation
    if (typeof isNextGearCustomer !== 'boolean') {
      errors.push('Are you a NextGear customer? Yes or No is required');
    }
  }

  return errors;
};

module.exports = { validateSignupData };
