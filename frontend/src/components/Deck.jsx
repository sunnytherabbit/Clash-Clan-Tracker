import { CardImage } from "./GameImage";
import styles from "./Deck.module.css";

export default function Deck({ cards, size }) {
    if (!cards || cards.length === 0) return null;

    return (
        <div className={styles.deck}>
            {cards.map((card, i) => (
                <div key={`${card?.id || card?.name}-${i}`} className={styles.card}>
                    <CardImage card={card} size={size} />
                    <span className={styles.level}>Lv {card?.level || 1}</span>
                </div>
            ))}
        </div>
    );
}
