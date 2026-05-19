-- Additive trust foundation for layer progression (Run 11.6 Prompt 2)
ALTER TABLE "relationship_layers"
  ADD COLUMN "trustScore" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "layer_rules" (
  "id" TEXT NOT NULL,
  "fromLayer" INTEGER NOT NULL,
  "toLayer" INTEGER NOT NULL,
  "minElapsedMinutes" INTEGER NOT NULL,
  "requiredTrustScore" INTEGER NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "layer_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "layer_rules_fromLayer_toLayer_key" ON "layer_rules"("fromLayer", "toLayer");
CREATE INDEX "layer_rules_enabled_fromLayer_toLayer_idx" ON "layer_rules"("enabled", "fromLayer", "toLayer");

CREATE TABLE "trust_signal_rules" (
  "id" TEXT NOT NULL,
  "signalType" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "trust_signal_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "trust_signal_rules_signalType_key" ON "trust_signal_rules"("signalType");
CREATE INDEX "trust_signal_rules_enabled_signalType_idx" ON "trust_signal_rules"("enabled", "signalType");
