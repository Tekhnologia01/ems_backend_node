import otpGenerator from "otp-generator";

export function generateOTP() {
  return otpGenerator.generate(4, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
}
