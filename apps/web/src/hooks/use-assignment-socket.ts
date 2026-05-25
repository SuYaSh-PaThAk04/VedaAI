"use client";

import type { JobProgressEvent } from "@vedaai/shared";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { API_URL } from "@/lib/config";
import { useAssignmentStore } from "@/store/assignment-store";

export function useAssignmentSocket(assignmentId?: string) {
  const setProgress = useAssignmentStore((state) => state.setProgress);

  useEffect(() => {
    if (!assignmentId) {
      return;
    }

    const socket = io(API_URL, {
      transports: ["websocket"]
    });

    socket.emit("assignment:subscribe", assignmentId);
    socket.on("assignment:progress", (event: JobProgressEvent) => {
      if (event.assignmentId === assignmentId) {
        setProgress(event);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [assignmentId, setProgress]);
}
