package com.backend.crazy8s;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;
import java.util.List;

class Crazy8sApplicationTests {

    private GameService gameService;
    private GameState state;

    @BeforeEach
    void setup() {
        gameService = new GameService();
        Room mockRoom = new Room("test-room");
        mockRoom.addPlayer("P1");
        mockRoom.addPlayer("P2");
        mockRoom.addPlayer("P3");
        mockRoom.addPlayer("P4");
        state = gameService.createGame(mockRoom);
        gameService.saveGame(state);
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
        
        gameService.drawCard(state.getGameId(), 0);
        
        // User hand grows by 1
        assertEquals(before + 1, state.getHands().get(0).size());
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