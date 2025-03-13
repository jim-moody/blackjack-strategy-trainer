export type Card = {
  suit: '♠' | '♣' | '♥' | '♦';
  value: string;
  numericValue: number;
};

export type Decision = 'hit' | 'stand' | 'double' | 'split';

export const createDeck = (): Card[] => {
  const suits: Card['suit'][] = ['♠', '♣', '♥', '♦'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      let numericValue: number;
      if (value === 'A') {
        numericValue = 11;
      } else if (['K', 'Q', 'J'].includes(value)) {
        numericValue = 10;
      } else {
        numericValue = parseInt(value);
      }
      deck.push({ suit, value, numericValue });
    }
  }

  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const calculateHandValue = (cards: Card[]): number => {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.value === 'A') {
      aces++;
    }
    value += card.numericValue;
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

export const getPerfectStrategyDecision = (
  playerCards: Card[],
  dealerUpCard: Card
): Decision => {
  const playerValue = calculateHandValue(playerCards);
  const dealerValue = dealerUpCard.numericValue;

  // Handle pairs
  if (playerCards.length === 2 && playerCards[0].value === playerCards[1].value) {
    const pairValue = playerCards[0].numericValue;
    if (pairValue === 11) return 'split'; // Aces
    if (pairValue === 8) return 'split'; // 8s
    if (pairValue === 5) return 'double'; // 5s
    if (pairValue === 4) return dealerValue >= 2 && dealerValue <= 7 ? 'split' : 'hit';
    if (pairValue === 3) return dealerValue >= 2 && dealerValue <= 7 ? 'split' : 'hit';
    if (pairValue === 2) return dealerValue >= 2 && dealerValue <= 7 ? 'split' : 'hit';
  }

  // Handle soft totals (with Ace)
  if (playerCards.some(card => card.value === 'A')) {
    if (playerValue >= 19) return 'stand';
    if (playerValue === 18) {
      if (dealerValue >= 2 && dealerValue <= 6) return 'stand';
      if (dealerValue === 7 || dealerValue === 8) return 'stand';
      return 'hit';
    }
    if (playerValue === 17) {
      if (dealerValue >= 3 && dealerValue <= 6) return 'double';
      return 'hit';
    }
    if (playerValue === 16) {
      if (dealerValue >= 4 && dealerValue <= 6) return 'double';
      return 'hit';
    }
    if (playerValue === 15) {
      if (dealerValue >= 4 && dealerValue <= 6) return 'double';
      return 'hit';
    }
    if (playerValue === 14 || playerValue === 13) {
      if (dealerValue >= 5 && dealerValue <= 6) return 'double';
      return 'hit';
    }
  }

  // Handle hard totals
  if (playerValue >= 17) return 'stand';
  if (playerValue <= 8) return 'hit';
  if (playerValue === 16) {
    if (dealerValue >= 2 && dealerValue <= 6) return 'stand';
    return 'hit';
  }
  if (playerValue === 15) {
    if (dealerValue >= 2 && dealerValue <= 6) return 'stand';
    return 'hit';
  }
  if (playerValue === 14 || playerValue === 13) {
    if (dealerValue >= 2 && dealerValue <= 6) return 'stand';
    return 'hit';
  }
  if (playerValue === 12) {
    if (dealerValue >= 4 && dealerValue <= 6) return 'stand';
    return 'hit';
  }
  if (playerValue === 11) return 'double';
  if (playerValue === 10) {
    if (dealerValue >= 2 && dealerValue <= 9) return 'double';
    return 'hit';
  }
  if (playerValue === 9) {
    if (dealerValue >= 3 && dealerValue <= 6) return 'double';
    return 'hit';
  }

  return 'hit';
}; 