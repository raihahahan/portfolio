import { CSSProperties } from "@emotion/serialize";
import Link from "next/link";
import React from "react";
import useTheme from "../hooks/useTheme";

export function LinkText({
  text,
  link,
  extraTextStyles,
}: {
  text: string;
  link: string;
  extraTextStyles?: CSSProperties;
}) {
  const { siteColors } = useTheme();
  return (
    <Link href={link}>
      <a
        target={"_blank"}
        style={{ color: siteColors.text.links, ...(extraTextStyles as object) }}
      >
        {text}
      </a>
    </Link>
  );
}
