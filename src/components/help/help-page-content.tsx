import { getTranslations } from 'next-intl/server';

interface HelpSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

/**
 * Renders the in-app help / tutorial content from i18n messages.
 */
export async function HelpPageContent() {
  const t = await getTranslations('help');
  const sections = t.raw('sections') as HelpSection[];

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>

      <nav aria-label={t('tocLabel')} className="space-y-2 border-b border-border pb-6">
        <p className="text-sm font-medium">{t('tocLabel')}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-8 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p
                key={`${section.id}-p-${index}`}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {section.bullets.map((bullet, index) => (
                  <li key={`${section.id}-b-${index}`}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
