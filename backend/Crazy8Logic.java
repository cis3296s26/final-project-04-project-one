import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;

/**
 * Crazy8Logic - 4 Player Game (User, Player 2, Player 3, Player 4)
 * Rules: 8=Wild, Queen=Skip, Ace=Reverse, 2=Draw 2
 * Starting Hand: 7 Cards
 */
public class Crazy8Logic {

    static class Card {
        String rank;
        String suit;

        Card(String rank, String suit) {
            this.rank = rank;
            this.suit = suit;
        }

        @Override
        public String toString() {
            return rank + " of " + suit;
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean overallRunning = true;

        while (overallRunning) {
            // 1. Setup Deck
            List<Card> deck = new ArrayList<>();
            String[] suits = {"Hearts", "Diamonds", "Clubs", "Spades"};
            String[] ranks = {"Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"};

            for (String suit : suits) {
                for (String rank : ranks) {
                    deck.add(new Card(rank, suit));
                }
            }

            Collections.shuffle(deck);

            // 2. Setup 4 Players with 7 cards each
            List<List<Card>> hands = new ArrayList<>();
            String[] playerNames = {"User", "Player 2", "Player 3", "Player 4"};

            for (int i = 0; i < 4; i++) {
                List<Card> hand = new ArrayList<>();
                for (int j = 0; j < 7; j++) hand.add(deck.remove(0));
                hands.add(hand);
            }

            // 3. Setup Discard Pile
            List<Card> discardPile = new ArrayList<>();
            Card firstCard = deck.remove(0);
            discardPile.add(firstCard);
            String currentSuit = firstCard.suit;

            int currentPlayer = 0;
            int direction = 1; 
            boolean skipNext = false;
            int penaltyDraw = 0;
            boolean gameRunning = true;

            System.out.println("\n=== NEW GAME OF CRAZY 8s ===");

            // 4. Main Game Loop
            while (gameRunning) {
                String name = playerNames[currentPlayer];
                Card topCard = discardPile.get(discardPile.size() - 1);

                // Check for skips                
                if (skipNext) {
                    System.out.println(name + " was skipped!");
                    skipNext = false;
                    currentPlayer = (currentPlayer + direction + 4) % 4;
                    continue;
                }

                // Check for penalties (Draw 2)
                if (penaltyDraw > 0) {
                    System.out.println(name + " must draw " + penaltyDraw + " cards!");

                    for (int i = 0; i < penaltyDraw; i++) {
                        if (!deck.isEmpty()) hands.get(currentPlayer).add(deck.remove(0));
                    }
                    
                    penaltyDraw = 0;
                    currentPlayer = (currentPlayer + direction + 4) % 4;
                    continue;
                }

                if (currentPlayer == 0) {
                    // --- USER TURN ---
                    boolean turnOver = false;

                    while (!turnOver) {
                        System.out.println("\n--- YOUR TURN (User) ---");
                        System.out.println("Discard Pile Top: " + topCard);
                        System.out.println("1. Draw a card");
                        System.out.println("2. See my cards");
                        System.out.println("3. Play a card");
                        System.out.println("4. Quit Current Game");
                        System.out.print("Choose: ");

                        String choice = scanner.nextLine().trim();

                        if (choice.equals("1")) {
                            if (!deck.isEmpty()) {
                                Card drawn = deck.remove(0);
                                hands.get(0).add(drawn);
                                System.out.println("You drew: " + drawn);
                            } 
                            
                            else {System.out.println("Deck empty.");}

                            turnOver = true;

                        } 
                        
                        else if (choice.equals("2")) {

                            for (int i = 0; i < hands.get(0).size(); i++) {
                                System.out.println((i + 1) + ". " + hands.get(0).get(i));
                            }

                        } 
                        
                        else if (choice.equals("3")) {

                            System.out.println("\n--- YOUR HAND ---");

                            for (int i = 0; i < hands.get(0).size(); i++) {
                                System.out.println((i + 1) + ". " + hands.get(0).get(i));
                            }

                            System.out.print("Card number: ");

                            try {
                                int idx = Integer.parseInt(scanner.nextLine().trim()) - 1;
                                Card s = hands.get(0).get(idx);

                                if (s.rank.equals("8") || s.rank.equals(topCard.rank) || s.suit.equals(currentSuit)) {
                                    
                                    hands.get(0).remove(idx);
                                    discardPile.add(s);
                                    currentSuit = s.suit;
                                    
                                    System.out.println("You played: " + s);
                                    System.out.println("Your remaining hand: " + hands.get(0));

                                    if (s.rank.equals("8")) {
                                        System.out.print("New suit (1-Hearts, 2-Diamonds, 3-Clubs, 4-Spades): ");
                                        String sc = scanner.nextLine().trim();

                                        if (sc.equals("1")) currentSuit = "Hearts";
                                        else if (sc.equals("2")) currentSuit = "Diamonds";
                                        else if (sc.equals("3")) currentSuit = "Clubs";
                                        else currentSuit = "Spades";
                                        System.out.println("Suit is now " + currentSuit);
                                    } 
                                    
                                    else if (s.rank.equals("Queen")) skipNext = true;
                                    else if (s.rank.equals("Ace")) direction *= -1;
                                    else if (s.rank.equals("2")) penaltyDraw += 2;

                                    turnOver = true;

                                } 
                                
                                else {
                                    System.out.println("Invalid Move.");
                                }
                            } 
                            
                            catch (Exception e) { System.out.println("Error selecting card."); }

                        } 
                        
                        else if (choice.equals("4")) {
                            System.out.println("Exiting current game...");
                            gameRunning = false;
                            turnOver = true;
                        }
                    }
                } 
                
                else {
                    // --- CPU TURN (Simple If-Else Ladder) ---
                    System.out.println("\n--- " + name + "'s TURN ---");
                    List<Card> myHand = hands.get(currentPlayer);
                    Card cardToPlay = null;

                    // Ladder Step 1: Match Rank or Suit
                    for (Card c : myHand) {
                        if (c.rank.equals(topCard.rank) || c.suit.equals(currentSuit)) {
                            cardToPlay = c;
                            break;
                        }
                    }

                    // Ladder Step 2: Try an 8
                    if (cardToPlay == null) {
                        for (Card c : myHand) {
                            if (c.rank.equals("8")) {
                                cardToPlay = c;
                                break;
                            }
                        }
                    }

                    // Ladder Step 3: Play or Draw
                    if (cardToPlay != null) {
                        myHand.remove(cardToPlay);
                        discardPile.add(cardToPlay);
                        currentSuit = cardToPlay.suit;
                        System.out.println(name + " played: " + cardToPlay);
                        System.out.println(name + "'s remaining hand: " + myHand);
                        
                        if (cardToPlay.rank.equals("Queen")) skipNext = true;
                        else if (cardToPlay.rank.equals("Ace")) direction *= -1;
                        else if (cardToPlay.rank.equals("2")) penaltyDraw += 2;
                    } 
                    
                    else {

                        if (!deck.isEmpty()) {
                            myHand.add(deck.remove(0));
                            System.out.println(name + " drew a card.");
                        } 
                        
                        else {
                            System.out.println(name + " skipped.");
                        }
                    }
                }

                // Win check
                if (hands.get(currentPlayer).isEmpty()) {
                    System.out.println("\n" + name.toUpperCase() + " WINS!");
                    gameRunning = false;
                } 
                
                else {
                    currentPlayer = (currentPlayer + direction + 4) % 4;
                }
            }

            // 5. Ask to Play Again
            System.out.print("\nGame Over. Play a new game? (y/n): ");
            String playAgainChoice = scanner.nextLine().trim().toLowerCase();

            if (!playAgainChoice.equals("y")) {
                overallRunning = false;
            }
        }

        System.out.println("Thanks for playing!");
        scanner.close();
    }
}
