import "@/styles/globals.scss";
import "@ucc/common-ui/dist/index.css";
import Router from "./router";
import "./styles/globals.scss";
import { Toaster } from "@ucc/common-ui";
import CreateOrgGrpListener from "./components/CreateOrgGrp/CreateOrgGrpListener";

interface AppProps {
  listenerOnly?: boolean;
}

function App({ listenerOnly }: AppProps) {
  if (listenerOnly) {
    return <CreateOrgGrpListener />;
  }

  return (
    <>
      <Toaster position="top-right" />
      <Router />
    </>
  );
}

export default App;
