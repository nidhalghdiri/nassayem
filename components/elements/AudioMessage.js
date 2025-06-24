"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AudioMessage({ waId, messageId }) {
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    const messageRef = doc(db, `conversations/${waId}/messages`, messageId);
    const unsubscribe = onSnapshot(messageRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.mediaType === "audio" && data.audioUrl) {
          setAudioUrl(data.audioUrl);
        }
      }
    });

    return () => unsubscribe();
  }, [waId, messageId]);

  return (
    <div className="audio-message">
      {audioUrl ? (
        <audio controls className="w-full max-w-md">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <p>Loading audio...</p>
      )}
    </div>
  );
}
