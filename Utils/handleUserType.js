
const validateSignupData = (userType, data) => {
    const { email, password, firstName, lastName, companyName, address, city, postCode, VATNumber, isNextGearCustomer } = data;
    
    let errors = [];
    
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    
    if (userType === 'trader') {
      if (!firstName) errors.push('First Name is required for traders');
      if (!lastName) errors.push('Last Name is required for traders');
      if (!companyName) errors.push('Company Name is required for traders');
      if (!address) errors.push('Address is required for traders');
      if (!postCode) errors.push('Postcode is required for traders');
      if (!city) errors.push('City is required for traders');
      if (!VATNumber) errors.push('VAT Number is required for traders');
      if (typeof isNextGearCustomer !== 'boolean') errors.push('Are you a NextGear customer? Yes or No is required');
    }
  
    return errors;
  };

  module.exports = { validateSignupData };