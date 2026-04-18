import { visit } from "unist-util-visit";
import { Title } from "@mantine/core";
import { IconLink } from "@tabler/icons";

export function extractHeadings(markdown: any) {
  const headings: { text: string; id: string; level: number }[] = [];

  visit(markdown, /{*}/ as any, (node: any) => {
    const type = node.type;
    if (type?.includes("h")) {
      const text = node.children.map((child: any) => child.text).join("");
      const id = text.toLowerCase().replace(/\s+/g, "-");

      headings.push({ text, id, level: Number(type.substring(1)) });
    }
  });

  return headings;
}

export const isHeaderLink = (props) =>
  props.url && props.url.includes && props.url.includes("#");

export const extractHeaderId = (props) => {
  return props?.children?.props?.content
    ?.map((t) => t?.text?.replaceAll(" ", "-"))
    .join("")
    .toLowerCase();
};

export const constructHeading = (props, level) => {
  const id = extractHeaderId(props);

  return (
    <div
      id={id}
      className="mt-6 mb-6"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Title order={level} style={{ color: "orangered", margin: 0 }} {...props} />
      <a
        href={`#${id}`}
        aria-label={`Link to section ${id}`}
        title="Copy section link"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "gray",
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        <IconLink size={16} />
      </a>
    </div>
  );
};
