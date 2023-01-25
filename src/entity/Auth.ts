import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Chat } from "./Chat";
import { Contact } from "./Contact";
import { GroupMetadata } from "./GroupMetadata";
import { MessageDic } from "./MessageDic";
import { PresenceDic } from "./PresenceDic";

@Entity()
@Unique(["key"])
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column({ type: "text" })
  value: string;

  @OneToMany(() => Chat, (chat) => chat.DBAuth)
  chats: Chat[];

  @OneToMany(() => Contact, (contact) => contact.DBAuth)
  contacts: Contact[];

  @OneToMany(() => GroupMetadata, (group) => group.DBAuth)
  groups: GroupMetadata[];

  @OneToMany(() => MessageDic, (messageDic) => messageDic.DBAuth)
  messageDics: MessageDic[];

  @OneToMany(() => PresenceDic, (presenceDic) => presenceDic.DBAuth)
  presenceDics: PresenceDic[];
}
