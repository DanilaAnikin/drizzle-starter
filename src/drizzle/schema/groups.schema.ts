import { index, integer, pgTable, primaryKey, serial, text } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const groups = pgTable('groups', {
    id: serial('id').primaryKey(),
    name: text("name").notNull(),
});

export const usersToGroups = pgTable(
    'usersToGroups',
    {
        userId: integer('userId').references(() => users.id),
        groupId: integer('groupId').references(() => groups.id),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.groupId, table.userId] }),
        userIdIndex: index("userIdIndex").on(table.userId),
    }),
);