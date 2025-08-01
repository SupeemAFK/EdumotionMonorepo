-- CreateTable
CREATE TABLE "public"."learnprogress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "learningId" TEXT NOT NULL,
    "currentNode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learnprogress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."learnprogress" ADD CONSTRAINT "learnprogress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learnprogress" ADD CONSTRAINT "learnprogress_learningId_fkey" FOREIGN KEY ("learningId") REFERENCES "public"."learning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
