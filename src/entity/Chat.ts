import { proto } from "@whiskeysockets/baileys";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
} from "typeorm";
import { Auth } from "./Auth";

@Entity()
@Unique(["DBId", "id"])
export class Chat {
  @PrimaryGeneratedColumn()
  DBId: number;

  @ManyToOne(() => Auth, (auth) => auth.chats, { onDelete: "CASCADE" })
  DBAuth: Auth;

  @Column()
  id: string;

  @Column({ nullable: true, type: "simple-json" })
  messages?: proto.IHistorySyncMsg[] | null;

  @Column({ nullable: true })
  newJid?: string | null;

  @Column({ nullable: true })
  oldJid?: string | null;

  @Column({ nullable: true, type: "simple-json" })
  lastMsgTimestamp?: number | Long | null;

  @Column({ nullable: true })
  unreadCount?: number | null;

  @Column({ nullable: true })
  readOnly?: boolean | null;

  @Column({ nullable: true })
  endOfHistoryTransfer?: boolean | null;

  @Column({ nullable: true })
  ephemeralExpiration?: number | null;

  @Column({ nullable: true, type: "simple-json" })
  ephemeralSettingTimestamp?: number | Long | null;

  @Column({ nullable: true, type: "simple-json" })
  endOfHistoryTransferType?: proto.Conversation.EndOfHistoryTransferType | null;

  @Column({ nullable: true, type: "simple-json" })
  conversationTimestamp?: number | Long | null;

  @Column({ nullable: true })
  name?: string | null;

  @Column({ nullable: true })
  pHash?: string | null;

  @Column({ nullable: true })
  notSpam?: boolean | null;

  @Column({ nullable: true })
  archived?: boolean | null;

  @Column({ nullable: true, type: "simple-json" })
  disappearingMode?: proto.IDisappearingMode | null;

  @Column({ nullable: true })
  unreadMentionCount?: number | null;

  @Column({ nullable: true })
  markedAsUnread?: boolean | null;

  @Column({ nullable: true, type: "simple-json" })
  participant?: proto.IGroupParticipant[] | null;

  @Column({ nullable: true, type: "simple-array" })
  tcToken?: Uint8Array | null;

  @Column({ nullable: true, type: "simple-json" })
  tcTokenTimestamp?: number | Long | null;

  @Column({ nullable: true, type: "simple-array" })
  contactPrimaryIdentityKey?: Uint8Array | null;

  @Column({ nullable: true })
  pinned?: number | null;

  @Column({ nullable: true, type: "simple-json" })
  muteEndTime?: number | Long | null;

  @Column({ nullable: true, type: "simple-json" })
  wallpaper?: proto.IWallpaperSettings | null;

  @Column({ nullable: true, type: "integer" })
  mediaVisibility?: proto.MediaVisibility | null;

  @Column({ nullable: true, type: "simple-json" })
  tcTokenSenderTimestamp?: number | Long | null;

  @Column({ nullable: true })
  suspended?: boolean | null;

  @Column({ nullable: true })
  terminated?: boolean | null;

  @Column({ nullable: true, type: "simple-json" })
  createdAt?: number | Long | null;

  @Column({ nullable: true })
  createdBy?: string | null;

  @Column({ nullable: true, type: "text" })
  description?: string | null;

  @Column({ nullable: true })
  support?: boolean | null;

  @Column({ nullable: true })
  isParentGroup?: boolean | null;

  @Column({ nullable: true })
  isDefaultSubgroup?: boolean | null;

  @Column({ nullable: true })
  parentGroupId?: string | null;

  @Column({ nullable: true })
  displayName?: string | null;

  @Column({ nullable: true })
  pnJid?: string | null;

  @Column({ nullable: true })
  selfMasked?: boolean | null;

  @Column({ nullable: true })
  mute?: number | null;

  @Column({ nullable: true, type: "bigint" })
  pin?: number | null;

  @Column({ nullable: true })
  archive?: boolean;
}
