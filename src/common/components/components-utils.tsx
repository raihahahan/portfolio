import { CSSProperties } from "@emotion/serialize";
import { Text } from "@mantine/core";
import Link from "next/link";
import React from "react";
import useGlobalMediaQuery from "../hooks/useGlobalMediaQueries";
import useTheme from "../hooks/useTheme";

export function BodyText({ children }: { children: React.ReactFragment }) {
  const { siteColors: colors } = useTheme();
  const { md: isMed } = useGlobalMediaQuery();
  return (
    <Text
      style={{
        color: colors.text.primary,
        paddingRight: 40,
        paddingLeft: 40,
        fontSize: isMed ? 16 : 20,
        marginTop: 20,
      }}
    >
      {children}
    </Text>
  );
}

export function LinkText({
  text,
  link,
  extraTextStyles,
}: {
  text: string;
  link: string;
  extraTextStyles?: CSSProperties;
}) {
  const { siteColors: colors } = useTheme();
  return (
    <Link href={link}>
      <a
        target={"_blank"}
        style={{ color: "blue", ...(extraTextStyles as object) }}
      >
        {text}
      </a>
    </Link>
  );
}
