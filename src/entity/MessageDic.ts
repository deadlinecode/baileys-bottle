import { Column, Entity, OneToMany, PrimaryColumn, Unique } from "typeorm";
import { Message } from "./Message";

@Entity()
@Unique(["id"])
export class MessageDic {
  @PrimaryColumn()
  id: number;

  @Column()
  jid: string;

  @OneToMany(() => Message, (x) => x.dictionary, {
    cascade: true,
    onDelete: "CASCADE",
  })
  messages: Message[];
}
