import { List, Text, ThemeIcon } from "@mantine/core";
import { IconBrandGithub, IconMessage } from "@tabler/icons";
import Link from "next/link";
import React from "react";
import { BodyText } from "../common/components/components-utils";
import ContactMethods from "../common/components/contact-methods";
import useTheme from "../common/hooks/useTheme";
import { aboutDataType } from "../common/types/types-about";
import { globalMediaQueriesType, siteColorsType } from "../styles/styles-types";

export const aboutData = (
  colors: siteColorsType,
  mediaQueries: globalMediaQueriesType
): aboutDataType[] => {
  const { md: isMed } = mediaQueries;

  return [
    {
      id: "0",
      title: "Myself",
      body: (
        <BodyText>
          I am Raihan and I am a newbie developer who is just starting out.
          <br />
          <br />I use this place as a portfolio site to showcase my past
          projects. I currently focus on building Android and iOS apps with
          React Native and Expo EAS. I created an informal entity called{" "}
          <Link passHref href="https://www.melonbase.com">
            <a target="_blank" style={{ color: "blue" }}>
              Melonbase
            </a>
          </Link>{" "}
          for the sole purpose of curating my mobile app(s) that are published
          to the store into a single entity.
          <br />
          <br />
          I hope to expand my skillsets beyond React and React Native to areas
          such as native mobile app development (Java/Swift) and Data
          Science/Analytics.
          <br />
          <br />
          I will be pursuing Computer Science in late 2023. In the meantime, I
          work on self projects, take online courses and try to keep up with the
          latest tech.
          <br />
          <br />I do not have relevant work experience yet, but I am willing to
          take on an internship before my university starts. You may contact me
          as shown{" "}
          <Link href="#3">
            <a style={{ color: "blue" }}>below</a>
          </Link>
          .
        </BodyText>
      ),
    },
    {
      id: "3",
      title: "Contact",
      body: (
        <BodyText>
          <></>
          <ContactMethods />
        </BodyText>
      ),
    },
    {
      id: "2",
      title: "Miscellaneous",
      body: (
        <BodyText>
          This site was built with React and NextJS. Coincidentally, this site
          is my first React NextJS project.
        </BodyText>
      ),
    },
  ];
};