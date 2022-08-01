import { Button, ButtonVariant } from "@mantine/core";
import { CSSProperties } from "react";
export default function GenericButton({
  text,
  onClick,
  color,
  extraStyles,
  isLinkable,
  href,
  customVariant,
  newTab,
}: {
  text: string;
  onClick?: () => void;
  color: string;
  extraStyles?: CSSProperties | undefined;
  isLinkable?: boolean;
  href?: string;
  customVariant?: ButtonVariant | undefined;
  newTab?: boolean;
}) {
  return (
    <Button
      component={isLinkable ? "a" : "button"}
      href={isLinkable ? (href as any) : null}
      target={newTab ? "_blank" : "_self"}
      variant={customVariant ?? "outline"}
      color={color}
      radius="xs"
      size="md"
      onClick={onClick}
      style={extraStyles}
    >
      {text}
    </Button>
  );
}
