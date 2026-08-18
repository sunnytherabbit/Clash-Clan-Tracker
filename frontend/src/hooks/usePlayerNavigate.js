import { useNavigate } from "react-router-dom";

export function usePlayerNavigate(tag) {
    const navigate = useNavigate();
    return () => {
        if (!tag) return;
        navigate(`/player/${encodeURIComponent(tag)}`);
    };
}
