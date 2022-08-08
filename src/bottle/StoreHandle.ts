import makeWASocket, {
  BaileysEventEmitter,
  ConnectionState,
  jidNormalizedUser,
  toNumber,
  updateMessageWithReceipt,
  updateMessageWithReaction,
  WAMessageKey,
  WAMessageCursor,
  WAMessage,
  makeWALegacySocket,
} from "@adiwajshing/baileys";
import { Chat as DBChat } from "../entity/Chat";
import { Contact as DBContact } from "../entity/Contact";
import { Message as DBMessage } from "../entity/Message";
import { MessageDic as DBMessageDic } from "../entity/MessageDic";
import { PresenceDic as DBPresenceDic } from "../entity/PresenceDic";
import { GroupMetadata as DBGroupMetadata } from "../entity/GroupMetadata";
import { DataSource } from "typeorm";

export default class StoreHandle {
  constructor(private ds: DataSource) {}

  state: ConnectionState = { connection: "close" };

  chats = {
    all: () => this.ds.getRepository(DBChat).find(),
    id: (id: string) =>
      this.ds.getRepository(DBChat).findOneBy({
        id,
      }),
  };

  contacts = {
    all: () => this.ds.getRepository(DBContact).find(),
    id: (id: string) => this.ds.getRepository(DBContact).findOneBy({ id }),
  };

  messages = {
    all: async (jid: string) =>
      (
        await this.ds.getRepository(DBMessageDic).findOne({
          where: {
            jid,
          },
          relations: ["messages"],
        })
      ).messages,
    id: async (jid: string, msgId: string) =>
      (
        await this.ds.getRepository(DBMessageDic).findOne({
          where: {
            jid,
          },
          relations: ["messages"],
        })
      ).messages.find((x) => x.msgId === msgId),
  };

  groupMetadata = {
    all: () => this.ds.getRepository(DBGroupMetadata).find(),
    id: (id: string) =>
      this.ds.getRepository(DBGroupMetadata).findOneBy({
        id,
      }),
  };

  presence = {
    all: (id: string) =>
      this.ds.getRepository(DBPresenceDic).findOne({
        where: {
          id,
        },
        relations: ["presences"],
      }),
    id: async (id: string, participant: string) =>
      (
        await this.ds.getRepository(DBPresenceDic).findOne({
          where: {
            id,
          },
          relations: ["presences"],
        })
      ).presences.find((x) => x.participant === participant),
  };

  loadMessages = async (
    jid: string,
    count: number,
    cursor: WAMessageCursor,
    sock: ReturnType<typeof makeWALegacySocket>
  ) => {
    var dictionary = await this.ds.getRepository(DBMessageDic).findOne({
      where: {
        jid,
      },
      relations: ["messages"],
    });
    if (!dictionary)
      return await this.ds.getRepository(DBMessageDic).save({
        jid,
        messages: [],
      });

    const retrieve = async (count: number, cursor: WAMessageCursor) =>
      (await sock?.fetchMessagesFromWA(jid, count, cursor)) || [];

    const mode = !cursor || "before" in cursor ? "before" : "after";
    const cursorKey = !!cursor
      ? "before" in cursor
        ? cursor.before
        : cursor.after
      : undefined;
    const cursorValue = cursorKey
      ? dictionary.messages.find((x) => x.msgId === cursorKey.id!)
      : undefined;

    let messages: WAMessage[];
    if (dictionary && mode === "before" && (!cursorKey || cursorValue)) {
      if (cursorValue) {
        const msgIdx = dictionary.messages.findIndex(
          (m) => m.key.id === cursorKey?.id
        );
        messages = dictionary.messages.slice(0, msgIdx) as WAMessage[];
      } else {
        messages = dictionary.messages as WAMessage[];
      }

      const diff = count - messages.length;
      if (diff < 0) {
        messages = messages.slice(-count);
      } else if (diff > 0) {
        const [fMessage] = messages;
        const cursor = { before: fMessage?.key || cursorKey };
        const extra = await retrieve(diff, cursor);
        
        for (let i = extra.length - 1; i >= 0; i--) {
          let message: DBMessage;
          if (
            !(message = dictionary.messages.find(
              (x) => x.key.id === extra[i].key.id
            ))
          )
            return await this.ds.getRepository(DBMessage).save({
              ...(extra[i] as any),
              msgId: extra[i].key?.id,
              dictionary,
            });
          Object.assign(message, extra[i]);
          await this.ds.getRepository(DBMessageDic).save(dictionary);
        }

        messages.splice(0, 0, ...extra);
      }
    } else {
      messages = (await retrieve(count, cursor)) as any;
    }

    return messages;
  };

