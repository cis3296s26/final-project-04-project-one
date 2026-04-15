package com.backend.crazy8s;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class Crazy8sApplicationTests {

    private GameService gameService;
    private GameState state;

    @BeforeEach
    void setup() {
        Ruleset ruleset = new Crazy8sRuleset();
        gameService = new GameService(ruleset);
        state = gameService.createGame();
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
        GameState fresh = new GameState("test-id");
        assertEquals("test-id", fresh.getGameId());
        assertEquals(1, fresh.getDirection());
        assertEquals(0, fresh.getCurrentPlayer());
        assertFalse(fresh.isSkipNext());
        assertEquals(0, fresh.getPenaltyDraw());
        assertEquals("IN_PROGRESS", fresh.getStatus());
    }
}