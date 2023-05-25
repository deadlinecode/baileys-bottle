import { proto } from "@whiskeysockets/baileys";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { MessageDic } from "./MessageDic";

@Entity()
@Unique(["id"])
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  msgId: string;

  @Column({ nullable: true, type: "simple-json" })
  key?: proto.IMessageKey;

  @ManyToOne(() => MessageDic, (x) => x.messages, {
    onDelete: "CASCADE",
  })
  dictionary: MessageDic;

  @Column({ nullable: true, type: "simple-json" })
  message?: proto.IMessage | null;

  @Column({ nullable: true, type: "simple-json" })
  messageTimestamp?: number | Long | null;

  @Column({ nullable: true, type: "simple-json" })
  status?: proto.WebMessageInfo.Status | null;

  @Column({ nullable: true })
  participant?: string | null;

  @Column({ nullable: true, type: "simple-json" })
  messageC2STimestamp?: number | Long | null;

  @Column({ nullable: true })
  ignore?: boolean | null;

  @Column({ nullable: true })
  starred?: boolean | null;

  @Column({ nullable: true })
  broadcast?: boolean | null;

  @Column({ nullable: true })
  pushName?: string | null;

  @Column({ nullable: true, type: "simple-array" })
  mediaCiphertextSha256?: Uint8Array | null;

  @Column({ nullable: true })
  multicast?: boolean | null;

  @Column({ nullable: true })
  urlText?: boolean | null;

  @Column({ nullable: true })
  urlNumber?: boolean | null;

  @Column({ nullable: true, type: "integer" })
  messageStubType?: proto.WebMessageInfo.StubType | null;

  @Column({ nullable: true })
  clearMedia?: boolean | null;

  @Column({ nullable: true, type: "simple-array" })
  messageStubParameters?: string[] | null;

  @Column({ nullable: true })
  duration?: number | null;

  @Column({ nullable: true, type: "simple-array" })
  labels?: string[] | null;

  @Column({ nullable: true, type: "simple-json" })
  paymentInfo?: proto.IPaymentInfo | null;

  @Column({ nullable: true, type: "simple-json" })
  finalLiveLocation?: proto.Message.LiveLocationMessage | null;

  @Column({ nullable: true, type: "simple-json" })
  quotedPaymentInfo?: proto.IPaymentInfo | null;

  @Column({ nullable: true, type: "simple-json" })
  ephemeralStartTimestamp?: number | Long | null;

  @Column({ nullable: true })
  ephemeralDuration?: number | null;

  @Column({ nullable: true })
  ephemeralOffToOn?: boolean | null;

  @Column({ nullable: true })
  ephemeralOutOfSync?: boolean | null;

  @Column({ nullable: true, type: "integer" })
  bizPrivacyStatus?: proto.WebMessageInfo.BizPrivacyStatus | null;

  @Column({ nullable: true })
  verifiedBizName?: string | null;

  @Column({ nullable: true, type: "simple-json" })
  mediaData?: proto.IMediaData | null;

  @Column({ nullable: true, type: "simple-json" })
  photoChange?: proto.IPhotoChange | null;

  @Column({ nullable: true, type: "simple-json" })
  userReceipt?: proto.IUserReceipt[] | null;

  @Column({ nullable: true, type: "simple-json" })
  reactions?: proto.IReaction[] | null;

  @Column({ nullable: true, type: "simple-json" })
  quotedStickerData?: proto.IMediaData | null;

  @Column({ nullable: true, type: "simple-array" })
  futureproofData?: Uint8Array | null;

  @Column({ nullable: true, type: "simple-json" })
  statusPsa?: proto.IStatusPSA | null;

  @Column({ nullable: true, type: "simple-json" })
  pollUpdates?: proto.IPollUpdate[] | null;

  @Column({ nullable: true, type: "simple-json" })
  pollAdditionalMetadata?: proto.IPollAdditionalMetadata | null;

  @Column({ nullable: true })
  agentId?: string | null;

  @Column({ nullable: true })
  statusAlreadyViewed?: boolean | null;

  @Column({ nullable: true, type: "simple-array" })
  messageSecret?: Uint8Array | null;

  @Column({ nullable: true, type: "simple-json" })
  keepInChat?: proto.IKeepInChat | null;

  @Column({ nullable: true })
  originalSelfAuthorUserJidString?: string | null;

  @Column({ nullable: true, type: "simple-json" })
  revokeMessageTimestamp?: number | Long | null;
}
