import { useMediaQuery } from "@mantine/hooks";
import { breakpoints } from "../../styles/styles-constants";
import { globalMediaQueriesType } from "../../styles/styles-types";

export default function useGlobalMediaQuery(): globalMediaQueriesType {
  const xs = useMediaQuery(`(max-width: ${breakpoints.xs}px)"`);
  const sm = useMediaQuery(`(max-width: ${breakpoints.sm}px)`);
  const md = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
  const lg = useMediaQuery(`(max-width: ${breakpoints.lg}px)`);
  const xl = useMediaQuery(`(max-width: ${breakpoints.xl}px)`);

  return { xs, sm, md, lg, xl };
}
