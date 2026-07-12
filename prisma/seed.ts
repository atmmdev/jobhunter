import { hash } from 'bcryptjs';
import { PrismaClient, type Locale, type ResumeStack } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedResume {
  name: string;
  stack: ResumeStack;
  locale: Locale;
  summary: string;
  contentText: string;
}

const DEFAULT_RESUMES: SeedResume[] = [
  {
    name: 'React / Next.js / Node / TypeScript',
    stack: 'JS_TS',
    locale: 'en',
    summary:
      'Full-stack JavaScript engineer focused on React, Next.js, Node.js and TypeScript.',
    contentText: `PROFESSIONAL SUMMARY
Senior software engineer specializing in React, Next.js, Node.js and TypeScript.
Strong experience building production web apps, APIs, and developer platforms.

SKILLS
React, Next.js, TypeScript, Node.js, REST, GraphQL, Prisma, PostgreSQL/MySQL,
TailwindCSS, testing (Vitest/Jest/Playwright), CI/CD, Docker, AWS basics.

EXPERIENCE HIGHLIGHTS
- Built and maintained large Next.js applications with App Router and TypeScript
- Designed Node.js APIs with strong validation, observability and performance focus
- Collaborated with product/design on accessible, responsive UI systems
- Mentored engineers and improved delivery quality through reviews and automation

TARGET ROLES
Frontend Engineer, Full-stack Engineer, TypeScript Engineer (Remote / Hybrid)
`,
  },
  {
    name: 'React / Next.js / Node / TypeScript',
    stack: 'JS_TS',
    locale: 'pt_BR',
    summary:
      'Engenheiro full-stack JavaScript focado em React, Next.js, Node.js e TypeScript.',
    contentText: `RESUMO PROFISSIONAL
Engenheiro de software sênior especializado em React, Next.js, Node.js e TypeScript.
Experiência sólida em aplicações web de produção, APIs e plataformas para desenvolvedores.

COMPETÊNCIAS
React, Next.js, TypeScript, Node.js, REST, GraphQL, Prisma, PostgreSQL/MySQL,
TailwindCSS, testes (Vitest/Jest/Playwright), CI/CD, Docker, fundamentos de AWS.

DESTAQUES DE EXPERIÊNCIA
- Construiu e manteve aplicações Next.js grandes com App Router e TypeScript
- Projetou APIs Node.js com validação, observabilidade e foco em performance
- Colaborou com produto/design em sistemas de UI acessíveis e responsivos
- Mentoria de engenheiros e melhoria de qualidade via reviews e automação

OBJETIVO
Frontend Engineer, Full-stack Engineer, TypeScript Engineer (Remoto / Híbrido)
`,
  },
  {
    name: 'C# / ASP.NET Core',
    stack: 'DOTNET',
    locale: 'en',
    summary: 'Backend-focused .NET engineer with ASP.NET Core, C# and enterprise APIs.',
    contentText: `PROFESSIONAL SUMMARY
Software engineer specialized in C# and ASP.NET Core for scalable backend systems.
Comfortable with domain-driven design, SQL databases and cloud-hosted services.

SKILLS
C#, ASP.NET Core, Entity Framework, SQL Server/MySQL, REST APIs, authentication,
background workers, Docker, CI/CD, unit/integration testing.

EXPERIENCE HIGHLIGHTS
- Delivered ASP.NET Core APIs and services for business-critical workflows
- Modeled relational data and optimized queries/indexes for performance
- Implemented authentication, authorization and audit-friendly logging
- Improved reliability with automated tests and structured error handling

TARGET ROLES
.NET Backend Engineer, ASP.NET Core Engineer, C# Engineer
`,
  },
  {
    name: 'C# / ASP.NET Core',
    stack: 'DOTNET',
    locale: 'pt_BR',
    summary: 'Engenheiro .NET focado em backend com ASP.NET Core, C# e APIs corporativas.',
    contentText: `RESUMO PROFISSIONAL
Engenheiro de software especializado em C# e ASP.NET Core para backends escaláveis.
Experiência com design orientado a domínio, bancos SQL e serviços em nuvem.

COMPETÊNCIAS
C#, ASP.NET Core, Entity Framework, SQL Server/MySQL, APIs REST, autenticação,
workers em background, Docker, CI/CD, testes unitários/integração.

DESTAQUES DE EXPERIÊNCIA
- Entregou APIs e serviços ASP.NET Core para fluxos críticos de negócio
- Modelou dados relacionais e otimizou queries/índices
- Implementou autenticação, autorização e logs auditáveis
- Melhorou confiabilidade com testes automatizados e tratamento estruturado de erros

OBJETIVO
Engenheiro Backend .NET, Engenheiro ASP.NET Core, Engenheiro C#
`,
  },
  {
    name: 'PHP / Laravel / WordPress',
    stack: 'PHP',
    locale: 'en',
    summary: 'PHP engineer with Laravel APIs/apps and WordPress customization experience.',
    contentText: `PROFESSIONAL SUMMARY
Software engineer focused on PHP ecosystems: Laravel applications and WordPress sites.
Experienced delivering maintainable backends, integrations and content platforms.

SKILLS
PHP, Laravel, WordPress, MySQL, REST APIs, Blade/Twig templating, queues,
caching, Composer, testing, Docker, Git workflows.

EXPERIENCE HIGHLIGHTS
- Built Laravel applications with clean service/repository boundaries
- Customized WordPress themes/plugins and improved editorial workflows
- Integrated third-party APIs and payment/content providers
- Hardened deployments with environments, migrations and monitoring basics

TARGET ROLES
PHP/Laravel Engineer, WordPress Developer, Backend PHP Engineer
`,
  },
  {
    name: 'PHP / Laravel / WordPress',
    stack: 'PHP',
    locale: 'pt_BR',
    summary: 'Engenheiro PHP com experiência em APIs/apps Laravel e customização WordPress.',
    contentText: `RESUMO PROFISSIONAL
Engenheiro de software focado no ecossistema PHP: aplicações Laravel e sites WordPress.
Experiência em backends manuteníveis, integrações e plataformas de conteúdo.

COMPETÊNCIAS
PHP, Laravel, WordPress, MySQL, APIs REST, templates Blade/Twig, filas,
cache, Composer, testes, Docker, fluxos Git.

DESTAQUES DE EXPERIÊNCIA
- Construiu aplicações Laravel com limites claros de service/repository
- Customizou temas/plugins WordPress e melhorou fluxos editoriais
- Integração com APIs de terceiros e provedores de pagamento/conteúdo
- Fortaleceu deploys com ambientes, migrations e monitoramento básico

OBJETIVO
Engenheiro PHP/Laravel, Desenvolvedor WordPress, Engenheiro Backend PHP
`,
  },
];

