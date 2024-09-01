import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm/browser";
import { Sale } from "./sale.entity";
import { Column } from "typeorm/browser";

@Entity("payment_sale")
export class PaymentSale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  codigo!: string;

  @Column({ type: "int" })
  montoPago!: number;

  @Column({ default: "", type: "varchar" })
  referencia!: string;

  @Column({ nullable: true, type: "varchar", default: "N/A" })
  plazo!: string | null;

  @Column({ nullable: true, type: "varchar", default: "N/A" })
  periodo?: number | null;

  @ManyToOne(() => Sale)
  sale!: Sale;

  @RelationId((paymentSales: PaymentSale) => paymentSales.sale)
  saleId!: number;
}