  loadMessage = async (
    jid: string,
    id: string,
    sock: ReturnType<typeof makeWALegacySocket>
  ) => {
    var dictionary = await this.ds.getRepository(DBMessageDic).findOne({
      where: {
        jid,
      },
      relations: ["messages"],
    });
    var message = dictionary?.messages.find((x) => x.msgId === id);
    !message &&
      this.ds.getRepository(DBMessage).save({
        ...(await sock.loadMessageFromWA(jid, id)),
        dictionary,
      });
    return await this.loadMessage(jid, id, sock);
  };

  mostRecentMessage = async (
    jid: string,
    sock: ReturnType<typeof makeWALegacySocket>
  ) => {
    var dictionary = await this.ds.getRepository(DBMessageDic).findOne({
      where: {
        jid,
      },
      relations: ["messages"],
    });
    var message = dictionary?.messages.slice(-1)[0];
    if (!message) {
      var items = await sock.fetchMessagesFromWA(jid, 1, undefined);
      if (!items?.[0]) return;
      this.ds.getRepository(DBMessage).save({
        ...items[0],
        dictionary,
      });
    }
    return await this.mostRecentMessage(jid, sock);
  };

  fetchImageUrl = async (
    jid: string,
    sock: ReturnType<typeof makeWASocket>
  ): Promise<string> => {
    var img = (
      await this.ds.getRepository(DBContact).findOneBy({
        id: jid,
      })
    )?.imgUrl;
    !img &&
      (await this.ds.getRepository(DBContact).update(
        {
          id: jid,
        },
        {
          imgUrl: (img = await sock.profilePictureUrl(jid)),
        }
      ));
    return img;
  };

  fetchGroupMetadata = async (
    jid: string,
    sock: ReturnType<typeof makeWASocket>
  ): Promise<DBGroupMetadata> => {
    var metadata = await this.ds.getRepository(DBGroupMetadata).findOneBy({
      id: jid,
    });
    !metadata &&
      (await this.ds.getRepository(DBGroupMetadata).insert({
        ...(await sock.groupMetadata(jid)),
      }));
    return this.fetchGroupMetadata(jid, sock);
  };

  fetchBroadcastListInfo = async (
    jid: string,
    sock: ReturnType<typeof makeWALegacySocket>
  ) => {
    var metadata = await this.ds.getRepository(DBGroupMetadata).findOneBy({
      id: jid,
    });
    !metadata &&
      (await this.ds.getRepository(DBGroupMetadata).insert({
        ...(await sock.getBroadcastListInfo(jid)),
      }));
    return await this.fetchBroadcastListInfo(jid, sock);
  };

  fetchMessageReceipts = async (
    { remoteJid, id }: WAMessageKey,
    sock: ReturnType<typeof makeWALegacySocket>
  ) => {
    // const list = messages[remoteJid!];
    const list = await this.ds.getRepository(DBMessageDic).findOne({
      where: {
        jid: remoteJid!,
      },
      relations: ["messages"],
    });
    const msg = list.messages.find((x) => x.msgId === id);
    let receipts = msg?.userReceipt;
    if (!receipts) {
      receipts = await sock?.messageInfo(remoteJid!, id!);
      if (msg) {
        msg.userReceipt = receipts;
        await this.ds.getRepository(DBMessage).save(msg);
      }
    }

    return receipts;
  };

