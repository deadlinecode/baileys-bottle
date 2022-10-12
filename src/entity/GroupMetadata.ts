import { GroupParticipant } from "@adiwajshing/baileys";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["DBId"])
export class GroupMetadata {
  @PrimaryGeneratedColumn()
  DBId: number;

  @Column()
  id: string;

  @Column({ nullable: true })
  owner: string | undefined;

  @Column()
  subject: string;

  @Column({ nullable: true })
  subjectOwner?: string;

  @Column({ nullable: true })
  subjectTime?: number;

  @Column({ nullable: true })
  creation?: number;

  @Column({ nullable: true })
  desc?: string;

  @Column({ nullable: true })
  descOwner?: string;

  @Column({ nullable: true })
  descId?: string;

  @Column({ nullable: true })
  restrict?: boolean;

  @Column({ nullable: true })
  announce?: boolean;

  @Column({ nullable: true })
  size?: number;

  @Column({ nullable: true, type: "simple-json" })
  participants: GroupParticipant[];

  @Column({ nullable: true })
  ephemeralDuration?: number;
}
