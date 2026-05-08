import { useEffect } from "react";

interface Opts {
  title: string;
  description?: string;
  canonical?: string;
}

const useSEO = ({ title, description, canonical }: Opts) => {
  useEffect(() => {
    document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
    const canonicalHref = canonical || window.location.href.split("#")[0];
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalHref;
  }, [title, description, canonical]);
};

export default useSEO;
