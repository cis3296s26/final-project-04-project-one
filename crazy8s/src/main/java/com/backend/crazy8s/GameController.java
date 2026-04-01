package com.backend.crazy8s;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {

    private final GameService gameService;
    private final Map<String, GameState> games = new HashMap<>();

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/new")
    public GameState newGame() {
        GameState state = gameService.createGame();
        games.put(state.getGameId(), state);
        return state;
    }

    @GetMapping("/{gameId}")
    public GameState getGame(@PathVariable String gameId) {
        GameState state = games.get(gameId);
        if (state == null) {
            throw new RuntimeException("Game not found");
        }
        return state;
    }

    @PostMapping("/{gameId}/draw")
    public GameState drawCard(@PathVariable String gameId) {
        GameState state = games.get(gameId);
        if (state == null) {
            throw new RuntimeException("Game not found");
        }
        return gameService.drawCard(state);
    }

    @PostMapping("/{gameId}/play")
    public GameState playCard(@PathVariable String gameId, @RequestBody PlayCardRequest request) {
        GameState state = games.get(gameId);
        if (state == null) {
            throw new RuntimeException("Game not found");
        }
        return gameService.playCard(state, request.getCardIndex(), request.getChosenSuit());
    }
}