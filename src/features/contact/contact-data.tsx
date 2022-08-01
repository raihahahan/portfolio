import { ThemeIcon } from "@mantine/core";
import { IconBrandGithub, IconMessage } from "@tabler/icons";
import { contactDataType } from "./contact-types";
import { siteColorsType } from "../theme/theme-types";

export const contactData: contactDataType[] = [
  {
    id: "0",
    title: "mraihandev@gmail.com",
    link: "mailto:mraihandev@gmail.com",
    icon: (colors: siteColorsType) => (
      <ThemeIcon color="yellow" size={28} radius="xl">
        <IconMessage size={16} color={colors.text.primary} />
      </ThemeIcon>
    ),
  },
  {
    id: "1",
    title: "Github: @raihahahan",
    link: "https://www.github.com/raihahahan",
    icon: (colors: siteColorsType) => (
      <ThemeIcon color="yellow" size={28} radius="xl">
        <IconBrandGithub size={16} color={colors.text.primary} />
      </ThemeIcon>
    ),
  },
];
