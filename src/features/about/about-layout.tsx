export default function AboutLayout({ children }: { children: JSX.Element }) {
  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: 40,
      }}
    >
      {children}
    </div>
  );
}
