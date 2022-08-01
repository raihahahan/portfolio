import Image from "next/image";
import useTheme from "../hooks/useTheme";

export default function RectangleTitle({
  widthSize,
  type,
}: {
  widthSize: number;
  type?: "default" | "dark";
}) {
  const WIDTH = 675;
  const HEIGHT = 245;
  const RATIO = HEIGHT / WIDTH;
  let src;
  switch (type) {
    case "default":
      src = "/images/header-title.png";
      break;
    case "dark":
      src = "/images/header-title-light.png";
      break;
    default:
      src = "/images/header-title.png";
      break;
  }

  return (
    <Image
      priority
      src={src as string}
      alt="raihahahan"
      width={widthSize}
      height={RATIO * widthSize}
    />
  );
}
