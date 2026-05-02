package com.backend.crazy8s;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class GameSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameSocketController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/game/{gameId}/play")
public void playCard(@DestinationVariable String gameId, PlayCardRequest request) {
    try {
        GameState updatedState = gameService.playCard(
            gameId,
            request.getPlayerIndex(),
            request.getCardIndex(),
            request.getChosenSuit()
        );
        messagingTemplate.convertAndSend("/topic/game/" + gameId, updatedState);
    } catch (Exception e) {
        GameState currentState = gameService.getGame(gameId);
        messagingTemplate.convertAndSend("/topic/game/" + gameId, currentState);
    }
}

    @MessageMapping("/game/{gameId}/draw")
public void drawCard(@DestinationVariable String gameId, DrawCardRequest request) {
    try {
        GameState updatedState = gameService.drawCard(gameId, request.getPlayerIndex());
        messagingTemplate.convertAndSend("/topic/game/" + gameId, updatedState);
    } catch (Exception e) {
        GameState currentState = gameService.getGame(gameId);
        messagingTemplate.convertAndSend("/topic/game/" + gameId, currentState);
    }
}
}
