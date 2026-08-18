import { useContext } from "react";
import { RiverRaceContext } from "../context/RiverRaceContext";

export function useRiverRace() {
    return useContext(RiverRaceContext);
}
