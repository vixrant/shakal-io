import { useState } from 'react';

function useVideoCall(config) {
  const { ws, iceServers, callSettings } = config;
  const [localStream, setLocalStream] = useState();
  const [remoteTracks, setRemoteTracks] = 
}
