import { WAPresence } from "@adiwajshing/baileys";
import { Column, Entity, ManyToOne, PrimaryColumn, Unique } from "typeorm";
import { PresenceDic } from "./PresenceDic";

@Entity()
@Unique(["DBId"])
export class Presence {
  @PrimaryColumn()
  DBId: number;

  @ManyToOne(() => PresenceDic, (x) => x.presences)
  dictionary: PresenceDic;

  @Column()
  participant: string;

  @Column({ type: "simple-json" })
  lastKnownPresence: WAPresence;

  @Column({ nullable: true })
  lastSeen?: number;
}
