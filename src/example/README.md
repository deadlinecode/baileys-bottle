# Baileys Bottle Example

## General stuff

Baileys-Bottle main features are:

- Store the data from your bot into a DB
- Use multiple instances at once (will be saved in the same db and tables)
- Block delete events for chat and messages so that they don't get deleted

If you have a feature request feel free [to open a ticket](https://github.com/deadlinecode/baileys-bottle/issues/new/choose)

## A working example and some information on how to use this package

In the [example.ts file](https://github.com/deadlinecode/baileys-bottle/blob/master/src/example/example.ts) you can find a working implementation of this package.<br/>
You can also find some information on the internals under this section.<br/>
I tried to keep things as similar to baileys makeInMemoryStore as far as using the functions goes.<br/>
Please also note that for some types of database (like sqlite) you will have to install a separate package. You can find out which package you need by [reading through the typeorm documentation](https://typeorm.io/#installation) (look under "4.") or just wait for the error from typeorm which will most likely tell you that you are missing the corresponding package and shows you how you can install it.

## What has changed

### Initializing stuff

<br/>
Since the database implementation is mostly async we need to init things a lil different.
<br/>
<br/>
For creating a instance of baileys bottle we need to:

1. await the `BaileysBottle.init(dbOptions)` function by putting our db connection infos into it
2. await the creation of a store (`bottle.createStore(storeName)`) by also passing a name for that store because we can create multiple stores
3. await `auth.useAuthHandle` because it needs to check if we already have auth infos available and load them

This can be done like this:

```ts
import BaileysBottle from "baileys-bottle";
// Or for my js homies:
const BaileysBottle = require("baileys-bottle");

// Initializing the DB (connecting / creating tables)
BaileysBottle.init({
  type: "sqlite",
  database: "db.sqlite",
}).then(async (bottle) => {
  // DB initialized
  // Creating a store
  const { auth, store } = await bottle.createStore("store name");

  // Store created
  // Getting the auth handlers
  const { state, saveState } = await auth.useAuthHandle();
});
```

The best place to put this is at the top of your file and put the startSocket method inside of the resolved init promise after our `createStore` and `useAuthHandle` are called (like shown in the example).<br/><br/>
The options that are passed into the function are actually just typeorm options so you can [read the specific ones for your database here](https://typeorm.io/data-source-options#mysql--mariadb-data-source-options).<br/>
Just scroll down till you find your preferred DB type and fill in the informations into the option object.<br/>
You don't need to fill in stuff like entities since they will be overwritten by the package.<br/><br/>

If you want to get debug output in case something doesn't work, you can just use the second argument in the function like this:

```ts
// ...
BaileysBottle.init(
  {
    type: "sqlite",
    database: "db.sqlite",
  },
  {
    debug: true,
  }
).then(async (bottle) => {
// ...
```

Another thing that i added is you can disable deletion events on `chat` and `messages` events by doing this:

```ts
// ...
  const { auth, store } = await bottle.createStore("store name", {
    disableDelete: ["chats"],
    // or
    disableDelete: ["messages"],
    // or 
    disableDelete: ["chats", "messages"],
  });
// ...
```

### Now for the store thing...

Like i already said i tried keeping everything as similar as possible to baileys so the

```ts
store.bind(sock.ev);
```

and

```ts
sock.ev.on("creds.update", saveState);
```

parts work just like before.<br/><br/>

What mby will be a lil bit more difficult is the part where we actually use the store since its async.<br/>

For the fetch methods like `store.fetchGroupMetadata` or `store.loadMessages` its the same as in baileys.<br/><br/>

When we take a look at the stuff that directly reads from the store we notice that some things changed.<br/>
But don't worry they are not that complicated.<br/><br/>
Basically you have stuff like `store.chats` or `store.contacts` but instead of just indexing them you now have `all` and `id` functions that take the same thing as the index type or get function in the baileys memory store take.

So for `store.chats.get("id")` you now do `await store.chats.id("id")`<br/> and for stuff like `store.presence["chatJid"]["participantJid"]` or `store.messages["chatJid"].get("msgId")` you now have to do `await store.presence.id("chatJid", "participantJid")` and `await store.messages("chatJid", "msgId")`.

Please note the `await` since every transaction to the DB is async and if you don't await it you only get a unresolved promise in return.<br/><br/>
Another thing to notice:<br/>You also have a `all` function on every store function that works just like the `id` function except -1 argument. As you can already imagine this will return all results instead of only one specific one.

## What if i want to tinker with the typeorm instance

If you want to use the DataSource instance that baileys-bottle uses to for example also add your own tables and stuff to your database you can do that easily.
Since v2.1.0 baileys-bottle not only exposes _ds (the DataSource object) on the object that is returned by `createStore()` but also let's you overwrite all typeorm options when creating the data source (except the tables that are needed for baileys-bottle to work).

So for example you can just
```ts
// ...
BaileysBottle.init(
  {
    type: "sqlite",
    database: "db.sqlite",
    // entities will be added to the ones baileys-bottle needs
    entities: [MyOwnTableEntity]
  },
  {
    debug: true,
  }
).then(async (bottle) => {
// ...
```
And then you can just
```ts
  const { auth, store, _ds } = await bottle.createStore("store name");
  const rows = await _ds.getRepository(MyOwnTableEntity).find();
```

If you wanna know how to work with typeorm, you can just [look at their documentation](https://typeorm.io).

## So thats it

### Oh wait its not lol im stpd

Another thing to note is if the data structure changes we will try to make migrations so your data can move between versions.<br/>However this is currently not implemented and we will have to see about that since i am doing all of this in my spare time and still have to figure a few things out.<br/>
Another thing to note: i didn't make the table rows really "unique" which for example means that one chat can exist one or more times. However the id function only returns the first matching chat so to get all existing chats with the same id you would have to use the all function.

I know i know i already wrote it down and it will hopefully be fixed in the future.

So now thats it.<br/><br/>
You should now be able to implement the baileys bottle data store and connect it to your db.<br/>
Have fun :3
