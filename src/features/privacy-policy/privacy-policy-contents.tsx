import ReactMarkdown from "react-markdown";
import useGlobalMediaQuery from "../../common/hooks/useGlobalMediaQueries";
import useTheme from "../../common/hooks/useTheme";
import HomeContentLayout from "../home/home-layout";

export default function PrivacyPolicyContents({ data }: { data: string }) {
  const { siteColors } = useTheme();
  const { sm } = useGlobalMediaQuery();
  return (
    <HomeContentLayout
      id="priv"
      height="auto"
      backgroundColor={siteColors.background}
      extraStyles={{
        color: siteColors.text.primary,
        width: sm ? "100vw" : "60vw",
        padding: 30,
        textAlign: "start",
        alignItems: "flex-start",
      }}
    >
      <ReactMarkdown children={data} />
    </HomeContentLayout>
  );
}
