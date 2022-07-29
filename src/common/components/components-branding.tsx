import Image from "next/image";

export default function RectangleTitle({
  widthSize,
  type,
}: {
  widthSize: number;
  type?: "default" | "white" | "default-dark";
}) {
  const WIDTH = 675;
  const HEIGHT = 245;
  const RATIO = HEIGHT / WIDTH;
  let src;
  switch (type) {
    case "default":
      src = "/images/header-title.png";
      break;
    case "white":
      src = "/images/melonbase_rectangle_3.png";
      break;
    case "default-dark":
      src = "/images/melonbase_rectangle_2.png";
    default:
      src = "/images/melonbase_rectangle_2.png";
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
