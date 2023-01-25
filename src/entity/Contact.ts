import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Auth } from "./Auth";

@Entity()
@Unique(["DBId", "id"])
export class Contact {
  @PrimaryGeneratedColumn()
  DBId: number;

  @ManyToOne(() => Auth, (auth) => auth.chats, { onDelete: "CASCADE" })
  DBAuth: Auth;

  @Column({ unique: true })
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  notify?: string;

  @Column({ nullable: true })
  verifiedName?: string;

  @Column({ nullable: true })
  imgUrl?: string | "changed";

  @Column({ nullable: true })
  status?: string;
}
