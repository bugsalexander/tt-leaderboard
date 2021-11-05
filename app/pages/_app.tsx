import "../styles/main.scss";
import type { AppProps } from "next/app";
import { PageLayout } from "../components/Layout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PageLayout>
      <Component {...pageProps} />
    </PageLayout>
  );
}

export default MyApp;
