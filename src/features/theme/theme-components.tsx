import { Anchor } from "@mantine/core";
import { FiMoon, FiSun } from "react-icons/fi";
import { useDispatch } from "react-redux";
import useTheme from "../../common/hooks/useTheme";
import { AppDispatch } from "../../redux/store";
import { toggleTheme } from "./themeSlice";

export default function ToggleThemeButton({
  color,
  size,
}: {
  color: string;
  size?: number;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { siteColors, themeState } = useTheme();
  return (
    <Anchor onClick={() => dispatch(toggleTheme())} style={{ margin: 20 }}>
      {themeState == "dark" ? (
        <FiMoon
          size={size ?? 26}
          color={siteColors.text.primary}
          style={{ alignSelf: "center" }}
        />
      ) : (
        <FiSun size={size ?? 26} color={siteColors.text.primary} />
      )}
    </Anchor>
  );
}
