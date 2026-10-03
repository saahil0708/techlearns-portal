-- Backfill migration to normalize existing course codes and enforce uniqueness

-- 1. Resolve any existing duplicates by appending a deterministic sequence number
WITH numbered_courses AS (
  SELECT id, code, ROW_NUMBER() OVER (PARTITION BY UPPER(TRIM(code)) ORDER BY "createdAt" ASC) AS rn
  FROM "courses"
  WHERE "code" IS NOT NULL AND TRIM("code") != ''
)
UPDATE "courses"
SET "code" = numbered_courses.code || '-' || numbered_courses.rn
FROM numbered_courses
WHERE "courses"."id" = numbered_courses.id AND numbered_courses.rn > 1;

-- 2. Trim and uppercase all valid non-null codes; convert empty strings to NULL
UPDATE "courses"
SET "code" = NULL
WHERE "code" IS NOT NULL AND TRIM("code") = '';

UPDATE "courses"
SET "code" = UPPER(TRIM("code"))
WHERE "code" IS NOT NULL;

-- 3. Create unique index for course code
CREATE UNIQUE INDEX IF NOT EXISTS "courses_code_key" ON "courses"("code");
