import { CSSProperties } from "@emotion/serialize";
import Link from "next/link";
import React from "react";
import useTheme from "../hooks/useTheme";
import { useEffect, useState } from "react";
import { ActionIcon, Affix, Transition } from "@mantine/core";
import { IconArrowUp } from "@tabler/icons";

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

export default function ScrollToTopFAB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Affix position={{ bottom: 20, right: 20 }}>
      <Transition transition="fade" mounted={visible}>
        {(styles) => (
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            color="orange"
            style={styles}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <IconArrowUp size={24} />
          </ActionIcon>
        )}
      </Transition>
    </Affix>
  );
}
