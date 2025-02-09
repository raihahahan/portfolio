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
    <Anchor
      onClick={() => dispatch(toggleTheme())}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size ? `${size + 20}px` : "46px",
        height: size ? `${size + 20}px` : "46px",
        backgroundColor: siteColors.header,
        borderRadius: "50%",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {themeState === "dark" ? (
        <FiMoon size={size ?? 26} color={siteColors.text.primary} />
      ) : (
        <FiSun size={size ?? 26} color={siteColors.text.primary} />
      )}
    </Anchor>
  );
}
