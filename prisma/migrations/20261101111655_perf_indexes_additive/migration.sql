-- CreateIndex
CREATE INDEX "Project_confidentiality_createdAt_idx" ON "Project"("confidentiality", "createdAt");

-- CreateIndex
CREATE INDEX "Project_status_confidentiality_createdAt_idx" ON "Project"("status", "confidentiality", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectMedia_projectId_order_idx" ON "ProjectMedia"("projectId", "order");

-- CreateIndex
CREATE INDEX "Service_status_order_idx" ON "Service"("status", "order");

-- CreateIndex
CREATE INDEX "Service_status_createdAt_idx" ON "Service"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Testimonial_status_permissionStatus_createdAt_idx" ON "Testimonial"("status", "permissionStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Testimonial_createdAt_idx" ON "Testimonial"("createdAt");
