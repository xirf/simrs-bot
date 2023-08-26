
-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS "public"."sessions";
CREATE TABLE "public"."sessions" (
  "id" int4 NOT NULL DEFAULT nextval('sessions_id_seq'::regclass),
  "sessionid" varchar(255) COLLATE "pg_catalog"."default",
  "session" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Uniques structure for table sessions
-- ----------------------------
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_sessionid_key" UNIQUE ("sessionid");

-- ----------------------------
-- Primary Key structure for table sessions
-- ----------------------------
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");
