import { List } from "@mantine/core";
import Link from "next/link";
import { contactData } from "../../data/data-contact";
import useTheme from "../hooks/useTheme";

export default function ContactMethods() {
  const { siteColors: colors } = useTheme();

  return (
    <List spacing="xs" size="sm" center>
      {contactData.map((item) => {
        return (
          <List.Item icon={item.icon(colors)}>
            <Link href={item.link}>
              <a target="_blank" style={{ color: "blue", fontSize: 16 }}>
                {item.title}
              </a>
            </Link>
          </List.Item>
        );
      })}
    </List>
  );
}
