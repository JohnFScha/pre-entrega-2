import fs from "fs";

class CartManager {
  constructor(path, productManager) {
    this.lastCartId = 0;
    this.path = path;
    this.productManager = productManager;
  }

  // Crear nuevo carrito
  createCart() {
    const carts = JSON.parse(fs.readFileSync(this.path, "utf-8"));

    if (carts.length > 0) {
      const lastCart = carts[carts.length - 1];
      const newCart = {
        id: lastCart.id + 1,
        products: [],
      };
      carts.push(newCart);
      fs.writeFileSync(this.path, JSON.stringify(carts));
    } else {
      const newCart = {
        id: this.lastCartId + 1,
        products: [],
      };
      carts.push(newCart);
      fs.writeFileSync(this.path, JSON.stringify(carts));
    }

    return carts;
  }

  // Devolver un carrito por su id
  getCartById(cartId) {
    const carts = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    const cart = carts.find((cart) => cart.id === cartId);

    if (!cart) {
      throw new Error('No existe carrito con el ID proporcionado.');
    } else {
      return cart;
    }
  }

  // Añadir productos al carrito
  addProductToCart(cartId, productId) {
    const carts = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    const cart = carts.find((cart) => cart.id === cartId);

    if (!cart) {
      throw new Error("Cart not found.");
    }

    const existingProduct = cart.products.find(
      (item) => item.product === productId
    );

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      // Check if the product with the given ID exists in ProductManager
      const product = this.productManager.getProductById(productId);
      if (product) {
        cart.products.push({ product: product.id, quantity: 1 });
      } else {
        throw new Error("Product not found.");
      }
    }

    fs.writeFileSync(this.path, JSON.stringify(carts));
    return true;
  }
}

export default CartManager;
