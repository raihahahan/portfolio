import useTheme from "../common/hooks/useTheme";
import MainLayout from "../common/layouts/layouts-index";

export default function ProjectsPage() {
  const { siteColors } = useTheme();
  return (
    <MainLayout home={false}>
      <div>Hello</div>
    </MainLayout>
  );
}
