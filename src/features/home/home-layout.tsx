import { CSSProperties } from "react";

export default function HomeContentLayout({
  children,
  id,
  height,
  backgroundColor,
  extraStyles,
}: {
  children: any;
  id: string;
  height: any;
  backgroundColor: string;
  extraStyles?: CSSProperties | undefined;
}) {
  return (
    <section
      id={id}
      style={{
        backgroundColor,
        width: "100vw",
        minHeight: height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: 140,
        ...(extraStyles as object),
      }}
    >
      {children}
    </section>
  );
}
