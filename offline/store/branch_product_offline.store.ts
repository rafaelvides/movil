import { create } from "zustand";
import { IBranchProductOfflineStore } from "../types/store/branch_product_offline_store.types";
import {
  saveBranchProduct,
  getBranchProductPaginated,
  getBranchProductForCode,
} from "../service/branch_product.service";
import { ToastAndroid } from "react-native";
import { IPaginationOffline } from "@/offline/types/pagination.types";
import { AxiosError } from "axios";

export const useBranchProductOfflineStore = create<IBranchProductOfflineStore>(
  (set, get) => ({
    branchProducts: [],
    is_loading: false,
    pagination: {} as IPaginationOffline,
    cart_products: [],
    totalAPagar: 0,
    isDescuento: true,
    descuentoPorProducto: [],
    descuentoTotal: 0,
    descuent: 0,
    totalIva: 0,
    porcentajeDescuento: [],
    OnSaveBranchProduct: async (payload) => {
      return await saveBranchProduct(payload)
        .then(() => {
          return true;
        })
        .catch((error: AxiosError) => {
          ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.SHORT);
          return false;
        });
    },
    OnGetBranchProductsOffline(branchId, code, name, page, limit) {
      set({ is_loading: true });
      getBranchProductPaginated(branchId, code, name, page, limit)
        .then((data) => {
          set({
            branchProducts: data.branchProducts,
            pagination: data,
            is_loading: false,
          });
        })
        .catch(() => {
          ToastAndroid.show("No se encontraron ventas", ToastAndroid.LONG);
          set({
            branchProducts: [],
            pagination: {} as IPaginationOffline,
            is_loading: false,
          });
        });
    },
    async OnAddProductForCode(code) {
      await getBranchProductForCode(code).then((brp) => {
        if (!brp) {
          return;
        }
        const { cart_products } = get();
        const existProduct = cart_products.find(
          (cp) => cp.product.code === code
        );
        if (existProduct) {
          get().OnPlusQuantity(existProduct.id);
          ToastAndroid.show("Producto agregado al carrito", ToastAndroid.LONG);
        } else {
          set({
            cart_products: [
              ...cart_products,
              {
                ...brp,
                quantity: 1,
                base_price: Number(brp.price),
                total: 0,
                discount: 0,
                porcentaje: 0,
              },
            ],
          });
          ToastAndroid.show("Producto agregado al carrito", ToastAndroid.LONG);
        }
      });
    },
    PostProductCart(product) {
      const { cart_products } = get();
      const existProduct = cart_products.find((cp) => cp.id === product.id);
      if (existProduct) {
        get().OnPlusQuantity(existProduct.id);
        ToastAndroid.show("Producto agregado al carrito", ToastAndroid.LONG);
      } else {
        set({
          cart_products: [
            ...cart_products,
            {
              ...product,
              quantity: 1,
              base_price: Number(product.price),
              total: 0,
              discount: 0,
              porcentaje: 0,
            },
          ],
        });
        ToastAndroid.show("Producto agregado al carrito", ToastAndroid.LONG);
      }
    },
    OnPlusQuantity(id) {
      const { cart_products } = get();
      const product = cart_products.find((cp) => cp.id === id);
      if (product) {
        const newCartProducts = cart_products.map((cp) =>
          cp.id === id
            ? {
                ...cp,
                total: cp.total + cp.base_price,
                quantity: cp.quantity + 1,
              }
            : cp
        );
        set({ cart_products: newCartProducts });
      }
    },
    OnMinusQuantity(id) {
      const { cart_products } = get();
      const product = cart_products.find((cp) => cp.id === id);
      if (product) {
        if (product.quantity > 1) {
          const newCartProducts = cart_products.map((cp) =>
            cp.id === id
              ? {
                  ...cp,
                  total: cp.total - cp.base_price,
                  quantity: cp.quantity - 1,
                }
              : cp
          );
          set({ cart_products: newCartProducts });
        }
      }
    },
    OnRemoveProduct(id) {
      set((state) => ({
        cart_products: state.cart_products.filter((cp) => cp.id !== id),
        descuentoPorProducto: [],
      }));
    },
    OnUpdateQuantity(index, quantity) {
      const products = get().cart_products;

      // if(Number(products[index].price) <= products[index].base_price){
      products[index].quantity = quantity;
      products[index].total =
        Number(products[index].price) * products[index].quantity;
      if (Number(products[index].price) <= products[index].base_price) {
        const discount =
          products[index].base_price - Number(products[index].price);

        const percentage = (discount / products[index].base_price) * 100;
        products[index].porcentaje = percentage;
        products[index].discount = discount * products[index].quantity;
      }

      set((state) => ({
        ...state,
        product_cart: products,
      }));
    },
    deleteProductCart(id) {
      const { cart_products } = get();
      const index = cart_products.findIndex((cp) => cp.id === id);
      if (index > -1) {
        const newCartProducts = [...cart_products];
        newCartProducts.splice(index, 1);
        set({ cart_products: newCartProducts });
      }
    },
    emptyCart() {
      set({ cart_products: [] });
    },
    // GetTotalsSales() {
    //   const { cart_products } = get();
    //   let total = 0;
    //   const currentDay = new Date()
    //     .toLocaleString("en-US", { weekday: "long" })
    //     .toUpperCase();

    //   cart_products.forEach((product) => {
    //     const fixedPrice = Number(product.fixedPrice) || 0;
    //     const normalPrice = Number(product.price) || 0;
    //     const percentage = Number(product.porcentaje) || 0;
    //     const quantity = product.quantity ?? 0;
    //     const minimum = product.minimum ?? 0;
    //     const maximum = product.maximum ?? Infinity;
    //     const operator = product.operator || "default";
    //     let applicablePrice = normalPrice;
    //     let descuentoMonto = 0;
    //     const applyFixedPricedPriceOrPercentage = (qty: number) => {
    //       if (fixedPrice > 0) {
    //         applicablePrice = fixedPrice;
    //         descuentoMonto = (normalPrice - fixedPrice) * qty;
    //       } else if (percentage > 0) {
    //         applicablePrice = normalPrice - normalPrice * (percentage / 100);
    //         descuentoMonto = normalPrice * (percentage / 100) * qty;
    //       }
    //     };
    //     if (product.days && product.days.includes(currentDay)) {
    //       if (minimum === 0 && maximum === Infinity && operator === "default") {
    //         applyFixedPricedPriceOrPercentage(quantity);
    //         total += applicablePrice * quantity;
    //       } else {
    //         let remainingQuantity = quantity;
    //         switch (operator) {
    //           case "<":
    //             if (quantity < minimum) {
    //               applyFixedPricedPriceOrPercentage(quantity);
    //               total += applicablePrice * quantity;
    //             } else {
    //               total += normalPrice * quantity;
    //             }
    //             break;
    //           case ">":
    //             if (quantity > minimum) {
    //               total += normalPrice * minimum;
    //               remainingQuantity -= minimum;
    //               if (remainingQuantity > 0) {
    //                 applyFixedPricedPriceOrPercentage(
    //                   Math.min(remainingQuantity, maximum - minimum)
    //                 );
    //                 total +=
    //                   applicablePrice *
    //                   Math.min(remainingQuantity, maximum - minimum);
    //                 remainingQuantity -= Math.min(
    //                   remainingQuantity,
    //                   maximum - minimum
    //                 );
    //               }
    //               if (remainingQuantity > 0) {
    //                 total += normalPrice * remainingQuantity;
    //               }
    //             } else {
    //               total += normalPrice * quantity;
    //             }
    //             break;
    //           case "<=":
    //             if (quantity <= minimum) {
    //               total += normalPrice * quantity;
    //             } else if (quantity <= maximum) {
    //               applyFixedPricedPriceOrPercentage(quantity);
    //               total += applicablePrice * quantity;
    //             } else {
    //               total += normalPrice * minimum;
    //               remainingQuantity -= minimum;
    //               if (remainingQuantity > 0) {
    //                 applyFixedPricedPriceOrPercentage(
    //                   Math.min(remainingQuantity, maximum - minimum)
    //                 );
    //                 total +=
    //                   applicablePrice *
    //                   Math.min(remainingQuantity, maximum - minimum);
    //                 remainingQuantity -= Math.min(
    //                   remainingQuantity,
    //                   maximum - minimum
    //                 );
    //               }
    //               if (remainingQuantity > 0) {
    //                 total += normalPrice * remainingQuantity;
    //               }
    //             }
    //             break;
    //           case ">=":
    //             if (quantity >= minimum) {
    //               total += normalPrice * minimum;
    //               remainingQuantity -= minimum;
    //               if (remainingQuantity > 0) {
    //                 applyFixedPricedPriceOrPercentage(
    //                   Math.min(remainingQuantity, maximum - minimum)
    //                 );
    //                 total +=
    //                   applicablePrice *
    //                   Math.min(remainingQuantity, maximum - minimum);
    //                 remainingQuantity -= Math.min(
    //                   remainingQuantity,
    //                   maximum - minimum
    //                 );
    //               }
    //               if (remainingQuantity > 0) {
    //                 total += normalPrice * remainingQuantity;
    //               }
    //             } else {
    //               total += normalPrice * quantity;
    //             }
    //             break;
    //           case "=":
    //             if (quantity === minimum) {
    //               applyFixedPricedPriceOrPercentage(quantity);
    //               total += applicablePrice * quantity;
    //             } else {
    //               total += normalPrice * quantity;
    //             }
    //             break;
    //           default:
    //             total += normalPrice * quantity;
    //             break;
    //         }
    //       }
    //     } else {
    //       total += normalPrice * quantity;
    //     }

    //     if (product.product) {
    //       const exists = get().descuentoPorProducto.findIndex(
    //         (item) => item.descripcion === product.product.name
    //       );
    //       if (exists !== -1) {
    //         get().descuentoPorProducto.splice(exists, 1);
    //       }
    //       get().descuentoPorProducto.push({
    //         descripcion: product.product.name,
    //         descuento: descuentoMonto,
    //       });
    //       const existsPorCentajeDescuento = get().porcentajeDescuento.some(
    //         (item) => item.descripcion === product.product.name
    //       );
    //       if (!existsPorCentajeDescuento) {
    //         get().porcentajeDescuento.push({
    //           descripcion: product.product.name,
    //           descuento:
    //             fixedPrice > 0
    //               ? ((normalPrice - fixedPrice) / normalPrice) * 100
    //               : percentage,
    //         });
    //       }
    //     }
    //   });

    //   get().totalAPagar = total;
    //   get().totalIva = total * 0.13 + total;
    //   return total;
    // },
  })
);
