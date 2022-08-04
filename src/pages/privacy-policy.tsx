import { GetStaticProps } from "next";
import PrivacyPolicyContents from "../features/privacy-policy/privacy-policy-contents";
import { getPrivacyPolicyAsync } from "../features/privacy-policy/privacy-policy-data";

export default function PrivacyPolicyPage({ data }: { data: string }) {
  return <PrivacyPolicyContents data={data} />;
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const data = await getPrivacyPolicyAsync();
    return {
      props: { data },
      revalidate: 10,
    };
  } catch (error) {
    return {
      props: {
        data: `Error fetching privacy policy -- ${JSON.stringify(error)}`,
      },
      revalidate: 10,
    };
  }
};
