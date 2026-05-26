import Address from '../../models/address.model.js';

export const createAddressAction = async (userId, addressData) => {
  const address = await Address.create({
    ...addressData,
    user: userId,
  });
  return address;
};

export const getAddressesAction = async (userId) => {
  const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  return addresses;
};

export const deleteAddressAction = async (userId, addressId) => {
  await Address.findOneAndDelete({ _id: addressId, user: userId });
};
