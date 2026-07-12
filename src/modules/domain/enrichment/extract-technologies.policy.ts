export interface ExtractedTechnology {
  name: string;
  category: string;
  confidence: number;
}

const TECHNOLOGY_CATALOG: Array<{ name: string; category: string; aliases: string[] }> = [
  { name: 'React', category: 'frontend', aliases: ['react', 'react.js', 'reactjs'] },
  { name: 'Next.js', category: 'frontend', aliases: ['next.js', 'nextjs', 'next js'] },
  { name: 'TypeScript', category: 'language', aliases: ['typescript', 'ts'] },
  { name: 'JavaScript', category: 'language', aliases: ['javascript', 'js', 'es6'] },
  { name: 'Node.js', category: 'backend', aliases: ['node.js', 'nodejs', 'node'] },
  { name: 'GraphQL', category: 'api', aliases: ['graphql'] },
  { name: 'Prisma', category: 'orm', aliases: ['prisma'] },
  { name: 'Tailwind CSS', category: 'frontend', aliases: ['tailwind', 'tailwindcss'] },
  { name: 'C#', category: 'language', aliases: ['c#', 'csharp', 'c sharp'] },
  { name: '.NET', category: 'backend', aliases: ['.net', 'dotnet', 'asp.net', 'aspnet'] },
  { name: 'Entity Framework', category: 'orm', aliases: ['entity framework', 'ef core'] },
  { name: 'PHP', category: 'language', aliases: ['php'] },
  { name: 'Laravel', category: 'backend', aliases: ['laravel'] },
  { name: 'WordPress', category: 'cms', aliases: ['wordpress', 'wp'] },
  { name: 'Python', category: 'language', aliases: ['python'] },
  { name: 'Django', category: 'backend', aliases: ['django'] },
  { name: 'FastAPI', category: 'backend', aliases: ['fastapi'] },
  { name: 'Java', category: 'language', aliases: ['java'] },
  { name: 'Spring', category: 'backend', aliases: ['spring boot', 'spring'] },
  { name: 'Go', category: 'language', aliases: ['golang', ' go '] },
  { name: 'Rust', category: 'language', aliases: ['rust'] },
  { name: 'PostgreSQL', category: 'database', aliases: ['postgresql', 'postgres'] },
  { name: 'MySQL', category: 'database', aliases: ['mysql'] },
  { name: 'MongoDB', category: 'database', aliases: ['mongodb', 'mongo'] },
  { name: 'Redis', category: 'database', aliases: ['redis'] },
  { name: 'AWS', category: 'cloud', aliases: ['aws', 'amazon web services'] },
  { name: 'Docker', category: 'devops', aliases: ['docker'] },
  { name: 'Kubernetes', category: 'devops', aliases: ['kubernetes', 'k8s'] },
  { name: 'Terraform', category: 'devops', aliases: ['terraform'] },
];

/**
 * Extracts known technologies from job title + description via keyword matching.
 */
export function extractTechnologies(input: {
  title: string;
  descriptionText: string;
}): ExtractedTechnology[] {
  const haystack = ` ${`${input.title}\n${input.descriptionText}`.toLowerCase()} `;
  const found: ExtractedTechnology[] = [];

  for (const tech of TECHNOLOGY_CATALOG) {
    const matched = tech.aliases.some((alias) => {
      if (alias.trim().length <= 2) {
        return new RegExp(`(^|[^a-z0-9])${alias.trim()}([^a-z0-9]|$)`, 'i').test(haystack);
      }
      return haystack.includes(alias.toLowerCase());
    });

    if (matched) {
      found.push({
        name: tech.name,
        category: tech.category,
        confidence: 0.85,
      });
    }
  }

  return found;
}
