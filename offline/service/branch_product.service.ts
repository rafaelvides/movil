import { connection } from "../db.config";
import { BranchProducts } from "../entity/branch_product.entity";
import { Product } from "../entity/product.entity";
import { IBranchProductCreateDto } from "../dto/branch_product.dto";
import { IGetBranchProductsOfflinePag } from "../types/branch_product_offline";
import { Like } from "typeorm/browser";
import { ToastAndroid } from "react-native";

export async function saveBranchProduct(
  branch_product: IBranchProductCreateDto
) {
  try {
    const branchProductRepositiory = connection.getRepository(BranchProducts);
    const productRepositiory = connection.getRepository(Product);

    const existingProductBranch = await branchProductRepositiory.findOne({
      where: {
        branchProductId: branch_product.branchProductId,
      },
    });
    const existingProduct = await productRepositiory.findOne({
      where: {
        code: branch_product.product.code,
      },
    });

    if (existingProductBranch) {
      if (existingProduct) {
        existingProduct.code = branch_product.product.code;
        existingProduct.name = branch_product.product.name;
        existingProduct.description = branch_product.product.description;
        existingProduct.nameCategory = branch_product.product.nameCategory;
        existingProduct.isActive = branch_product.product.isActive;
        const savedExistingProduct = await productRepositiory.save(
          existingProduct
        );
        existingProductBranch.stock = branch_product.stock;
        existingProductBranch.price = branch_product.price;
        existingProductBranch.priceA = branch_product.priceA;
        existingProductBranch.priceB = branch_product.priceB;
        existingProductBranch.priceC = branch_product.priceC;
        existingProductBranch.minimumStock = branch_product.minimumStock;
        existingProductBranch.branchId = branch_product.branchId;
        existingProductBranch.supplierId = branch_product.supplierId;
        existingProductBranch.product = savedExistingProduct;
        existingProductBranch.productId = branch_product.productId;
        existingProductBranch.name = branch_product.name;
        existingProductBranch.address = branch_product.address;
        existingProductBranch.phone = branch_product.phone;
        existingProductBranch.transmitterId = branch_product.transmitterId;
        const savedExistingBranchProduct = await branchProductRepositiory.save(
          existingProductBranch
        );

        return savedExistingBranchProduct;
      } else {
        const newProduct = productRepositiory.create({
          ...branch_product.product,
        });
        const savedNewBranchProduct = await branchProductRepositiory.save({
          ...branch_product,
          product: newProduct,
        });
        return savedNewBranchProduct;
      }
    }
    const newProduct = await productRepositiory.save({
      ...branch_product.product,
    });
    const savedNewBranchProduct = await branchProductRepositiory.save({
      ...branch_product,
      product: newProduct,
    });
    return savedNewBranchProduct;
  } catch (error) {
    throw new Error(`Error in saveBranchProduct: ${error}`);
  }
}

export async function getBranchProductPaginated(
  branchId: number,
  code: string,
  name: string,
  page: number,
  limit: number
): Promise<IGetBranchProductsOfflinePag> {
  const branchProductRepositiory = connection.getRepository(BranchProducts);

  const [branch_product, total] = await branchProductRepositiory.findAndCount({
    where: {
      branchId: branchId,
      product: {
        code: code ? Like(`%${code}%`) : undefined,
        name: name ? Like(`%${name}%`) : undefined,
      },
    },
    take: limit,
    skip: (page - 1) * limit,
    relations: {
      product: true,
    },
  });
  if (branch_product.length === 0) {
    return {
      branchProducts: [],
      totalPages: 0,
      totalItems: 0,
      nextPage: 0,
      prevPage: 0,
      currentPage: 0,
      limit: 0,
    };
  }
  let totalPag: number = total / limit;
  if (totalPag % 1 !== 0) {
    totalPag = Math.floor(totalPag) + 1;
  }

  const nextPage: number = page >= totalPag ? page : Number(page) + 1;
  const prevPage: number = page <= 1 ? page : Number(page) - 1;
  return {
    branchProducts: branch_product,
    totalPages: totalPag,
    totalItems: total,
    nextPage: nextPage,
    prevPage: prevPage,
    currentPage: page,
    limit: limit,
  };
}
export async function getBranchProductForCode(code: string) {
  const branchProductRepositiory = connection.getRepository(BranchProducts);

  const branch_product = await branchProductRepositiory.findOne({
    where: {
      product: {
        code: code,
      },
    },
    relations: {
      product: true,
    },
  });
  if (branch_product) {
    return branch_product;
  } else {
    ToastAndroid.show("Producto no encontrado", ToastAndroid.SHORT);
  }
}
