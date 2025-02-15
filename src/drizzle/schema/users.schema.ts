import { relations } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { comments } from "./comments.schema";
import { posts } from "./posts.schema";
import { profileInfo } from "./profileInfo.schema";
import { usersToGroups } from "./groups.schema";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    password: text('password').notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
    comments: many(comments),
    posts: many(posts),
    profile: one(profileInfo),
    usersToGroups: many(usersToGroups),
}));
