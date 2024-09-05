import { create } from "zustand";
import { IBranchProductStore } from "../types/branch_product/branch_product_store.types";
import {
  get_branch_products,
  get_product_by_code,
  get_branch_product_by_branch,
  get_discount_product_by_code,
} from "../services/branch_product.service";
import { ToastAndroid } from "react-native";
import { IPagination } from "@/types/GlobalTypes/Global.types";
import { generate_uuid } from "@/plugins/random/random";
import { validateDays } from "@/utils/date";
import {
  calcularDescuento,
  calcularPrecioDeseado,
} from "@/plugins/DTE/money/money";

export const useBranchProductStore = create<IBranchProductStore>(
  (set, get) => ({
    pagination_branch_product: {} as IPagination,
    cart_products: [],
    branch_products: [],
    is_loading: false,
    totalAPagar: 0,
    reteRenta: 0,
    isDescuento: true,
    descuentoPorProducto: [],
    descuentoTotal: 0,
    descuent: 0,
    totalIva: 0,
    porcentajeDescuento: [],
    branch_products_list: [],
    is_loading_list: false,
    PostProductCart: (product) => {
      const { cart_products } = get();
      const existProduct = cart_products.find((cp) => cp.uuid === "uuid");
      if (existProduct) {
        get().OnPlusQuantity(existProduct.uuid);
        ToastAndroid.show(
          "El producto se agrego al carrito",
          ToastAndroid.SHORT
        );
      } else {
        set({
          cart_products: [
            ...cart_products,
            {
              uuid: generate_uuid().toUpperCase(),
              ...product,
              quantity: 1,
              base_price: Number(product.price),
              discount: 0,
              total: 0, // poner totalAPagar
              porcentaje: 0,
              fixed_price: 0,
              porcentaje_descuento: 0,
              monto_descuento: 0,
              prices: [
                product.price,
                product.priceA,
                product.priceB,
                product.priceC,
              ],
            },
          ],
        });
        ToastAndroid.show(
          "El producto se agrego al carrito",
          ToastAndroid.SHORT
        );
      }
    },
    GetPaginatedBranchProducts: (brachId, page, limit, name, code) => {
      set({ is_loading: true });
      get_branch_products(brachId, page, limit, name, code)
        .then(({ data }) => {
          set({
            branch_products: data.branchProducts,
            pagination_branch_product: {
              total: data.total,
              totalPag: data.totalPag,
              currentPag: data.currentPag,
              nextPag: data.nextPag,
              prevPag: data.prevPag,
              status: data.status,
              ok: data.ok,
            },
            is_loading: false,
          });
        })
        .catch(() => {
          set({
            branch_products: [],
            pagination_branch_product: {
              total: 0,
              totalPag: 0,
              currentPag: 0,
              nextPag: 0,
              prevPag: 0,
              status: 0,
              ok: false,
            },
            is_loading: false,
          });
          ToastAndroid.show("No se encontraron productos", ToastAndroid.SHORT);
        });
    },
    GetProductByCode: (transmitterId, code) => {
      get_product_by_code(transmitterId, code).then(({ data }) => {
        const { cart_products } = get();
        const existProduct = cart_products.find(
          (cp) => cp.id === data.product.id
        );
        if (existProduct) {
          get().OnPlusQuantity(existProduct.uuid);
        } else {
          set({
            cart_products: [
              ...cart_products,
              {
                ...data.product,
                uuid: generate_uuid().toUpperCase(),
                quantity: 1,
                base_price: Number(data.product.price),
                discount: 0,
                total: Number(data.product.price),
                porcentaje: 0,
                fixed_price: 0,
                porcentaje_descuento: 0,
                monto_descuento: 0,
                prices: [
                  data.product.price,
                  data.product.priceA,
                  data.product.priceB,
                  data.product.priceC,
                ],
              },
            ],
          });
        }
      });
    },
    OnPlusQuantity: (uuid) => {
      const { cart_products } = get();
      const product = cart_products.find((cp) => cp.uuid === uuid);

      if (product) {
        const products_with_id = cart_products.filter(
          (cp) => cp.id === product.id
        );
        if (
          Number(product.price) + Number(product.monto_descuento) !==
          Number(product.base_price)
        ) {
          const newCartProducts = cart_products.map((cp) =>
            cp.uuid === uuid
              ? {
                  ...cp,
                  total: cp.total + Number(cp.price),
                  quantity: cp.quantity + 1,
                  price: cp.price,
                  monto_descuento: 0,
                }
              : cp
          );

          set({ cart_products: newCartProducts });
          return;
        }
        // Verificar si la cantidad actual es menor que el máximo permitido
        if (
          products_with_id.length === 1 &&
          (product.minimum >= product.quantity || product.minimum === 0) &&
          validateDays(product.days) &&
          (product.maximum === 0 || product.quantity < product.maximum)
        ) {
          const { montoDescuento, precioDeseado } = calcularPrecioDeseado(
            Number(product.base_price),
            Number(product.porcentaje_descuento)
          );

          const newCartProducts = cart_products.map((cp) =>
            cp.uuid === uuid
              ? {
                  ...cp,
                  total: cp.total + cp.base_price,
                  quantity: cp.quantity + 1,
                  price: precioDeseado.toFixed(2),
                  monto_descuento: montoDescuento,
                }
              : cp
          );

          set({ cart_products: newCartProducts });
          return;
        } else if (product.quantity >= product.maximum) {
          const products_with_id = cart_products.filter(
            (cp) => cp.id === product.id
          );
          if (products_with_id.length === 1) {
            const newCartProduct = {
              ...product,
              uuid: generate_uuid().toUpperCase(), // Generar nuevo UUID
              quantity: 1, // Reiniciar la cantidad
              total: product.base_price,
              price: product.base_price.toString(),
              monto_descuento: 0,
            };

            const newCartProducts = [...cart_products, newCartProduct];
            set({ cart_products: newCartProducts });
            return;
          } else {
            const newCartProducts = cart_products.map((cp) =>
              cp.uuid === products_with_id[1].uuid
                ? {
                    ...cp,
                    total: cp.total + cp.base_price,
                    quantity: cp.quantity + 1,
                    price: cp.base_price.toString(),
                    monto_descuento: 0,
                  }
                : cp
            );

            set({ cart_products: newCartProducts });
            return;
          }
          // Si la cantidad actual es igual o superior al máximo, añadir un nuevo producto
        }
      }

      // Si el producto no existe o no cumple las condiciones, solo incrementar la cantidad
      const newCartProducts = cart_products.map((cp) =>
        cp.uuid === uuid
          ? {
              ...cp,
              total: cp.total + cp.base_price,
              quantity: cp.quantity + 1,
            }
          : cp
      );

      set({ cart_products: newCartProducts });
      // get().GetTotalsSales();
    },
    OnMinusQuantity: (uuid) => {
      const { cart_products } = get();
      const product = cart_products.find((cp) => cp.uuid === uuid);
      if (product) {
        if (product.quantity > 1) {
          const newCartProducts = cart_products.map((cp) =>
            cp.uuid === uuid
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
      // get().GetTotalsSales();
    },
    OnRemoveProduct: (uuid) => {
      set((state) => ({
        cart_products: state.cart_products.filter((cp) => cp.uuid !== uuid),
      }));
      // get().GetTotalsSales();
    },
    OnUpdateQuantity: (uuid, quantity) => {
      set((state) => ({
        cart_products: state.cart_products.map((cp) =>
          cp.uuid === uuid
            ? { ...cp, total: cp.base_price * quantity, quantity }
            : cp
        ),
      }));
      // get().GetTotalsSales();
    },
    OnUpdatePrice(index, price_index) {
      const products = get().cart_products;
      const price = products[index].prices[price_index];
      if (Number(price) === Number(products[index].fixedPrice)) {
        products[index].price = price;
        products[index].total = Number(price) * products[index].quantity;

        if (
          Number(products[index].fixedPrice) > 0 &&
          validateDays(products[index].days)
        ) {
          const { porcentajeDescuento, montoDescuento } = calcularDescuento(
            Number(products[index].base_price),
            Number(products[index].fixedPrice)
          );
          products[index].monto_descuento = montoDescuento;
          products[index].porcentaje_descuento = porcentajeDescuento;
        }
      } else {
        products[index].price = price;
        products[index].total = Number(price) * products[index].quantity;
        products[index].monto_descuento = 0;
        products[index].porcentaje_descuento = 0;
      }

      set({ cart_products: products });
    },
    deleteProductCart: (id) => {
      const { cart_products } = get();
      const index = cart_products.findIndex((cp) => cp.id === id);
      if (index > -1) {
        const newCartProducts = [...cart_products];
        newCartProducts.splice(index, 1);
        set({ cart_products: newCartProducts });
      }
      // get().GetTotalsSales();
    },
    emptyCart: () => {
      set({ cart_products: [] });
      // get().GetTotalsSales();
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
    //   get().reteRenta = total * 0.01;
    //   get().totalIva = total * 0.13 + total;
    //   return total;
    // },
    OnGetBranchProductList(brachId) {
      set({ is_loading_list: true });
      get_branch_product_by_branch(brachId)
        .then((data) => {
          set({
            branch_products_list: data.data.branchProducts,
            is_loading_list: false,
          });
        })
        .catch((error) => {
          ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.SHORT);
          set({ branch_products_list: [], is_loading_list: false });
        });
    },
    OnAddProductByCode(code, branchId) {
      get_discount_product_by_code(code, branchId)
        .then(({ data }) => {
          const { cart_products } = get();
          const existProduct = cart_products.find(
            (cp) => cp.id === data.product.id
          );

          if (existProduct) {
            get().OnPlusQuantity(existProduct.uuid);
            ToastAndroid.show("Producto agregado al carrito", 100);
            return;
          }

          if (
            Number(data.product.fixedPrice) > 0 &&
            validateDays(data.product.days) &&
            Number(data.product.price) >= Number(data.product.fixedPrice)
          ) {
            const { porcentajeDescuento, montoDescuento } = calcularDescuento(
              Number(data.product.price),
              Number(data.product.fixedPrice)
            );
            set({
              cart_products: [
                ...cart_products,

                {
                  ...data.product,
                  uuid: generate_uuid().toUpperCase(),
                  price: data.product.fixedPrice,
                  branch: data.product.branch,
                  product: data.product.product,
                  quantity: 1,
                  base_price: Number(data.product.price),
                  discount: 0,
                  total: 0, // poner totalAPagar
                  porcentaje: 0,
                  fixed_price: Number(data.product.fixedPrice),
                  porcentaje_descuento: porcentajeDescuento,
                  monto_descuento: montoDescuento,
                  prices: [
                    data.product.fixedPrice,
                    data.product.price,
                    data.product.priceA,
                    data.product.priceB,
                    data.product.priceC,
                  ],
                },
              ],
            });
            ToastAndroid.show("Producto agregado al carrito", 100);
          } else {
            if (
              Number(data.product.porcentaje) > 0 &&
              [0, 1].includes(Number(data.product.minimum))
            ) {
              const { montoDescuento, precioDeseado } = calcularPrecioDeseado(
                Number(data.product.price),
                Number(data.product.porcentaje)
              );

              set({
                cart_products: [
                  ...cart_products,
                  {
                    ...data.product,
                    uuid: generate_uuid().toUpperCase(),
                    quantity: 1,
                    base_price: Number(data.product.price),
                    price: precioDeseado.toFixed(2),
                    discount: 0,
                    total: Number(precioDeseado.toFixed(2)),
                    fixed_price: 0,
                    porcentaje_descuento: Number(data.product.porcentaje),
                    monto_descuento: montoDescuento,
                    prices: [
                      precioDeseado.toFixed(2),
                      data.product.priceA,
                      data.product.priceB,
                      data.product.priceC,
                    ],
                  },
                ],
              });
              ToastAndroid.show("Producto agregado al carrito", 100);
              return;
            }
            set({
              cart_products: [
                ...cart_products,
                {
                  uuid: generate_uuid().toUpperCase(),
                  ...data.product,
                  quantity: 1,
                  base_price: Number(data.product.price),
                  discount: 0,
                  total: Number(data.product.price),
                  porcentaje: 0,
                  fixed_price: 0,
                  porcentaje_descuento: Number(data.product.porcentaje),
                  monto_descuento: 0,
                  prices: [
                    data.product.price,
                    data.product.priceA,
                    data.product.priceB,
                    data.product.priceC,
                  ],
                },
              ],
            });
            ToastAndroid.show("Producto agregado al carrito", 100);
          }
        })
        .catch(() => {
          ToastAndroid.show("No se encontró el producto", ToastAndroid.LONG);
        });
    },
  })
);
