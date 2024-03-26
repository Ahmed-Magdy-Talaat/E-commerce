export const checkOrderStatus = (paymentMethod) => {
  let orderStatus = "Pending";
  if (paymentMethod === "Cash") orderStatus = "Placed";
  return orderStatus;
};
