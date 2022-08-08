# Baileys Bottle Example

## A working example and some information on how to use this package

In the example.ts file you can find a working implementation of this package.<br/>
You can also find some information on the internals under this section.<br/>
I tried to keep things as similar to baileys makeInMemoryStore as far as using the functions goes.<br/>
Please also note that for some types of database (like sqlite) you will have to install a seperat package. You can find out which package you need by reading through the typeorm documentation or just wait for the error from typeorm which will most likely tell you that you are missing the corresponding package and shows you how you can install it.

## What has changed

### Initializing stuff

Since the database implementation is mostly async we need to init things a lil different.
For creating a instance of baileys bottle we need to await the BaileysBottle function by putting our db connection infos into it and then also await the auth part because it needs to check if we already have auth infos available.
This can be done like this

```ts
const { auth, store } = await BaileysBottle({
  type: "sqlite",
  database: "db.sqlite",
});

const { state, saveState } = await auth.useAuthHandle();
```

The best place to put this is before your startSocket function (like shown in the example).<br/>
The function will resolve after the DB is successfully connected and all necessary tables are verified.<br/>
The options that are passed into the function are actually just typeorm options so you can [read the specific ones for your database here](https://typeorm.io/data-source-options#mysql--mariadb-data-source-options).<br/>
Just scroll down till you find your preferred DB type and fill in the informations into the option object.<br/>
You don't need to fill in stuff like entities since they will be overwritten by the package.<br/>

If you want to get debug output in case something doesn't work, you can just use the second argument in the function like this:

```ts
const { auth, store } = await BaileysBottle(
  {
    type: "sqlite",
    database: "db.sqlite",
  },
  {
    debug: true,
  }
);

const { state, saveState } = await auth.useAuthHandle();
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

parts work just like before.

What mby will be a lil bit more difficult is the part where we actually use the store since its async.<br/><br/>

For the fetch methods like `store.fetchGroupMetadata` or `store.loadMessages` its the same as in baileys.

But when we take a look at the stuff that directly reads from the store we notice that some things changed.<br/>
But don't worry they are not that complicated.<br/>
Basically you have stuff like `store.chats` or `store.contacts` but instead of just indexing them you now have `all` and `id` functions that take the same thing as the index type or get function in the baileys memory store take.

So for `store.chats.get("id")` you now do `await store.chats.id("id")` and for stuff like `store.presence["chatJid"]["participantJid"]` or `store.messages["chatJid"].get("msgId")` you now have to do `await store.presence.id("chatJid", "participantJid")` and `await store.messages("chatJid", "msgId")`.

Please note the `await` since every transaction to the DB is async and if you don't await it you only get a unresolved promise in return.<br/>
Another thing to notice: You also have a `all` function on every store function that works just like the `id` function except -1 argument. As you can already imagine this will return all results instead of only one specific one.

## So thats it

### Oh wait its not lol im stpd
Another thing to note is if the data structure changes we will try to make migrations so your data can move between versions. However this is currently not implemented and we will have to see about that since i am doing all of this in my spare time and have to still figure a few things out. <br/>
Another thing to note: i didn't make the table rows really "unique" which for example means that one chat can exist one or more times. However the id function only returns the first matching chat so to get all existing chats with the same id you would have to use the all function.

I know i know i already wrote it down and it will hopefully be fixed in the future.

So now thats it.<br/>
You should now be able to implement the baileys bottle data store and connect it to your db.<br/>
Have fun :3
