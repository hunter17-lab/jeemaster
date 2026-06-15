import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/giveawayMedia";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  source: string | null | undefined;
  fallback?: React.ReactNode;
}

const MediaImage = ({ source, fallback, ...rest }: Props) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    resolveMediaUrl(source).then((u) => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [source]);
  if (!url) return fallback ? <>{fallback}</> : null;
  return <img src={url} {...rest} />;
};

export default MediaImage;
