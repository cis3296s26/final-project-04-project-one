package com.backend.crazy8s;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/new")
    public ResponseEntity<GameState> newGame() {
        return ResponseEntity.ok(gameService.newGame());
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<?> getGame(@PathVariable String gameId) {
        GameState state = gameService.getGame(gameId);
        if (state == null) {
            return ResponseEntity.status(404).body("Game not found");
        }
        return ResponseEntity.ok(state);
    }

    @PostMapping("/{gameId}/draw")
    public ResponseEntity<?> drawCard(@PathVariable String gameId, @RequestBody DrawCardRequest request) {
        GameState state = gameService.drawCard(gameId, request.getPlayerIndex());
        if (state == null) return ResponseEntity.status(404).body("Game not found");
        return ResponseEntity.ok(state);
    }

    @PostMapping("/{gameId}/play")
    public ResponseEntity<?> playCard(@PathVariable String gameId, @RequestBody PlayCardRequest request) {
        try {
            GameState updated = gameService.playCard(
                gameId,
                request.getPlayerIndex(),
                request.getCardIndex(),
                request.getChosenSuit()
            );
            if (updated == null) return ResponseEntity.status(404).body("Game not found");
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}