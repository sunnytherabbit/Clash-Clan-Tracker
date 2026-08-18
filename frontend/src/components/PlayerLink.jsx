import { Link } from "react-router-dom";
import styles from "./PlayerLink.module.css";

export function PlayerLink({ tag, name, className }) {
    const display = name || tag;
    const safeTag = tag ? encodeURIComponent(tag) : "";

    return (
        <Link to={`/player/${safeTag}`} className={`${styles.link} ${className || ""}`}>
            {display}
        </Link>
    );
}
