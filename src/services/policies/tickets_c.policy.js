const admin = (user) => user?.profile === 'Admin_c';
const owned = (record, user) => String(record.Owner?.Id ?? record.Owner) === String(user?.Id);

export const select = (record, user) => {
  if (!user) return false;
  return admin(user) || owned(record, user);
};

export const insert = (record, user) => {
  if (!user) return false;
  return user.profile === 'Admin_c' || user.profile === 'Customer_c';
};

export const update = (record, user) => {
  if (!user) return false;
  return admin(user) || owned(record, user);
};

export const remove = (record, user) => {
  if (!user) return false;
  return admin(user) || owned(record, user);
};
