import { Button, ButtonVariant, MantineColor } from "@mantine/core";
import React, { CSSProperties } from "react";
export default function GenericButton({
  text,
  onClick,
  color,
  extraStyles,
  isLinkable,
  href,
  customVariant,
  newTab,
  icon,
}: {
  text: string;
  onClick?: () => void;
  color: MantineColor;
  extraStyles?: CSSProperties | undefined;
  isLinkable?: boolean;
  href?: string;
  customVariant?: ButtonVariant | undefined;
  newTab?: boolean;
  icon?: React.ReactNode;
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
