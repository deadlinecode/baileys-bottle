import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@adiwajshing/baileys";
import log from "@adiwajshing/baileys/lib/Utils/logger";
import BaileysBottle from "..";
import { Boom } from "@hapi/boom";

const main = async () => {
  const logger = log.child({});
  logger.level = "silent";

  const { auth, store } = await BaileysBottle({
    type: "sqlite",
    database: "db.sqlite",
  });

  const { state, saveState } = await auth.useAuthHandle();

  const startSocket = async () => {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

    const sock = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: state,
      logger,
    });

    store.bind(sock.ev);

    sock.ev.process(
     async (events) => {

      //
      // Start your bot code here...
      //
      if(events['messages.upsert']) {
				const upsert = events['messages.upsert'];
				console.log('recv messages ', JSON.stringify(upsert, undefined, 2));
				if(upsert.type === 'notify') {
					for(const msg of upsert.messages) {
						if(!msg.key.fromMe) {
              // mark message as read
							await sock!.readMessages([msg.key]);
						}
					}
				}
			}
      //
      // End your bot code here...
      //

      // credentials updated -- save them
			if(events['creds.update']) saveState();
			

      if(events['connection.update']) {
        const update = events['connection.update'];
				const { connection, lastDisconnect } = update;
        connection === "open"
        ? console.log("Connected")
        : connection === "close"
        ? (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut
          ? startSocket()
          : console.log("Connection closed. You are logged out.")
        : null;
      }
    });
  };

  startSocket();
};

main();
