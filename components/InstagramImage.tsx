"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * What sits behind an Instagram image: visible while it loads, and all that's
 * left if the proxy can't serve it. Hidden from screen readers because every
 * card already prints the same title in its body.
 */
export function InstagramCover({ title }: { title: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-end bg-pink p-7"
    >
      <p className="line-clamp-5 font-display text-[22px] font-extrabold leading-[1.15] text-white">
        {title}
      </p>
    </div>
  );
}

export default function InstagramImage({
  id,
  title,
  sizes,
  className = "",
}: {
  id: string;
  title: string;
  sizes: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <InstagramCover title={title} />
      {failed ? null : (
        <Image
          src={`/api/instagram/${id}`}
          alt={title}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
