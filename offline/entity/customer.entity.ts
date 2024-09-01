import { Column, Entity, PrimaryGeneratedColumn } from "typeorm/browser";

@Entity("customer")
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  customerId!: number;

  @Column({ type: "varchar" })
  nombre!: string;

  @Column({ default: "0", type: "varchar" })
  nombreComercial!: string;

  @Column({ default: "0", type: "varchar" })
  nrc!: string;

  @Column({ default: "0", type: "varchar" })
  nit!: string;

  @Column({ default: "N/A", type: "varchar" })
  tipoDocumento!: string;

  @Column({ default: "N/A", type: "varchar" })
  numDocumento!: string;

  @Column({ default: "0", type: "varchar" })
  codActividad!: string;

  @Column({ default: "0", type: "varchar" })
  descActividad!: string;

  @Column({ default: "0", type: "varchar" })
  bienTitulo!: string;

  @Column({ default: "0", type: "varchar" })
  telefono!: string;

  @Column({ default: "0", type: "varchar" })
  correo!: string;

  @Column({ default: true, type: "boolean" })
  active!: boolean;

  @Column({ default: false, type: "boolean" })
  esContribuyente!: boolean;

  @Column({ type: "int" })
  emisorId!: number;

  @Column({ type: "varchar" })
  departamento!: string;

  @Column({ type: "varchar" })
  nombreDepartamento!: string;

  @Column({ type: "varchar" })
  municipio!: string;

  @Column({ type: "varchar" })
  nombreMunicipio?: string;

  @Column({ type: "varchar" })
  complemento!: string;

  @Column({ type: "varchar", default: "N/A" })
  tipoContribuyente!: string;
}
