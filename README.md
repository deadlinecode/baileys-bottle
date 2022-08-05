# Baileys bottle

## A little package for storing all the data from baileys in whatever database you want to use by using typeorm

This package creates a store for a baileys bot instance. You can pass in a database connection to the functions and they will use that connection to create all the needed tables and save all the data to the database using typeorm, which supports all different kinds of databases.

TypeORM currently supports:

- MySQL
- MariaDB
- Postgres
- CockroachDB
- SQLite
- Microsoft SQL Server
- Oracle
- SAP Hana
- sql.js

## Installation

```bash
npm install baileys-bottle
```

## Usage

Take a look into the implementation in the example (line 12 and 13)

## I wanna tweak it for my own use case

Sure thing! You can tinker with the package like this:

1. Clone the repo
   ```bash
   git clone https://github.com/deadlinecode/baileys-bottle .
   ```
2. Change stuff you wanna change
3. Build the package
   ```bash
   npm build
   ```
4. Install it in another nodejs project from wherever you saved it on your disk
   ```bash
   # inside your other project
   npm install /path/to/the/repo/named/baileys-bottle
   ```

## Found a bug or want to contribute because you're a cool person?

If you found an issue or would like to submit an improvement, please open an issue using the issues tab in github.

If you actually have some spare time and want to contribute, feel free to open a PR and please don't forget to (create and) link the corresponding issue. It's important so we can keep track of all the issues and feature requests that got resolved by PRs.

## Known issues/feature requests (WIP)

- [ ] Make the Chats table use the right primary key (currently it's just a extra DBId so that there is no error on insert)

- [ ] Support multiple instance (currently only one instance is supported)

- [ ] Add the ability to change the behavior of data changes (e.g. if you want to keep deleted messages in the database)
