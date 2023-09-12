import fs from "fs";

class ProductManager {
  constructor(path) {
    this.lastProductId = 0;
    this.path = path;
  }

  // Añadir productos
  addProduct(product) {
    const products = JSON.parse(fs.readFileSync(this.path, "utf-8"));

    const requiredKeys = [
      "title",
      "description",
      "price",
      "thumbnail",
      "code",
      "stock",
    ];

    for (const key of requiredKeys) {
      if (!product.hasOwnProperty(key) || !product[key]) {
        throw new Error(`Missing or empty value for key: ${key}`);
      }
    }

    const existingProduct = products.find((prod) => prod.code === product.code);
    if (existingProduct) {
      throw new Error(`Product with code '${product.code}' already exists`);
    }

    if (products.length > 0) {
      const lastProduct = products[products.length - 1];
      product.id = lastProduct.id + 1;
    } else {
      product.id = this.lastProductId++;
    }

    product.stock--;
    products.push(product);
    fs.writeFileSync(this.path, JSON.stringify(products));
    return true;
  }

  // Devolver todos los productos
  getProducts() {
    const products = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    return products;
  }

  // Buscar producto por su id
  getProductById(id) {
    const products = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    const product = products.find((producto) => producto.id === id);
    if (product) {
      return product;
    } else {
      throw new Error("Product not found.");
    }
  }

  // Actualizar un producto por su id y propiedad y valor pasados por request
  updateProducts(id, prop, newProp) {
    const products = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    const index = products.findIndex((prod) => prod.id === id);

    if (index !== -1) {
      // Check if the specified property exists in the product
      if (products[index].hasOwnProperty(prop) && prop !== "id") {
        products[index][prop] = newProp; // Update the specified property
        fs.writeFileSync(this.path, JSON.stringify(products));
        return true;
      } else {
        throw new Error(
          prop === "id"
            ? ` The ${prop} cannot be overwritten`
            : `Cannot find property '${prop}' for the product ${id}`
        );
      }
    } else {
      throw new Error("Product not found.");
    }
  }

  // Borrar un producto por su id
  deleteProducts(id) {
    const products = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    const prods = products.filter((prod) => prod.id !== id);
    fs.writeFileSync(this.path, JSON.stringify(prods));
    return true;
  }
}

export default ProductManager;
