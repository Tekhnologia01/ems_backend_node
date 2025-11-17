export const mapGoogleProfile = (profile) => {
  return {
    user_name: profile.displayName,
    user_email: profile.emails?.[0]?.value,
    user_photo_path: profile.photos?.[0]?.value
  };
};