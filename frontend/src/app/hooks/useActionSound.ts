import { useCallback } from "react";
import { playTone } from "./sound";

export function useActionSound() {
  const playSendSound = useCallback(() => {
    playTone("send");
  }, []);

  return { playSendSound };
}