  bind = (ev: BaileysEventEmitter) => {
    ev.on("connection.update", (update) => Object.assign(this.state, update));
    ev.on("chats.set", async ({ chats: newChats, isLatest }) => {
      isLatest &&
        (await this.ds
          .getRepository(DBChat)
          .createQueryBuilder()
          .delete()
          .execute());

      await this.ds.getRepository(DBChat).insert(newChats as any);
    });
    ev.on("contacts.set", ({ contacts: newContacts }) =>
      this.ds.getRepository(DBContact).upsert(newContacts, {
        conflictPaths: ["id"],
      })
    );
    ev.on("messages.set", async ({ messages: newMessages, isLatest }) => {
      if (isLatest) {
        const dic = await this.ds.getRepository(DBMessageDic).find({
          relations: ["messages"],
        });
        await Promise.all(
          dic.map(
            async (x) =>
              await this.ds.getRepository(DBMessage).remove(x.messages)
          )
        );
        await this.ds.getRepository(DBMessageDic).remove(dic);
      }

      for (const msg of newMessages) {
        const jid = msg.key.remoteJid!;
        var dictionary = await this.ds.getRepository(DBMessageDic).findOne({
          where: {
            jid,
          },
          relations: ["messages"],
        });
        if (!dictionary)
          return await this.ds.getRepository(DBMessageDic).save({
            jid,
            messages: [{ ...(msg as any), msgId: msg.key?.id }],
          });

        let message: DBMessage;
        if (
          !(message = dictionary.messages.find((x) => x.key.id === msg.key.id))
        )
          return await this.ds.getRepository(DBMessage).save({
            ...(msg as any),
            msgId: msg.key?.id,
            dictionary,
          });
        Object.assign(message, msg);
        await this.ds.getRepository(DBMessageDic).save(dictionary);
      }
    });
    ev.on("contacts.update", async (updates) => {
      for (const update of updates) {
        let contact: DBContact;
        if (
          (contact = await this.ds.getRepository(DBContact).findOneBy({
            id: update.id!,
          }))
        ) {
          Object.assign(contact, update);
          await this.ds.getRepository(DBContact).save(contact);
        }
      }
    });
    ev.on("chats.upsert", (newChats) =>
      this.ds.getRepository(DBChat).upsert(newChats as any, {
        conflictPaths: ["id"],
      })
    );
    ev.on("chats.update", async (updates) => {
      for (let update of updates) {
        var chat = await this.ds.getRepository(DBChat).findOneBy({
          id: update.id!,
        });
        if (!chat) return;
        if (update.unreadCount! > 0) {
          update = { ...update };
          update.unreadCount = (chat.unreadCount || 0) + update.unreadCount!;
        }

        Object.assign(chat, update);
        await this.ds.getRepository(DBChat).save(chat);
      }
    });
    ev.on("presence.update", async ({ id, presences: update }) => {
      var chat =
        (await this.ds.getRepository(DBPresenceDic).findOne({
          where: {
            id,
          },
          relations: ["presences"],
        })) ||
        ({
          id,
          presences: [],
        } as DBPresenceDic);

      Object.entries(update).forEach(([id, presence]) => {
        var participant = chat.presences.find((x) => x.participant === id);
        participant
          ? Object.assign(participant, presence)
          : chat.presences.push({
              ...presence,
              participant: id,
            } as any);
      });

      try {
        await this.ds.getRepository(DBPresenceDic).save(chat);
      } catch {}
    });
    ev.on("chats.delete", async (deletions) => {
      for (const item of deletions) {
        await this.ds.getRepository(DBChat).delete({
          id: item,
        });
      }
    });
    ev.on("messages.upsert", async ({ messages: newMessages, type }) => {
      switch (type) {
        case "append":
        case "notify":
          for (const msg of newMessages) {
            const jid = jidNormalizedUser(msg.key.remoteJid!);

            var dictionary = await this.ds.getRepository(DBMessageDic).findOne({
              where: {
                jid,
              },
              relations: ["messages"],
            });
            if (!dictionary)
              return await this.ds.getRepository(DBMessageDic).save({
                jid,
                messages: [{ ...(msg as any), msgId: msg.key?.id }],
              });

            let message: DBMessage;
            if (
              !(message = dictionary.messages.find(
                (x) => x.key.id === msg.key.id
              ))
            )
              return await this.ds.getRepository(DBMessage).save({
                ...(msg as any),
                msgId: msg.key?.id,
                dictionary,
              });
            Object.assign(message, msg);
            await this.ds.getRepository(DBMessageDic).save(dictionary);

            if (type === "notify") {
              if (
                !(await this.ds.getRepository(DBChat).findOneBy({
                  id: jid,
                }))
              ) {
                ev.emit("chats.upsert", [
                  {
                    id: jid,
                    conversationTimestamp: toNumber(msg.messageTimestamp),
                    unreadCount: 1,
                  },
                ]);
              }
            }
          }
          break;
      }
    });
    ev.on("messages.update", async (updates) => {
      for (const { update, key } of updates) {
        var dictionary = await this.ds.getRepository(DBMessageDic).findOne({
          where: {
            jid: key.remoteJid!,
          },
          relations: ["messages"],
        });
        if (!dictionary)
          return await this.ds.getRepository(DBMessageDic).save({
            jid: key.remoteJid!,
            messages: [update as any],
          });

        let message: DBMessage;
        if (!(message = dictionary.messages.find((x) => x.key.id === key.id)))
          return;
        Object.assign(message, update);
        await this.ds.getRepository(DBMessageDic).save(dictionary);
      }
    });

    ev.on("groups.update", async (updates) => {
      for (const update of updates) {
        const id = update.id!;
        let groupMetadata = await this.ds
          .getRepository(DBGroupMetadata)
          .findOneBy({ id });
        if (!groupMetadata) return;
        Object.assign(groupMetadata, update);
        await this.ds.getRepository(DBGroupMetadata).save(groupMetadata);
      }
    });

    ev.on("group-participants.update", async ({ id, participants, action }) => {
      const metadata = await this.ds
        .getRepository(DBGroupMetadata)
        .findOneBy({ id });
      if (!metadata) return;
      switch (action) {
        case "add":
          metadata.participants.push(
            ...participants.map((id) => ({
              id,
              isAdmin: false,
              isSuperAdmin: false,
            }))
          );
          break;
        case "demote":
        case "promote":
          for (const participant of metadata.participants) {
            if (participants.includes(participant.id)) {
              participant.isAdmin = action === "promote";
            }
          }

          break;
        case "remove":
          metadata.participants = metadata.participants.filter(
            (p) => !participants.includes(p.id)
          );
          break;
      }
      await this.ds.getRepository(DBGroupMetadata).save(metadata);
    });

    ev.on("message-receipt.update", async (updates) => {
      for (const { key, receipt } of updates) {
        const obj = await this.ds.getRepository(DBMessageDic).findOne({
          where: {
            jid: key.remoteJid!,
          },
          relations: ["messages"],
        });
        if (!obj) return;
        const msg = obj.messages.find((x) => x.key.id === key.id!);
        if (msg) {
          updateMessageWithReceipt(msg, receipt);
          await this.ds.getRepository(DBMessageDic).save(obj);
        }
      }
    });

    ev.on("messages.reaction", async (reactions) => {
      for (const { key, reaction } of reactions) {
        const obj = await this.ds.getRepository(DBMessageDic).findOne({
          where: {
            jid: key.remoteJid!,
          },
          relations: ["messages"],
        });
        if (!obj) return;
        const msg = obj.messages.find((x) => x.key.id === key.id!);
        if (msg) {
          updateMessageWithReaction(msg, reaction);
          await this.ds.getRepository(DBMessageDic).save(obj);
        }
      }
    });
  };
}
