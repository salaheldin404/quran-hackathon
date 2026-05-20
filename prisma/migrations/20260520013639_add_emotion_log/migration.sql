-- CreateTable
CREATE TABLE "EmotionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emotionTag" TEXT NOT NULL,
    "userInput" TEXT,
    "aiResponse" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmotionLog_userId_idx" ON "EmotionLog"("userId");

-- CreateIndex
CREATE INDEX "EmotionLog_emotionTag_idx" ON "EmotionLog"("emotionTag");

-- AddForeignKey
ALTER TABLE "EmotionLog" ADD CONSTRAINT "EmotionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
