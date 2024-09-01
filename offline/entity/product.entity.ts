import { Column, Entity, PrimaryGeneratedColumn } from "typeorm/browser";

@Entity("product")
export class Product {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: "int" })
  productId!: number;

  @Column({ type: "varchar", length: 355 })
  name!: string;

  @Column({ type: "varchar", length: 555 })
  description!: string;

  @Column({ type: "varchar", length: 255 })
  code!: string;

  @Column({ type: "int" })
  tipoItem!: number;

  @Column({ type: "int" })
  uniMedida!: number;

  @Column({ type: "varchar", length: 255 })
  nameCategory!: string;

  @Column({ default: true, type: "boolean" })
  isActive!: boolean;
}
