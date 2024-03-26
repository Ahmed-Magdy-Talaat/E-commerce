import couponUserModel from "../../DB/models/coupon-user.model.js";
import couponModel from "../../DB/models/coupon.model.js";

export const applyCoupon = async (finalPrice, couponData, user, next) => {
  console.log("hy");
  let totalPrice = finalPrice;
  //destruct coupon and the item couponUser from coupon-user model
  console.log(couponData);
  let { coupon } = couponData;

  let couponUser = couponData.couponUser;
  if (!couponData.couponUser) {
    // check if there is no item found in coupon-couponUserModel
    couponUser = await couponUserModel.create({
      userId: user._id,
      couponId: coupon._id,
      usedCouponsByUser: 0,
    });
  }
  // check for the discountType of the coupon and calculate final price
  if (coupon.discountType === "fixed" && coupon.discountValue <= totalPrice) {
    finalPrice -= coupon.discountValue;
  } else if (coupon.discountType === "percentage") {
    finalPrice -= (coupon.discountValue * totalPrice) / 100;
  } else {
    return next(new Error("You can't use this Coupon LOL", { cause: 400 }));
  }
  couponUser.usedCouponsByUser++;
  coupon.usedCoupons++;
  await couponUser.save();
  await coupon.save();

  return finalPrice;
};

export const checkCouponValidation = async (couponCode, user, next) => {
  const coupon = await couponModel.findOne({ code: couponCode });
  if (!coupon)
    return next(new Error("this coupon is not found", { cause: 404 }));

  let usedCouponsByUser = 0;
  const couponUser = await couponUserModel.findOne({
    couponId: coupon._id,
    userId: user._id,
  });

  if (couponUser) usedCouponsByUser = couponUser.usedCouponsByUser;
  console.log("hey", couponUser);
  //check if the coupon is valid or not
  if (new Date(coupon.endDate) < new Date())
    return next(new Error("This Coupon has been expired1", { cause: 404 }));

  //check if the coupons are all  used or the user
  // has  reached his limit of uses for this coupon
  if (
    coupon.usedCoupons >= coupon.couponsNo ||
    usedCouponsByUser >= coupon.usageLimit
  )
    return next(new Error("This coupon is not valid2", { cause: 404 }));

  //return coupon and couponUser if found
  return { coupon, couponUser };
};
