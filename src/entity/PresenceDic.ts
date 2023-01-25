import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Auth } from "./Auth";
import { Presence } from "./Presence";

@Entity()
@Unique(["DBId"])
export class PresenceDic {
  @PrimaryGeneratedColumn()
  DBId: number;

  @ManyToOne(() => Auth, (auth) => auth.chats, { onDelete: "CASCADE" })
  DBAuth: Auth;

  @Column()
  id: string;

  @OneToMany(() => Presence, (x) => x.dictionary, {
    cascade: true,
    onDelete: "CASCADE",
  })
  presences: Presence[];
}
