"use client";

import type { AnchorHTMLAttributes } from "react";
import { pushToDataLayer } from "@/lib/gtm";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: string;
  params?: Record<string, string>;
};

/**
 * An outbound link that reports itself. Exists because nearly every external
 * link lives in a server component, which cannot carry an onClick.
 */
export default function TrackedLink({
  event,
  params,
  onClick,
  children,
  ...props
}: Props) {
  return (
    <a
      {...props}
      onClick={(e) => {
        pushToDataLayer({ event, ...params });
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
