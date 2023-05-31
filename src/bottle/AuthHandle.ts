import {
  AuthenticationCreds,
  AuthenticationState,
  BufferJSON,
  initAuthCreds,
  proto,
  SignalDataTypeMap,
} from "@whiskeysockets/baileys";
import { DataSource } from "typeorm";
import { Auth } from "../entity/Auth";

const KEY_MAP: { [T in keyof SignalDataTypeMap]: string } = {
  "pre-key": "preKeys",
  session: "sessions",
  "sender-key": "senderKeys",
  "app-state-sync-key": "appStateSyncKeys",
  "app-state-sync-version": "appStateVersions",
  "sender-key-memory": "senderKeyMemory",
};

export default class AuthHandle {
  constructor(private ds: DataSource, private key: string) {}
  private repos = {
    auth: this.ds.getRepository(Auth),
  };

  useAuthHandle = async (): Promise<{
    state: AuthenticationState;
    saveState: () => Promise<any>;
  }> => {
    let creds: AuthenticationCreds;
    let keys: any = {};

    var existingAuth = await this.repos.auth.findOneBy({
      key: this.key,
    });
    ({ creds, keys } =
      existingAuth && existingAuth.value
        ? JSON.parse(existingAuth.value, BufferJSON.reviver)
        : {
            creds: initAuthCreds(),
            keys: {},
          });

    const saveState = () =>
      this.repos.auth.upsert(
        {
          key: this.key,
          value: JSON.stringify({ creds, keys }, BufferJSON.replacer, 2),
        },
        {
          conflictPaths: ["key"],
        }
      );

    return {
      state: {
        creds,
        keys: {
          get: (type, ids) => {
            const key = KEY_MAP[type];
            return ids.reduce((dict, id) => {
              let value = keys[key]?.[id];
              if (value) {
                if (type === "app-state-sync-key")
                  value = proto.Message.AppStateSyncKeyData.fromObject(value);
                dict[id] = value;
              }
              return dict;
            }, {});
          },
          set: async (data) => {
            for (const _key in data) {
              const key = KEY_MAP[_key as keyof SignalDataTypeMap];
              keys[key] = keys[key] || {};
              Object.assign(keys[key], data[_key]);
            }

            await saveState();
          },
        },
      },
      saveState,
    };
  };
}
