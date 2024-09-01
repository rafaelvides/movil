import {
  ManyToOne,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm/browser";
import { Transmitter } from "./transmitter.entity";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  userId!: number;

  @Column({ type: "varchar" })
  token!: string;

  @Column({ type: "varchar", length: 255 })
  username!: string;

  @Column({ type: "varchar" })
  rolName!: string;

  @Column({ type: "int" })
  rolId!: number;

  @Column({ type: "varchar" })
  password!: string;

  @Column({ type: "int", default: 0 })
  BoxId!: number;

  @ManyToOne(() => Transmitter)
  transmitter!: Transmitter;

  @RelationId((user: User) => user.transmitter)
  transmitterId!: number;
}
