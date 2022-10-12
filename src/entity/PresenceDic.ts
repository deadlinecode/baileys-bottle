import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Presence } from "./Presence";

@Entity()
@Unique(["DBId"])
export class PresenceDic {
  @PrimaryGeneratedColumn()
  DBId: number;

  @Column()
  id: string;

  @OneToMany(() => Presence, (x) => x.dictionary, {
    cascade: true,
    onDelete: "CASCADE",
  })
  presences: Presence[];
}
