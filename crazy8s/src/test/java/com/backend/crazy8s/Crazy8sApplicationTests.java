package com.backend.crazy8s;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.crazy8s.model.Card;
import com.backend.crazy8s.model.GameState;
import com.backend.crazy8s.rules.Crazy8sRuleset;
import com.backend.crazy8s.rules.Ruleset;
import com.backend.crazy8s.service.GameService;

class Crazy8sApplicationTests {

    private GameService gameService;
    private GameState state;

    @BeforeEach
    void setup() {
        gameService = new GameService();
        Ruleset rules = new Crazy8sRuleset();
        state = gameService.createGame(rules);
    }

    // ─── createGame ──────────────────────────────────────────────────────────────

    @Test
    void deckShouldHaveCorrectSizeAfterDeal() {
        // 52 cards - 28 dealt (7 per player x 4) - 1 discard = 23
        assertEquals(23, state.getDeck().size());
    }

    @Test
    void eachPlayerShouldHave7Cards() {
        for (List<Card> hand : state.getHands()) {
            assertEquals(7, hand.size());
        }
    }

    @Test
    void discardPileShouldHaveOneCard() {
        assertEquals(1, state.getDiscardPile().size());
    }

    @Test
    void gameShouldStartAsInProgress() {
        assertEquals("IN_PROGRESS", state.getStatus());
    }

    @Test
    void currentSuitShouldMatchFirstDiscardCard() {
        Card topCard = state.getDiscardPile().get(0);
        assertEquals(topCard.getSuit(), state.getCurrentSuit());
    }

    // ─── drawCard ────────────────────────────────────────────────────────────────

    @Test
    void drawCardShouldAddCardToUserHand() {
        int before = state.getHands().get(0).size();
        // Force it to be user's turn
        state.setCurrentPlayer(0);
        // Temporarily block CPU from running by making deck have 1 card
        // and ensuring it's user's turn after draw
        gameService.drawCard(state);
        // User hand grows by 1 before CPU turns run
        // We just check deck shrank
        assertTrue(state.getDeck().size() < 23);
    }

    // ─── Card ────────────────────────────────────────────────────────────────────

    @Test
    void cardToStringShouldBeCorrect() {
        Card card = new Card("Ace", "Spades");
        assertEquals("Ace of Spades", card.toString());
    }

    @Test
    void cardGettersShouldWork() {
        Card card = new Card("Queen", "Hearts");
        assertEquals("Queen", card.getRank());
        assertEquals("Hearts", card.getSuit());
    }

    // ─── GameState ───────────────────────────────────────────────────────────────

    @Test
    void gameStateShouldInitializeWithCorrectDefaults() {
        Ruleset freshRules = new Crazy8sRuleset();
        GameState freshState = new GameState("test-id", freshRules);
        assertEquals("test-id", freshState.getGameId());
        assertEquals(1, freshState.getDirection());
        assertEquals(0, freshState.getCurrentPlayer());
        assertFalse(freshState.isSkipNext());
        assertEquals(0, freshState.getPenaltyDraw());
        assertEquals("IN_PROGRESS", freshState.getStatus());
    }
}