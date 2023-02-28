import { DataSource, DataSourceOptions } from "typeorm";
import AuthHandle from "./bottle/AuthHandle";
import StoreHandle, { StoreHandleOptions } from "./bottle/StoreHandle";
import DB from "./DB";
import { Auth } from "./entity/Auth";
class BaileysBottle {
  static instance = new BaileysBottle();
  private constructor() {}

  private createStore = async (
    ds: DataSource,
    storeName: string,
    options?: StoreHandleOptions
  ) => {
    var store = await ds.getRepository(Auth).findOne({
      where: { key: storeName },
    });
    if (!store)
      store = await ds.getRepository(Auth).save({
        key: storeName,
        value: "",
        chats: [],
        contacts: [],
        groups: [],
        messageDics: [],
        presenceDics: [],
      });
    return {
      auth: new AuthHandle(ds, storeName),
      store: new StoreHandle(ds, store, options),
      _ds: ds,
    };
  };

  init = async (
    db: DataSourceOptions,
    options?: {
      debug?: boolean;
      sync?: boolean;
    }
  ): Promise<{
    createStore: (
      storeName?: string,
      storeOptions?: StoreHandleOptions
    ) => Promise<{ auth: AuthHandle; store: StoreHandle; _ds: DataSource }>;
  }> => ({
    createStore: async (...args: any[]) =>
      this.createStore.apply(null, [await DB.get(db, options), ...args]),
  });
}

export default BaileysBottle.instance;
