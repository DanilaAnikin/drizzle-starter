ALTER TABLE "comments" DROP CONSTRAINT "comments_authorId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_postId_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "usersToGroups" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "usersToGroups" ALTER COLUMN "groupId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;