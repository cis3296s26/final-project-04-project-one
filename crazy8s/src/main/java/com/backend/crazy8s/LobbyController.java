package com.backend.crazy8s;

import java.util.Map;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lobby")
@CrossOrigin(origins = "*")
public class LobbyController {

    private final LobbyService lobbyService;
    private final SimpMessagingTemplate messagingTemplate;

    public LobbyController(LobbyService lobbyService, SimpMessagingTemplate messagingTemplate) {
        this.lobbyService = lobbyService;
        this.messagingTemplate = messagingTemplate;
    }

    // Creates a new private room. Returns the room code, the caller's playerId, and their slot index (always 0 for the creator).
    // Broadcasts the updated Room to /topic/lobby/{roomCode}.
    @PostMapping("/create")
    public Map<String, Object> createRoom(@RequestBody Map<String, String> body) {
        String displayName = body.getOrDefault("displayName", "Player");
        String playerId = UUID.randomUUID().toString();
        Room room = lobbyService.createRoom(displayName, playerId);
        messagingTemplate.convertAndSend("/topic/lobby/" + room.getRoomCode(), room);
        return Map.of(
            "roomCode", room.getRoomCode(),
            "playerId", playerId,
            "playerIndex", 0
        );
    }

    // Joins an existing room by room code. Returns the caller's playerId and assigned slot index. Broadcasts the updated Room to all lobby subscribers.
    @PostMapping("/join")
    public Map<String, Object> joinRoom(@RequestBody Map<String, String> body) {
        String displayName = body.getOrDefault("displayName", "Player");
        String roomCode = body.get("roomCode");
        String playerId = UUID.randomUUID().toString();
        Room room = lobbyService.joinRoom(roomCode, displayName, playerId);
        int playerIndex = room.getSlotOf(playerId);
        messagingTemplate.convertAndSend("/topic/lobby/" + roomCode, room);
        return Map.of(
            "roomCode", roomCode,
            "playerId", playerId,
            "playerIndex", playerIndex
        );
    }

    /* Starts the game for a room. Broadcasts:
       - The initial GameState to /topic/game/{gameId} (game subscribers)
       - A {gameId} payload to /topic/lobby/{roomCode} so lobby clients know which gameId to subscribe to and navigate to the game screen.*/
    @PostMapping("/{roomCode}/start")
    public Map<String, String> startGame(@PathVariable String roomCode) {
        GameState state = lobbyService.startGame(roomCode);
        messagingTemplate.convertAndSend("/topic/game/" + state.getGameId(), state);
        messagingTemplate.convertAndSend("/topic/lobby/" + roomCode, (Object) Map.of("gameId", state.getGameId()));
        return Map.of("gameId", state.getGameId());
    }
}
