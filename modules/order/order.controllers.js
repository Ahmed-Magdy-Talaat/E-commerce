import couponUserModel from "../../DB/models/coupon-user.model.js";
import orderModel from "../../DB/models/order.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { checkForProductAvailability } from "../cart/cart.services.js";
import {
  applyCoupon,
  checkCouponValidation,
} from "../coupon/coupon.services.js";
import { checkOrderStatus } from "./order.services.js";
import cartModel from "../../DB/models/cart.model.js";
import productModel from "../../DB/models/product.model.js";

export const createOrder = asyncHandler(async (req, res, next) => {
  const {
    productId,
    quantity,
    couponCode,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    postalCode,
    phoneNumbers,
    paymentMethod,
  } = req.body;

  let couponData = null;
  if (couponCode)
    couponData = await checkCouponValidation(couponCode, req.user, next);

  //check product availability
  const product = await checkForProductAvailability(productId, quantity, next);
  const shippingAddress = {
    addressLine1,
    addressLine2,
    state,
    city,
    country,
    postalCode,
  };

  const orderItems = [
    {
      productId,
      quantity,
      price: product.estimatedPrice,
      title: product.title,
    },
  ];
  const totalPrice = product.estimatedPrice;
  let finalPrice = totalPrice;

  if (couponData) {
    finalPrice = await applyCoupon(finalPrice, couponData, req.user, next);
  }

  const orderStatus = checkOrderStatus(paymentMethod);

  const order = await orderModel.create({
    orderItems,
    shippingAddress,
    paymentMethod,
    phoneNumbers,
    orderStatus,
    finalPrice,
    totalPrice,
    userId: req.user._id,
    coupon: couponData?.coupon._id,
  });

  product.stock -= quantity;
  await product.save();
  res.status(200).json({
    success: true,
    message: "Order is created succefully",
    order,
  });
});

export const convertCartToOrder = asyncHandler(async (req, res, next) => {
  const {
    couponCode,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    postalCode,
    phoneNumbers,
    paymentMethod,
  } = req.body;

  const shippingAddress = {
    addressLine1,
    addressLine2,
    state,
    city,
    country,
    postalCode,
  };

  let couponData = null;
  //check for coupon
  if (couponCode)
    // check coupon
    couponData = await checkCouponValidation(couponCode, req.user, next);

  //check for userCart found or not
  const userCart = await cartModel.findOne({ userId: req.user._id });
  if (!userCart) return next(new Error("User has no cart", { cause: 404 }));

  const products = userCart.products;
  let orderItems = [];

  for (const product of products) {
    const productFound = await checkForProductAvailability(
      product.productId,
      product.quantity,
      next
    );
    orderItems.push({
      title: productFound.title,
      price: productFound.estimatedPrice,
      productId: productFound._id,
      quantity: product.quantity,
    });
  }
  console.log(orderItems);

  let totalPrice = userCart.subTotal;
  let finalPrice = totalPrice;

  if (couponData) {
    finalPrice = await applyCoupon(finalPrice, couponData, req.user, next);
  }

  const orderStatus = checkOrderStatus(paymentMethod);

  const order = await orderModel.create({
    shippingAddress,
    orderItems,
    orderStatus,
    finalPrice,
    totalPrice,
    userId: req.user._id,
    phoneNumbers,
    paymentMethod,
    coupon: couponData?.coupon._id,
  });

  for (const product of products) {
    console.log(product);
    const productFound = await productModel.findById(product.productId);
    productFound.stock -= product.quantity;
    await productFound.save();
  }

  userCart.products = [];
  userCart.subTotal = 0;
  await userCart.save();

  res.status(200).json({
    success: true,
    message: "Order is created succefully",
    order,
  });
});
