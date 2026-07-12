import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';

export interface ExtractedGupyJob {
  externalId: string;
  title: string;
  applyUrl: string;
  location: string | null;
  country: string | null;
  isRemote: boolean | null;
  employmentType: string | null;
  department: string | null;
  descriptionText: string;
  descriptionHtml: string | null;
  companyName: string | null;
  postedAt: Date | null;
}

interface GupyWorkplaceAddress {
  country?: string;
  stateShortName?: string;
  state?: string;
  city?: string;
  district?: string;
}

interface GupyListJob {
  id?: number | string;
  title?: string;
  name?: string;
  type?: string;
  department?: string;
  workplace?: {
    address?: GupyWorkplaceAddress;
    workplaceType?: string;
  };
  publishedAt?: string;
}

interface GupyDetailJob {
  id?: number | string;
  name?: string;
  description?: string;
  responsibilities?: string;
  prerequisites?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  workplaceType?: string;
  jobType?: string;
  publishedAt?: string;
  careerPage?: { name?: string; subdomain?: string };
  company?: { name?: string };
}

interface GupyNextData {
  props?: {
    pageProps?: {
      subdomain?: string;
      jobs?: GupyListJob[];
      careerPage?: {
        name?: string;
        subdomain?: string;
      };
      job?: GupyDetailJob;
    };
  };
}

/**
 * Parses Gupy career-page `__NEXT_DATA__` job listings.
 */
export function extractGupyJobsFromHtml(html: string, subdomain: string): ExtractedGupyJob[] {
  const nextData = parseNextData(html);
  const pageProps = nextData?.props?.pageProps;
  if (!pageProps) {
    return [];
  }

  const companyName = pageProps.careerPage?.name?.trim() || null;
  const listJobs = pageProps.jobs ?? [];

  if (listJobs.length > 0) {
    return listJobs
      .map((job) => mapListJob(job, subdomain, companyName))
      .filter((job): job is ExtractedGupyJob => job !== null);
  }

  if (pageProps.job) {
    const detail = mapDetailJob(pageProps.job, subdomain);
    return detail ? [detail] : [];
  }

  return [];
}

function mapListJob(
  job: GupyListJob,
  subdomain: string,
  companyName: string | null,
): ExtractedGupyJob | null {
  const id = job.id != null ? String(job.id) : '';
  const title = (job.title ?? job.name ?? '').trim();
  if (!id || title.length < 2) {
    return null;
  }

  const address = job.workplace?.address;
  const location = formatLocation(address);
  const workplaceType = job.workplace?.workplaceType ?? null;
  const isRemote = workplaceType
    ? /remote|remoto|hybrid|híbrid/i.test(workplaceType)
    : null;

  const descriptionParts = [
    title,
    job.department ? `Departamento: ${job.department}` : null,
    location ? `Local: ${location}` : null,
    workplaceType ? `Modalidade: ${workplaceType}` : null,
    'Fonte: Gupy',
  ].filter(Boolean);

  return {
    externalId: id,
    title,
    applyUrl: `https://${subdomain}.gupy.io/jobs/${id}`,
    location,
    country: address?.country?.trim() || null,
    isRemote,
    employmentType: job.type ?? null,
    department: job.department?.trim() || null,
    descriptionText: descriptionParts.join('. '),
    descriptionHtml: null,
    companyName,
    postedAt: job.publishedAt ? new Date(job.publishedAt) : null,
  };
}

function mapDetailJob(job: GupyDetailJob, subdomain: string): ExtractedGupyJob | null {
  const id = job.id != null ? String(job.id) : '';
  const title = (job.name ?? '').trim();
  if (!id || title.length < 2) {
    return null;
  }

  const descriptionHtml = [job.description, job.responsibilities, job.prerequisites]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join('\n');
  const descriptionText =
    stripHtml(descriptionHtml).trim() || `${title}. Fonte: Gupy`;
  const location = formatLocation({
    city: job.addressCity,
    state: job.addressState,
    country: job.addressCountry,
  });

  return {
    externalId: id,
    title,
    applyUrl: `https://${subdomain}.gupy.io/jobs/${id}`,
    location,
    country: job.addressCountry?.trim() || null,
    isRemote: job.workplaceType
      ? /remote|remoto|hybrid|híbrid/i.test(job.workplaceType)
      : null,
    employmentType: job.jobType ?? null,
    department: null,
    descriptionText,
    descriptionHtml: descriptionHtml || null,
    companyName: job.careerPage?.name?.trim() || job.company?.name?.trim() || null,
    postedAt: job.publishedAt ? new Date(job.publishedAt) : null,
  };
}

function parseNextData(html: string): GupyNextData | null {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i,
  );
  if (!match?.[1]) {
    return null;
  }

  try {
    return JSON.parse(match[1]) as GupyNextData;
  } catch {
    return null;
  }
}

function formatLocation(address: GupyWorkplaceAddress | undefined): string | null {
  if (!address) {
    return null;
  }
  const parts = [address.city, address.stateShortName || address.state, address.country]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(', ') : null;
}
