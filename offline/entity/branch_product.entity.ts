import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  RelationId,
} from "typeorm/browser";
import { Product } from "./product.entity";
@Entity("branch-products")
export class BranchProducts {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  branchProductId!: number;

  @Column({ type: "int", default: 0 })
  stock!: number;

  @Column({ type: "varchar", default: "N/A" })
  price!: string;

  @Column({ type: "varchar", length: 255 })
  priceA!: string;

  @Column({ type: "varchar", length: 255 })
  priceB!: string;

  @Column({ type: "varchar", length: 255 })
  priceC!: string;

  @Column({ type: "decimal", default: 0 })
  minimumStock!: number;

  @Column({ type: "int" })
  branchId!: number;

  @Column({ type: "int", default: 0 })
  supplierId!: number;

  @ManyToOne(() => Product)
  product!: Product;

  @RelationId((branchProduct: BranchProducts) => branchProduct.product)
  productId!: number;

  @Column({ type: "varchar", length: 255, default: "N/A" })
  name!: string;

  @Column({ type: "varchar", length: 255, default: "N/A" })
  address!: string;

  @Column({ type: "varchar", length: 255, default: "N/A" })
  phone!: string;

  @Column({ type: "int" })
  transmitterId!: number;
}
