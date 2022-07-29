import { Text } from "@mantine/core";
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
