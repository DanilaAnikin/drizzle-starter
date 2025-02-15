ALTER TABLE "comments" ALTER COLUMN "authorId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "postId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "authorId" SET NOT NULL;