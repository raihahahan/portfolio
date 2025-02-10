import { Text } from "@mantine/core";
import Image from "next/image";
import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import { aboutDataType } from "./about-types";
import { siteColorsType } from "../theme/theme-types";
import { aboutImageSrc } from "./about-data";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { stringToBackTick } from "../../common/utils/strings";
import { CSSProperties } from "react";
import { useState } from "react";
import ReactCardFlip from "react-card-flip";

export function AboutSection({
  item,
  colors,
  center,
}: {
  item: aboutDataType;
  colors: siteColorsType;
  center?: boolean;
}) {
  return (
    <section
      id={item.id}
      key={item.id}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: center ? "center" : "flex-start",
      }}
    >
      <Text
        style={{
          color: colors.text.primary,
          paddingRight: 40,
          paddingLeft: 40,
          fontSize: 26,
          marginTop: 20,
          fontWeight: "bold",
        }}
      >
        {item.title}
      </Text>

      <AboutWrapper>
        <ReactMarkdown rehypePlugins={[rehypeRaw] as any}>
          {stringToBackTick(item.body, colors.text.links)}
        </ReactMarkdown>
      </AboutWrapper>

      <br />
    </section>
  );
}

export function AboutProfileIcon({
  width,
  height,
  url,
  extraStyles,
}: {
  width?: number | string;
  height?: number | string;
  url?: string;
  extraStyles?: CSSProperties;
}) {
  return (
    <Image
      alt="profile-icon"
      priority
      src={url ?? aboutImageSrc}
      width={width ?? "100vw"}
      height={height ?? "100vw"}
      style={extraStyles}
    />
  );
}

export function AboutWrapper({ children }: { children: JSX.Element }) {
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

const BackSide = ({ title }: { title: string }) => {
  const { xs } = useGlobalMediaQuery();
  return (
    <div
      style={{
        width: xs ? "150px" : "200px",
        height: xs ? "150px" : "200px",
        backgroundColor: "orange",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontSize: "18px",
        fontWeight: "bold",
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <span>{title}</span>

      {/* Film watermark effect */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          height: "20px",
          background:
            "repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "20px",
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          background:
            "repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 10px)",
        }}
      />
    </div>
  );
};

const FlipCard = ({ title, index }: { title: string; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { xs } = useGlobalMediaQuery();
  return (
    <div
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onTouchStart={() => setIsFlipped(true)}
      onTouchEnd={() => setIsFlipped(false)}
      style={{
        marginTop: 30,
        marginBottom: 30,
        width: xs ? "150px" : "200px",
        height: xs ? "150px" : "200px",
        marginLeft: index === 0 ? "0px" : "-30px", // Overlapping effect
        transform: `rotate(${index % 2 === 0 ? "-8deg" : "8deg"})`, // Alternate tilt
        transition: "transform 0.3s ease",
      }}
    >
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        <Image
          src={`/images/about/${title}`}
          objectFit="cover"
          width={xs ? 150 : 200}
          height={xs ? 150 : 200}
          alt={title}
          style={{
            borderRadius: 10,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        />
        <BackSide title={title} />
      </ReactCardFlip>
    </div>
  );
};

const FilmStrip = () => {
  const { sm, xs } = useGlobalMediaQuery();
  const titles = sm
    ? ["cycling.jpg", "piano.jpg"]
    : ["cycling.jpg", "piano.jpg", "turkiye.jpg", "orbital.jpg"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
      }}
    >
      {titles.map((title, index) => (
        <FlipCard key={index} title={title} index={index} />
      ))}
    </div>
  );
};

export default FilmStrip;
