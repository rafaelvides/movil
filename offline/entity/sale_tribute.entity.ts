import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm/browser";
import { Sale } from "./sale.entity";

@Entity("tribute_sale")
export class TributeSale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  descripcion!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  monto!: number;

  @Column({ type: "varchar" })
  codigo!: string;

  @ManyToOne(() => Sale)
  sale!: Sale;

  @RelationId((tribute: TributeSale) => tribute.sale)
  saleId!: number;
}
