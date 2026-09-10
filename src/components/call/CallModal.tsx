
import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/layout/AuthProvider";
import { cn, getInitials } from "@/utils";
import type { Profile } from "@/types";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: Profile | null;
  callType: "audio" | "video";
  isIncoming?: boolean;
}

export function CallModal({ isOpen, onClose, targetUser, callType, isIncoming = false }: CallModalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen || !targetUser) return;

    const setupCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setIsConnected(true);
          startTimer();
        };

        const channel = supabase.channel(`call-${user?.id}-${targetUser.id}`);

        channel.on("broadcast", { event: "offer" }, async ({ payload }: any) => {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({ type: "broadcast", event: "answer", payload: { answer } });
        });

        channel.on("broadcast", { event: "answer" }, async ({ payload }: any) => {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
        });

        channel.on("broadcast", { event: "ice-candidate" }, async ({ payload }: any) => {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        });

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: "broadcast",
              event: "ice-candidate",
              payload: { candidate: event.candidate },
            });
          }
        };

        await channel.subscribe();

        if (!isIncoming) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({ type: "broadcast", event: "offer", payload: { offer } });
        }
      } catch (error) {
        console.error("Erreur appel:", error);
      }
    };

    setupCall();

    return () => {
      endCall();
    };
  }, [isOpen, targetUser, callType, isIncoming]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsConnected(false);
    setCallDuration(0);
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen || !targetUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      {callType === "video" && (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      )}

      <div className={cn("relative z-10 flex flex-col items-center", callType === "video" && "mt-auto mb-32")}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center mb-4">
            {targetUser.avatar_url ? (
              <img src={targetUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{getInitials(targetUser.display_name || "U")}</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{targetUser.display_name || targetUser.username}</h2>
          <p className="text-slate-400 text-sm mt-1">
            {isConnected ? formatDuration(callDuration) : isIncoming ? "Appel entrant..." : "Appel en cours..."}
          </p>
        </div>

        {callType === "video" && (
          <video ref={localVideoRef} autoPlay playsInline muted
            className={cn("absolute top-4 right-4 w-32 h-44 rounded-xl object-cover border-2 border-white/20", isVideoOff && "hidden")}
          />
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-20">
        <button onClick={toggleMute}
          className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all",
            isMuted ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20")}>
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {callType === "video" && (
          <button onClick={toggleVideo}
            className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all",
              isVideoOff ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20")}>
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        <button onClick={endCall} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all">
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}
