import Discover from "@/components/Discover";
import PageScaffold from "@/components/PageScaffolding";
import Link from "next/link";

export default function Home() {
  return (
    <PageScaffold route="/home">
      <Discover />
    </PageScaffold>
  );
}
