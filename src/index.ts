import { DataSource, DataSourceOptions } from "typeorm";
import AuthHandle from "./bottle/AuthHandle";
import StoreHandle from "./bottle/StoreHandle";
import { Auth } from "./entity/Auth";
import { Chat } from "./entity/Chat";
import { Contact } from "./entity/Contact";
import { GroupMetadata } from "./entity/GroupMetadata";
import { Message } from "./entity/Message";
import { MessageDic } from "./entity/MessageDic";
import { Presence } from "./entity/Presence";
import { PresenceDic } from "./entity/PresenceDic";

class BaileysBottle {
  static instance = new BaileysBottle();
  private constructor() {}
  init = async (
    db: DataSourceOptions,
    options?: {
      debug?: boolean;
      sync?: boolean;
    }
  ): Promise<{ auth: AuthHandle; store: StoreHandle }> => {
    const ds = await new DataSource({
      ...db,
      entities: [
        Auth,
        Chat,
        Contact,
        GroupMetadata,
        MessageDic,
        Message,
        PresenceDic,
        Presence,
      ],
      synchronize: options?.sync,
      migrations: [],
      logging: options?.debug,
    }).initialize();
    try {
      await ds.getRepository(Auth).find();
    } catch {
      return await this.init(db, { sync: true, ...options });
    }
    return { auth: new AuthHandle(ds), store: new StoreHandle(ds)};
  };
}

export default BaileysBottle.instance.init;
