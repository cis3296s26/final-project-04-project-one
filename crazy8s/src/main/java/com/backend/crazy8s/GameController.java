package com.backend.crazy8s;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://final-project-04-project-one.onrender.com"
})
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/{gameId}")
    public GameState getGame(@PathVariable String gameId) {
        GameState state = gameService.getGame(gameId);
        if (state == null) {
            throw new RuntimeException("Game not found");
        }
        return state;
    }

    @PostMapping("/{gameId}/draw")
    public GameState drawCard(@PathVariable String gameId, @RequestBody DrawCardRequest request) {
        return gameService.drawCard(gameId, request.getPlayerIndex());
    }

    @PostMapping("/{gameId}/play")
    public ResponseEntity<?> playCard(@PathVariable String gameId, @RequestBody PlayCardRequest request) {
        GameState state = games.get(gameId);
        if (state == null) {
            return ResponseEntity.status(404).body("Game not found");
        }
        try {
            GameState updated = gameService.playCard(state, request.getCardIndex(), request.getChosenSuit());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}