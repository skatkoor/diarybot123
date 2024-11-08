CREATE TABLE IF NOT EXISTS "diary_entries" (
    "id" varchar PRIMARY KEY NOT NULL,
    "content" text NOT NULL,
    "mood" varchar NOT NULL,
    "date" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "user_id" varchar,
    "tags" text[]
);

CREATE TABLE IF NOT EXISTS "todos" (
    "id" varchar PRIMARY KEY NOT NULL,
    "content" text NOT NULL,
    "completed" boolean DEFAULT false NOT NULL,
    "date" timestamp DEFAULT now() NOT NULL,
    "completed_at" timestamp,
    "user_id" varchar
);

CREATE TABLE IF NOT EXISTS "notes" (
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "content" text NOT NULL,
    "card_id" varchar NOT NULL,
    "date" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "user_id" varchar,
    "tags" text[]
);

CREATE TABLE IF NOT EXISTS "flashcards" (
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "parent_id" varchar,
    "date" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "user_id" varchar
);