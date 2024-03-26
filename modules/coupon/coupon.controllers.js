import couponModel from "../../DB/models/coupon.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cron from "node-cron";

export const addCoupon = asyncHandler(async (req, res, next) => {
  const {
    code,
    discountType,
    discountValue,
    startDate,
    endDate,
    usageLimit,
    couponsNo,
  } = req.body;

  //check if the coupon code exists
  const isExist = await couponModel.findOne({ code });
  if (isExist)
    return next(new Error("Coupon code is already exists ", { cause: 409 }));

  //check for discountType
  if (discountType === "percentage" && discountValue > 100)
    return next(
      new Error("Discount precentage must be less than or equal 100% ", {
        cause: 400,
      })
    );

  const coupon = await couponModel.create({
    code,
    discountType,
    discountValue,
    startDate,
    endDate,
    couponsNo,
    usageLimit,
    addedBy: req.user._id,
  });
  res.status(200).json({
    success: true,
    coupon,
  });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  //delete the coupon
  const isDeleted = await couponModel.deleteOne({ _id: id });
  if (!isDeleted) return next(new error("coupon is not found", { cause: 404 }));

  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    code,
    discountType,
    discountValue,
    startDate,
    endDate,
    usageLimit,
    couponsNo,
  } = req.body;

  //check if the coupon code exists
  const coupon = await couponModel.findById(id);
  if (!coupon) return next(new Error("Coupon is not found ", { cause: 404 }));
  //check the code found or not
  if (code) {
    const isFound = await couponModel.findOne({ code });
    if (isFound)
      return next(new Error("code is already exist", { cause: 409 }));
    coupon.code = code;
  }

  //check for discountType
  if (discountType) coupon.discountType = discountType;
  if (discountValue) coupon.discountValue = discountValue;
  if (usageLimit) coupon.usageLimit = usageLimit;
  if (couponsNo) coupon.couponsNo = couponsNo;

  if (coupon.discountType === "percentage" && coupon.discountValue > 100)
    return next(
      new Error("Discount precentage must be less than or equal 100% ", {
        cause: 400,
      })
    );

  if (startDate) {
    coupon.startDate = startDate;
  }
  if (endDate) {
    if (new Date(endDate) > new Date(coupon.startDate))
      coupon.endDate = endDate;
    else
      return next(
        new Error("End date should be greater than Start date ", { cause: 400 })
      );
  }

  await coupon.save();
  res.status(200).json({
    success: true,
    coupon,
  });
});

cron.schedule("0 0 * * *", async () => {
  try {
    const invalidCoupons = await couponModel.find({
      $or: [
        { endDate: { $lt: new Date() } }, // endDate < currentDate
        { $expr: { $gte: ["$usedCoupons", "$couponsNo"] } }, // usedCoupons >= couponsNo
      ],
    });
    // Remove the invalid coupons
    invalidCoupons.forEach(async (coupon) => {
      await coupon.remove();
      console.log(`Coupon ${coupon.code} has been removed.`);
    });
  } catch (error) {
    console.error("Error removing invalid coupons:", error);
  }
});
