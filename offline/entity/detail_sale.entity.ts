import { BranchProducts } from "./branch_product.entity";
import { Sale } from "./sale.entity";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm/browser";

@Entity("detail-sale")
export class DetailSale {
  @ManyToOne(() => Sale)
  sale!: Sale;

  @RelationId((detailSale: DetailSale) => detailSale.sale)
  saleId!: number;

  @ManyToOne(() => BranchProducts)
  branchProduct!: BranchProducts;

  @RelationId((detailSale: DetailSale) => detailSale.branchProduct)
  branchProductId!: number;

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  montoDescu!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  ventaNoSuj!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  ventaExenta!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  ventaGravada!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  totalItem!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  precio!: number;

  @Column({ default: 0, type: "int" })
  cantidadItem!: number;

  @Column({ default: 0, type: "int" })
  ivaItem!: number;

  @Column({ type: "int" })
  tipoItem!: number;

  @Column({ type: "int" })
  uniMedida!: number;

  @Column({ default: true, type: "boolean" })
  isActive!: boolean;
}
