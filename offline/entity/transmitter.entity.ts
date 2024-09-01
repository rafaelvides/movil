import { Column, Entity, PrimaryGeneratedColumn } from "typeorm/browser";

@Entity("transmitter")
export class Transmitter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  transmitterId!: number;

  @Column({ type: "varchar" })
  clavePrivada!: string;

  @Column({ type: "varchar" })
  clavePublica!: string;

  @Column({ type: "varchar" })
  nit!: string;

  @Column({ type: "varchar", nullable: true })
  nrc!: string;

  @Column({ type: "varchar" })
  nombre!: string;

  @Column({ type: "varchar" })
  telefono!: string;

  @Column({ type: "varchar" })
  correo!: string;

  @Column({ type: "varchar" })
  descActividad!: string;

  @Column({ type: "varchar" })
  codActividad!: string;

  @Column({ type: "varchar" })
  nombreComercial!: string;

  @Column({ type: "varchar" })
  departamento!: string;

  @Column({ type: "varchar" })
  municipio!: string;

  @Column({ type: "varchar" })
  complemento!: string;
}
