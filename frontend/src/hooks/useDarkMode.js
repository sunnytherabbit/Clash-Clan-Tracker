import { useContext } from "react";
import { DarkModeContext } from "../context/DarkModeContext.js";

export function useDarkMode() {
    return useContext(DarkModeContext);
}
