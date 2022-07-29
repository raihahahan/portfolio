import { useRouter } from "next/router";
import HomeIntro from "../common/components/components-index";
import useTheme from "../common/hooks/useTheme";
import MainLayout from "../common/layouts/layouts-index";
export default function Home() {
  const router = useRouter();
  const { siteColors } = useTheme();

  return (
    <MainLayout home>
      <HomeIntro router={router} />
    </MainLayout>
  );
}
