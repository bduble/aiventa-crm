import React, { useRef, useEffect, useState } from "react";
import Peer from "peerjs";

export default function VideoChatModal({ open, onClose, roomId, localName = "You" }) {
  const [peerId, setPeerId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [connected, setConnected] = useState(false);
  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerRef = useRef();
  const callRef = useRef();

  useEffect(() => {
    if (!open) return;

    // 1. Init Peer
    const peer = new Peer(roomId); // One peer uses roomId, other uses random
    peerRef.current = peer;
    peer.on("open", (id) => setPeerId(id));

    // 2. Listen for calls
    peer.on("call", async (call) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideo.current.srcObject = stream;
      call.answer(stream);
      call.on("stream", (remoteStream) => {
        remoteVideo.current.srcObject = remoteStream;
        setConnected(true);
      });
      callRef.current = call;
    });

    return () => {
      peer.disconnect();
      peer.destroy();
    };
  }, [open, roomId]);

  // 3. Initiate call to remote peer
  const connect = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current.srcObject = stream;
    const call = peerRef.current.call(remoteId, stream);
    call.on("stream", (remoteStream) => {
      remoteVideo.current.srcObject = remoteStream;
      setConnected(true);
    });
    callRef.current = call;
  };

  if (!open) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-[95vw] max-w-lg relative flex flex-col gap-4">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <h2 className="font-bold text-xl mb-2">Video Chat</h2>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <video ref={localVideo} autoPlay playsInline muted className="rounded bg-black w-40 h-32" />
          <video ref={remoteVideo} autoPlay playsInline className="rounded bg-black w-40 h-32" />
        </div>
        <div className="text-xs text-gray-500">
          {peerId && (
            <div>
              <strong>Send this Link to Customer:</strong>
              <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded text-xs break-all my-2">
                {`${window.location.origin}/videochat/${peerId}`}
              </div>
              <button className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/videochat/${peerId}`)}>
                Copy Link
              </button>
            </div>
          )}
        </div>
        {!connected && (
          <div className="flex items-center gap-2">
            <input
              placeholder="Enter peer ID (from link)"
              value={remoteId}
              onChange={e => setRemoteId(e.target.value)}
              className="border rounded p-1"
            />
            <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={connect}>Connect</button>
          </div>
        )}
        {connected && <div className="text-green-600 text-sm">Connected! 🎥</div>}
      </div>
    </div>
  );
}
