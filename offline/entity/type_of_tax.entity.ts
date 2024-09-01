import { Column, Entity, PrimaryGeneratedColumn } from "typeorm/browser";

@Entity("type_of_tax")
export class TypeOfTax {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  typeOfTaxId!: number;

  @Column({ type: "varchar" })
  codigo!: string;

  @Column({ type: "varchar" })
  valores!: string;

  @Column({ type: "boolean", default: true })
  isActivated!: boolean;
}
