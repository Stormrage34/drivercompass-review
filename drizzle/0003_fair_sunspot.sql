ALTER TABLE "enquiries" ADD COLUMN "employer_reply" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "replied_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "replied_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_replied_by_user_id_users_id_fk" FOREIGN KEY ("replied_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;