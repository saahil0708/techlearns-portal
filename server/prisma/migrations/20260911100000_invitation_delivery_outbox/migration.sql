CREATE TABLE "invitation_deliveries" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "activationUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3) NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invitation_deliveries_invitationId_key" ON "invitation_deliveries"("invitationId");
CREATE INDEX "invitation_deliveries_status_createdAt_idx" ON "invitation_deliveries"("status", "createdAt");

ALTER TABLE "invitation_deliveries" ADD CONSTRAINT "invitation_deliveries_invitationId_fkey"
  FOREIGN KEY ("invitationId") REFERENCES "user_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
