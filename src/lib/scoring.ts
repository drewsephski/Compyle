import { Fight } from '@prisma/client';

// Define a type for the scoring result
type FightScoreResult = {
  baseScore: number;
  bonuses: number;
  penalties: number;
  totalScore: number;
};

// This is a placeholder for a more complex scoring logic
// In a real application, this would involve detailed fight statistics,
// league-specific rules, and potentially real-time data.
export function calculateFightScore(fight: Fight, fighterId: string): FightScoreResult {
  let baseScore = 0;
  let bonuses = 0;
  let penalties = 0;

  // Example: Basic scoring based on win/loss
  // Assuming fight.result contains the winner's fighterId if there's a winner
  if (fight.result === fighterId) {
    baseScore += 10; // Win bonus
    if (fight.method === 'KO/TKO') {
      bonuses += 5; // Finish bonus
    } else if (fight.method === 'SUBMISSION') {
      bonuses += 4; // Submission bonus
    }
    if (fight.round && fight.round <= 1) {
      bonuses += 3; // Early finish bonus
    }
  } else if (fight.result && fight.result !== fighterId) { // If there's a result and it's not this fighter
    baseScore -= 5; // Loss penalty
  } else {
    // Draw, No Contest, or result is null
    baseScore += 2;
  }

  // More complex logic would go here, e.g.,
  // - Significant strikes landed
  // - Takedowns
  // - Control time
  // - Performance bonuses (Fight of the Night, Performance of the Night)
  // - Penalties for fouls, missed weight, etc.

  const totalScore = baseScore + bonuses - penalties;

  return {
    baseScore,
    bonuses,
    penalties,
    totalScore,
  };
}