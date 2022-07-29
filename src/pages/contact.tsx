import { List, Text, ThemeIcon } from "@mantine/core";
import { IconBrandGithub, IconMessage } from "@tabler/icons";
import Link from "next/link";
import { BodyText } from "../common/components/components-utils";
import { AboutSection } from "../common/contents/contents-about";
import ContactContents from "../common/contents/contents-contact";
import useGlobalMediaQuery from "../common/hooks/useGlobalMediaQueries";
import useTheme from "../common/hooks/useTheme";
import MainLayout from "../common/layouts/layouts-index";

export default function ContactPage() {
  const { siteColors: colors } = useTheme();
  const { md: isMed } = useGlobalMediaQuery();

  return (
    <MainLayout home={false}>
      <div style={{ display: "flex", padding: 70 }}>
        <ContactContents />
      </div>
    </MainLayout>
  );
}
