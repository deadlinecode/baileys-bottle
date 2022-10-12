import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Message } from "./Message";

@Entity()
@Unique(["id"])
export class MessageDic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jid: string;

  @OneToMany(() => Message, (x) => x.dictionary, {
    onDelete: "CASCADE",
  })
  messages: Message[];
}
