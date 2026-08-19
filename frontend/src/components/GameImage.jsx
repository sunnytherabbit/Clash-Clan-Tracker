import { useState } from "react";
import { useAssets, useAssetImage } from "../lib/assets";
import styles from "./GameImage.module.css";

function Img({ src, fallbackSrc, alt, className, size }) {
    const [failed, setFailed] = useState(false);

    const currentSrc = !failed ? src : (fallbackSrc || src);
    const initial = (alt || "?")[0].toUpperCase();

    if (!currentSrc) {
        return (
            <div className={styles.placeholder} style={{ width: size, height: size }}>
                {initial}
            </div>
        );
    }

    return (
        <img
            src={currentSrc}
            alt={alt}
            className={`${styles.image} ${className || ""}`}
            style={{ width: size, height: size }}
            onError={() => {
                if (failed || !fallbackSrc) return;
                setFailed(true);
            }}
        />
    );
}

export function BadgeImage({ id, size = "3rem", className }) {
    const assets = useAssets();
    const src = useAssetImage("badges", id, assets);
    if (assets.loading || !src) return <div className={styles.placeholder} style={{ width: size, height: size }} />;
    return <Img src={src} alt="clan badge" className={className} size={size} />;
}

export function PlayerBadgeImage({ badge, size = "3rem", className }) {
    const src = badge?.iconUrls?.large;
    if (!src) {
        return (
            <div className={styles.placeholder} style={{ width: size, height: size }}>
                {badge?.name ? badge.name[0] : "B"}
            </div>
        );
    }
    return <Img src={src} alt={badge?.name || "badge"} className={className} size={size} />;
}

export function ArenaImage({ id, name, size = "6rem", className }) {
    const assets = useAssets();
    const src = useAssetImage("arenas", id, assets);
    if (assets.loading || !src) {
        return (
            <div className={styles.placeholder} style={{ width: size, height: size }}>
                {name ? name[0] : "A"}
            </div>
        );
    }
    return <Img src={src} alt={name || "arena"} className={className} size={size} />;
}

export function CardImage({ card, size = "4rem", className }) {
    const assets = useAssets();
    const fallbackSrc = useAssetImage("cards", card?.id, assets);
    const evolved = card?.evolutionLevel > 0 && card?.iconUrls?.evolutionMedium;
    const src = evolved || card?.iconUrls?.medium || card?.iconUrls?.heroMedium;

    if (!src && !fallbackSrc) {
        return (
            <div className={styles.placeholder} style={{ width: size, height: size }}>
                {card?.name ? card.name[0] : "C"}
            </div>
        );
    }

    return (
        <Img
            src={src}
            fallbackSrc={fallbackSrc}
            alt={card?.name || "card"}
            className={className}
            size={size}
        />
    );
}
