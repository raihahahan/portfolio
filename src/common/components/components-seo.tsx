import Head from "next/head";
import { makeSiteTitle } from "../../features/site/site-utils";

const SITE_NAME = "Raihan Rizqullah";
export const SITE_URL = "https://mraihan.dev";
export const DEFAULT_DESCRIPTION =
  "I'm Raihan Rizqullah, a Computer Science student at the National University of Singapore. This is where I share my learnings and projects as an aspiring software engineer.";
const DEFAULT_IMAGE = `${SITE_URL}/images/final-xs-light.png`;

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
  keywords?: string[];
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

function toAbsoluteUrl(path?: string) {
  if (!path || path === "/") return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  publishedTime,
  noindex = false,
  keywords = [],
  jsonLd,
}: SeoProps) {
  const canonicalUrl = toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image);
  const resolvedTitle = title ? makeSiteTitle(title) : SITE_NAME;

  return (
    <Head>
      <title>{resolvedTitle}</title>
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width"
      />
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      <meta
        name="googlebot"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      <meta name="author" content={SITE_NAME} />
      <meta name="creator" content={SITE_NAME} />
      <meta name="publisher" content={SITE_NAME} />
      <meta
        name="format-detection"
        content="telephone=no, address=no, email=no"
      />
      <meta name="theme-color" content="#0e0e0e" />
      {keywords.length > 0 ? (
        <meta name="keywords" content={keywords.join(", ")} />
      ) : null}

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={resolvedTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}

      {jsonLd
        ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((entry, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
            />
          ))
        : null}
    </Head>
  );
}
