import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
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

    //
    // Start your bot code here...
    //
    sock.ev.on("messages.upsert", (m) => {
      m.messages.forEach(console.log);
    });
    //
    // End your bot code here...
    //

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) =>
      connection === "open"
        ? console.log("Connected")
        : connection === "close"
        ? (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut
          ? startSocket()
          : console.log("Connection closed. You are logged out.")
        : null
    );

    sock.ev.on("creds.update", saveState);
  };

  startSocket();
};

main();
