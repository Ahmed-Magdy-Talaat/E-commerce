import cartModel from "../../DB/models/cart.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import productModel from "../../DB/models/product.model.js";
import {
  checkForProductAvailability,
  updateCartProducts,
} from "./cart.services.js";
/***************************** add product to cart *************************/
/*
This function adds a product to the shopping cart
destruct {productId,quantity} from req.body
check if the user has a cart
if not create one and set it in DB
get the product by id from DB
add the product  to the users cart with its quantity ,basePrice and finalPrice
update subTotal value  of the user's cart
save the user Cart
return  res.json({cart:userCart})
*/

export const addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  //1- get the current User's cart
  const isExist = await cartModel.findOne({ userId: req.user._id });
  if (!isExist) await cartModel.create({ userId: req.user._id });

  //check for the product
  const product = await checkForProductAvailability(productId, quantity, next);
  //get the userCart
  let userCart = await cartModel.findOne({ userId: req.user._id });

  //check if the product is already in the products array of user
  let productIndex = userCart.products.findIndex((item) => {
    return item.productId.toString() === productId;
  });

  //if product is found in the cart
  if (productIndex != -1) {
    const productInCart = userCart.products[productIndex];
    if (productInCart + quantity > product.quantity)
      return next(
        new Error("You can't add this much of Product", { cause: 400 })
      );
    productInCart.quantity += quantity;
    productInCart.finalPrice += quantity * product.estimatedPrice;
  } else {
    userCart.products.push({
      productId,
      quantity,
      priceForOne: product.estimatedPrice,
      finalPrice: quantity * product.estimatedPrice,
      title: product.title,
    });
  }
  userCart.subTotal += product.estimatedPrice * quantity;

  await userCart.save();

  res.status(200).json({
    success: true,
    userCart,
  });
});

///

export const deleteProductFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  // Check if the product exists
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new Error("Product is not found"), { cause: 404 });
  }

  // Find the user's cart
  const userCart = await cartModel.findOne({ userId: req.user._id });
  if (!userCart) {
    return next(new Error("User has no cart", { cause: 404 }));
  }

  // Find the index of the product in the cart
  const productIndex = userCart.products.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (productIndex === -1) {
    return next(new Error("Product is not found", { cause: 404 }));
  }

  // Remove the product from the cart
  const deletedProduct = userCart.products.splice(productIndex, 1)[0];

  // Update subtotal
  userCart.subTotal -= deletedProduct.finalPrice;

  // Save the updated cart
  await userCart.save();

  res.status(200).json({ success: true, userCart });
});

/********************************* get userCart ****************************/
export const getUserCart = asyncHandler(async (req, res, next) => {
  const userCart = await cartModel.findOne({ userId: req.user._id });
  if (!userCart) return next(new Error("User has no cart", { cause: 409 }));
  res.status(200).json({
    success: true,
    userCart,
  });
});

/*************************** delete the userCart*****************************/

export const deleteCart = asyncHandler(async (req, res, next) => {
  const deletedCart = await cartModel.deleteOne({ userId: req.user._id });
  if (!deletedCart.deletedCount)
    return next(new Error("user has no cart", { cause: 409 }));
  res.status(200).json({
    success: true,
    message: "Cart is deleted successfully",
  });
});

/*************************** update userCart **********************************/

export const updateUserCart = asyncHandler(async (req, res, next) => {
  const { products } = req.body;
  let userCart = await cartModel.findOne({ userId: req.user._id });

  //check for userCart
  if (!userCart) return next(new Error("User has no cart", { cause: 404 }));

  const { updatedProducts, subTotal } = await updateCartProducts(
    products,
    next
  );
  //update userCart products
  userCart.products = updatedProducts;
  userCart.subTotal = subTotal;
  await userCart.save();

  await res.status(200).json({
    success: true,
    userCart,
  });
});
