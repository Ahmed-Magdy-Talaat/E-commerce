import productModel from "../../DB/models/product.model.js";

export const checkForProductAvailability = async (
  productId,
  quantity,
  next
) => {
  const product = await productModel.findById(productId);
  console.log(product.stock);
  if (!product) return next(new Error("Product is not found", { cause: 404 }));
  if (quantity >= product.stock)
    return next(new Error("You can't buy this much item"), { cause: 404 });
  return product;
};

/************************* updateCartProducts ********************************/
export const updateCartProducts = async (products, next) => {
  let updatedProducts = [];
  let subTotal = 0;

  for (const product of products) {
    //check for product id
    const foundProduct = await checkForProductAvailability(
      product.productId,
      product.quantity,
      next
    );
    //calc finalPrice for each product
    const finalPrice = foundProduct.estimatedPrice * product.quantity;

    updatedProducts.push({
      productId: product.productId,
      quantity: product.quantity,
      priceForOne: foundProduct.estimatedPrice,
      finalPrice,
      title: foundProduct.title,
    });

    subTotal += finalPrice;
  }
  return { updatedProducts, subTotal };
};
