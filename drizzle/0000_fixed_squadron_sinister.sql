CREATE TYPE "public"."widget_type" AS ENUM('line', 'bar', 'stacked-bar', 'pie', 'text');--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "widget_type" NOT NULL,
	"title" varchar(120) NOT NULL,
	"data" jsonb NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
