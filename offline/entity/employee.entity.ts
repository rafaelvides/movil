import { Column, Entity, PrimaryGeneratedColumn } from "typeorm/browser";

@Entity("employee")
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  fullName!: string;

  @Column({ type: "varchar", length: 255 })
  phone!: string;

  @Column({ type: "int" })
  branchId!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;
}
