import React, { useContext, createContext } from 'react';
import { EventEmitter } from 'events';
import _ from 'lodash';

const SignalContext = createContext();

export const SignalProvider = ({ connection, children }) => (
  <SignalContext.Provider value={connection}>
    {children}
  </SignalContext.Provider>
);

export const createSignalConnection = (endpoint) => {
  const emitter = new EventEmitter();
  const ws = new WebSocket(endpoint);

  ws.onmessage = (message) => {
    const messageJson = JSON.parse(message.data);
    if (messageJson.type) {
      emitter.emit(messageJson.type, _.omit(messageJson, 'type'));
    }
  };

  emitter.send = (data) => {
    ws.send(JSON.stringify(data));
  };

  return emitter;
};

export default function useSignalConnection() {
  const connection = useContext(SignalContext);

  const callById = (to) => {
    connection.send({
      type: 'call',
      to,
    });
  };

  return {
    connection,
    callById,
  };
}
