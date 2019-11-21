import { useState, useEffect, useMemo } from 'react';
import { peerConnectionConfig } from './config';

export default function useVideoCall(params, peerConfig = peerConnectionConfig) {
  const [tracks, setTracks] = useState([]);
  const [remote, setRemote] = useState();
  const peer = useMemo(() => new RTCPeerConnection(peerConfig), [peerConfig]);

  const { localStream, signal } = params;

  useEffect((_) => {
    // Send tracks
    if (localStream) {
      const tracks = localStream.getTracks();
      for (const track of tracks) peer.addTrack(track); // TODO: Change to forEach?
    }

    peer.onicecandidate = (ice) => {
      console.log('got self ice candidate');
      if (ice.candidate === null) return;
      console.log(`candidate is ${  JSON.stringify(ice.candidate)}`);
      signal.send({
        type: 'signal',
        ice: ice.candidate,
        to: remote,
      });
    };

    peer.ontrack = (tevent) => {
      console.log('😆 GOT REMOTE STREAM');
      setTracks(tracks.push(tevent.track));
      this.dispatchEvent(new CustomEvent('track', { detail: tevent.track }));
    };
  }, [localStream]);

  async function createdDescription(description) {
    console.log('got local description');
    await this.peer.setLocalDescription(description);
    this.server.send({
      type: 'signal',
      sdp: this.peer.localDescription,
      to: params.remote,
    });
  }

  // Final object
  return Object.freeze({
    get remoteStream() {
      return new MediaStream(tracks);
    },
    localStream,
    remote,

    initiate(to) {
      setRemote(to);
      peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
        .then(createdDescription);
    },

    async gotSignalMessage({ ice, sdp, from }) {
      if (ice) {
        console.log('got remote ice candidate');
        await this.peer.addIceCandidate(new RTCIceCandidate(ice));
      }
      else if (sdp) {
        console.log('got remote description');
        await this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        if (sdp.type === 'offer') { // Only create answers in response to offers
          console.log('creating answer');
          setRemote(from);
          const description = await this.peer.createAnswer();
          this.createdDescription(description);
        }
      }
    },
  });
}
