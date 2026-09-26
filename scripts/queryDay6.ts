import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT p.slug, p.confidentiality, cs.id as "caseStudyId"
    FROM "Project" p LEFT JOIN "CaseStudy" cs ON cs."projectId" = p.id
    WHERE p.confidentiality IN ('PUBLIC','ANONYMIZED');
  `;
  console.log(result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
