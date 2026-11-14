CREATE TYPE "public"."newsletter_status" AS ENUM('subscribed', 'unsubscribed');--> statement-breakpoint
CREATE TABLE "newsletter_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"status" "newsletter_status" DEFAULT 'subscribed' NOT NULL,
	"consent_version" text NOT NULL,
	"consent_source" text NOT NULL,
	"consented_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ADD CONSTRAINT "newsletter_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscriptions_user_unique" ON "newsletter_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "newsletter_subscriptions_status_idx" ON "newsletter_subscriptions" USING btree ("status");