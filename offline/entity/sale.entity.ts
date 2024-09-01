import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm/browser";
import { Customer } from "./customer.entity";
import { Transmitter } from "./transmitter.entity";

@Entity("Sale")
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  tipoDte!: string;

  @Column({ type: "date" })
  fecEmi!: Date;

  @Column({ type: "time" })
  horEmi!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  totalNoSuj!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  totalExenta!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  totalGravada!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  subTotalVentas!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  descuNoSuj!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  descuExenta!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  descuGravada!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  porcentajeDescuento!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  totalDescu!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  subTotal!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  totalIva!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
  montoTotalOperacion!: number;

  @Column({ type: "varchar", default: "0.00" })
  totalPagar!: string;

  @Column({ type: "int", default: 1 })
  condicionOperacion!: number;

  @Column({ default: "N/A", type: "varchar" })
  totalLetras!: string;

  @Column({ type: "int" })
  userId!: number;

  @Column({ type: "boolean", default: false })
  isProcessed!: boolean;

  @Column({ type: "varchar", default: "Sin conexión" })
  tipeSale!: string;

  @Column({ type: "int" })
  idBox!: number;

  @ManyToOne(() => Customer)
  customer!: Customer;

  @RelationId((sale: Sale) => sale.customer)
  customerId!: number;

  @ManyToOne(() => Transmitter)
  transmitter!: Transmitter;

  @RelationId((sale: Sale) => sale.transmitter)
  transmitterId!: number;
}
