package com.backend.crazy8s;

import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SocketModule {
    
    private final SocketIOServer server;
    private final GameService service;

    public SocketModule(SocketIOServer server, GameService service) {
        this.server = server;
        this.service = service;
        server.addConnectListener(onConnected());
        server.addDisconnectListener(onDisconnected());
        server.addEventListener("new_game_request", Boolean.class, newGame());
        server.addEventListener("play_card_request", PlayCardRequestSocket.class, playCard());
        server.addEventListener("draw_card_request", GameState.class, drawCard());
    }

    private ConnectListener onConnected() {
        return (client) -> {
            String room = client.getHandshakeData().getSingleUrlParam("room");
            client.joinRoom(room);
            log.info("Socket ID[{}] Connected to Socket", client.getSessionId().toString());
        };
    }

    private DisconnectListener onDisconnected() {
        return (client) -> {
            log.info("Socket ID[{}] Disconnected to Socket", client.getSessionId().toString());
        };
    }

    private DataListener<Boolean> newGame() {
        return (senderClient, data, ackSender) -> {
            log.info(data.toString());
            // probably a better way to get room ID
            String room = senderClient.getHandshakeData().getSingleUrlParam("room");
            senderClient.getNamespace().getRoomOperations(room).sendEvent("new_game", service.createGame());
        };
    }

    private DataListener<PlayCardRequestSocket> playCard() {
        return (senderClient, data, ackSender) -> {
            log.info(data.toString());
            String room = senderClient.getHandshakeData().getSingleUrlParam("room");
            senderClient.getNamespace().getRoomOperations(room).sendEvent("play_card", service.playCard
            (data.getState(), 
            data.getCardIndex(), 
            data.getChosenSuit()));
        };
    }  

    private DataListener<GameState> drawCard() {
        return (senderClient, data, ackSender) -> {
            log.info(data.toString());
            String room = senderClient.getHandshakeData().getSingleUrlParam("room");
            senderClient.getNamespace().getRoomOperations(room).sendEvent("draw_card", service.drawCard(data));
        };
    }  
}