/**
 * Seeds the baseline admin user, Manual Entry source, and bilingual resumes.
 */
async function main(): Promise<void> {
  const email = (process.env.SEED_USER_EMAIL ?? 'admin@jobhunter.local').toLowerCase();
  const password = process.env.SEED_USER_PASSWORD ?? 'ChangeMe123!';
  const name = process.env.SEED_USER_NAME ?? 'Admin';

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
    },
    create: {
      email,
      name,
      passwordHash,
      locale: 'en',
    },
  });

  const manualSource = await prisma.source.findFirst({
    where: { name: 'Manual Entry' },
  });

  if (!manualSource) {
    await prisma.source.create({
      data: {
        name: 'Manual Entry',
        type: 'OTHER',
        atsType: 'CUSTOM',
        baseUrl: 'manual://entry',
        enabled: true,
      },
    });
  }

  for (const resume of DEFAULT_RESUMES) {
    const existing = await prisma.resume.findFirst({
      where: {
        userId: user.id,
        stack: resume.stack,
        locale: resume.locale,
      },
    });

    if (existing) {
      await prisma.resume.update({
        where: { id: existing.id },
        data: {
          name: resume.name,
          summary: resume.summary,
          contentText: resume.contentText,
          isActive: true,
        },
      });
      continue;
    }

    await prisma.resume.create({
      data: {
        userId: user.id,
        name: resume.name,
        stack: resume.stack,
        locale: resume.locale,
        summary: resume.summary,
        contentText: resume.contentText,
        isActive: true,
      },
    });
  }

  console.log(`Seeded user: ${email}`);
  console.log('Seeded Manual Entry source');
  console.log(`Seeded ${DEFAULT_RESUMES.length} resumes (EN + PT-BR)`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
