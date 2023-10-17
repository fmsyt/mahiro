import { createContext } from "react";
import { PageProps } from "./interface";

interface AppContextProps {
  pages: PageProps[] | null;
  hostname?: string;
}

const AppContext = createContext<AppContextProps>({
  pages: null,
});

export default AppContext;
