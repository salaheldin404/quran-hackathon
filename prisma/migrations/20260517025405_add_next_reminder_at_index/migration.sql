-- CreateIndex
CREATE INDEX "KhatmaReminder_isEnabled_nextReminderAt_idx" ON "KhatmaReminder"("isEnabled", "nextReminderAt");

-- CreateIndex
CREATE INDEX "Reminder_isEnabled_nextReminderAt_idx" ON "Reminder"("isEnabled", "nextReminderAt");
