
-- ----------------------------
-- Table structure for kegiatan
-- ----------------------------
DROP TABLE IF EXISTS "public"."kegiatan";
CREATE TABLE "public"."kegiatan" (
  "id_kegiatan" int4 NOT NULL DEFAULT nextval('kegiatan_id_kegiatan_seq'::regclass),
  "ucapan_ultah" text COLLATE "pg_catalog"."default",
  "kartu_ultah" text COLLATE "pg_catalog"."default",
  "pengingat_konsul" text COLLATE "pg_catalog"."default",
  "last_updated" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Checks structure for table kegiatan
-- ----------------------------
-- Pattern required so the message will formated correctly
-- ask    : Why we didnt just use new table so we can make format more simpler?
-- answer : i use regex to replace the pattern, changing pattern will result to error that we dont want
ALTER TABLE "public"."kegiatan" ADD CONSTRAINT "pattern_check" CHECK (pengingat_konsul ~ '{{tgl}}'::text AND pengingat_konsul ~ '{{jam}}'::text AND kartu_ultah ~ '^https?://'::text);

-- ----------------------------
-- Primary Key structure for table kegiatan
-- ----------------------------
ALTER TABLE "public"."kegiatan" ADD CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id_kegiatan");
