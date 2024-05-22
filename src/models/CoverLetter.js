class CoverLetter {
  constructor(
    yourName,
    yourAddress,
    city,
    state,
    zipCode,
    emailAddress,
    phoneNumber,
    companyName,
    companyAddress,
    companyCity,
    companyState,
    companyZipCode,
    position,
    skills,
    experience,
    values
  ) {
    this.yourName = yourName;
    this.yourAddress = yourAddress;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.emailAddress = emailAddress;
    this.phoneNumber = phoneNumber;
    this.companyName = companyName;
    this.companyAddress = companyAddress;
    this.companyCity = companyCity;
    this.companyState = companyState;
    this.companyZipCode = companyZipCode;
    this.position = position;
    this.skills = skills;
    this.experience = experience;
    this.values = values;
  }
}

module.exports = CoverLetter;
