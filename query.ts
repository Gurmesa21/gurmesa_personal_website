import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const res = await prisma.$queryRaw`
    SELECT p.slug, p.confidentiality, cs.id as "caseStudyId", cs.status
    FROM "Project" p
    LEFT JOIN "CaseStudy" cs ON cs."projectId" = p.id
    WHERE p.confidentiality IN ('PUBLIC','ANONYMIZED');
  `;
  console.log(JSON.stringify(res, null, 2));
}

main().finally(() => prisma.$disconnect());
