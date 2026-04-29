package com.backend.crazy8s.web;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.crazy8s.model.GameState;
import com.backend.crazy8s.model.PlayCardRequest;
import com.backend.crazy8s.rules.RulesetFactory;
import com.backend.crazy8s.service.GameService;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {

    private final GameService gameService;
    private final RulesetFactory rulesetFactory;
    private final Map<String, GameState> games = new HashMap<>();

    public GameController(GameService gameService, RulesetFactory rulesetFactory) {
        this.gameService = gameService;
        this.rulesetFactory = rulesetFactory;
    }

    @PostMapping("/new")
    public GameState newGame() {
        // default ruleset for testing
        GameState state = gameService.createGame(rulesetFactory.get("crazy8sRuleset"));
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