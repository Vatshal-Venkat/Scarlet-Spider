import { createContext, useContext, useState, useCallback } from "react";

const SpideyContext = createContext(null);

export function SpideyProvider({ children }) {
  const [chatState, setChatState] = useState("idle"); // "idle" | "generating" | "active"
  const [messageCount, setMessageCount] = useState(0);
  const [triggerSwingLike, setTriggerSwingLike] = useState(false);
  const [streamingStarted, setStreamingStarted] = useState(false);
  const [inferenceError, setInferenceError] = useState(false);

  const fireSwingLike = useCallback(() => setTriggerSwingLike(true), []);
  const consumeSwingLike = useCallback(() => setTriggerSwingLike(false), []);

  const fireStreamingStarted = useCallback(() => {
    setStreamingStarted(true);
    setTimeout(() => setStreamingStarted(false), 50);
  }, []);

  const fireInferenceError = useCallback(() => {
    setInferenceError(true);
    setTimeout(() => setInferenceError(false), 50);
  }, []);

  return (
    <SpideyContext.Provider value={{
      chatState, setChatState,
      messageCount, setMessageCount,
      triggerSwingLike, fireSwingLike, consumeSwingLike,
      streamingStarted, fireStreamingStarted,
      inferenceError, fireInferenceError,
    }}>
      {children}
    </SpideyContext.Provider>
  );
}

export function useSpidey() {
  return useContext(SpideyContext);
}
