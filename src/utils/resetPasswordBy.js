export const resetPasswordBy = ({ userMobileNo, userEmail }) => {
  if (userMobileNo) {
    const cleanedMobile = String(userMobileNo).replace(/^\+91/, "").trim();
    return {
      key: cleanedMobile,
      target: `+91${cleanedMobile}`,
      type: "mobile",
      isValid: /^[6-9]\d{9}$/.test(cleanedMobile),
    };
  }

  if (userEmail) {
    const cleanedEmail = userEmail.trim().toLowerCase();
    return {
      key: cleanedEmail,
      target: cleanedEmail,
      type: "email",
      isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail),
    };
  }

  return {
    key: null,
    target: null,
    type: null,
    isValid: false,
  };
};
