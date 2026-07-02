export interface Player {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out: boolean;
  howOut?: string;
}

export interface Bowler {
  name: string;
  balls: number; // to track overs: Math.floor(balls/6) + '.' + (balls%6)
  runs: number;
  wickets: number;
  maidens: number;
  currentOverRuns: number; // to calculate maidens
}

export interface ExtraScore {
  wide: number;
  noBall: number;
  bye: number;
  legBye: number;
}

export interface FallOfWicket {
  wickets: number;
  runs: number;
  over: string;
  batsman: string;
}

export interface Innings {
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  balls: number; // total balls bowled in innings
  extras: ExtraScore;
  batsmen: Player[];
  bowlers: Bowler[];
  fallOfWickets: FallOfWicket[];
  currentBatsman1Index: number; // striker/non-striker
  currentBatsman2Index: number; // non-striker/striker
  facingBatsmanIndex: number; // who is facing (must be either currentBatsman1Index or currentBatsman2Index)
  currentBowlerIndex: number;
  oversHistory: string[]; // history of current over (e.g. ['1', '4', 'Wd', 'W', '6'])
  ballByBallLog: {
    over: string; // "0.1", "1.4" etc.
    bowler: string;
    batsman: string;
    outcomeText: string;
    commentary: string;
    runs: number;
    isWicket: boolean;
  }[];
  isCompleted: boolean;
}

export interface MatchState {
  team1: string;
  team2: string;
  maxOvers: number;
  currentInningsIndex: number; // 0 or 1
  innings: [Innings, Innings | null];
  winner?: string;
  resultMessage?: string;
  isCompleted: boolean;
}

export interface DeliveryOutcome {
  runs: number; // runs scored from the bat (or runs run on bye/legbye)
  type: 'normal' | 'wide' | 'noball' | 'bye' | 'legbye';
  wicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hit-wkt';
  batsmanOutIndex?: number; // index of player who got out (relevant for runout)
}

// Predefined teams and players for simulation
export const SIM_TEAMS: { [key: string]: string[] } = {
  'India': [
    'Rohit Sharma', 'Yashasvi Jaiswal', 'Virat Kohli', 'Suryakumar Yadav', 
    'Rishabh Pant', 'Hardik Pandya', 'Ravindra Jadeja', 'Axar Patel', 
    'Jasprit Bumrah', 'Kuldeep Yadav', 'Arshdeep Singh'
  ],
  'Pakistan': [
    'Babar Azam', 'Mohammad Rizwan', 'Fakhar Zaman', 'Saim Ayub',
    'Iftikhar Ahmed', 'Shadab Khan', 'Imad Wasim', 'Shaheen Afridi',
    'Naseem Shah', 'Haris Rauf', 'Mohammad Amir'
  ],
  'Australia': [
    'Travis Head', 'David Warner', 'Mitchell Marsh', 'Glenn Maxwell',
    'Marcus Stoinis', 'Tim David', 'Matthew Wade', 'Pat Cummins',
    'Mitchell Starc', 'Adam Zampa', 'Josh Hazlewood'
  ],
  'England': [
    'Jos Buttler', 'Phil Salt', 'Will Jacks', 'Jonny Bairstow',
    'Harry Brook', 'Liam Livingstone', 'Moeen Ali', 'Sam Curran',
    'Jofra Archer', 'Adil Rashid', 'Mark Wood'
  ]
};

export const getInitialInnings = (battingTeam: string, bowlingTeam: string, playerNames: string[] = []): Innings => {
  const batsmen: Player[] = (playerNames.length > 0 ? playerNames : ['Batsman 1', 'Batsman 2', 'Batsman 3', 'Batsman 4', 'Batsman 5', 'Batsman 6', 'Batsman 7', 'Batsman 8', 'Batsman 9', 'Batsman 10', 'Batsman 11'])
    .map(name => ({ name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false }));
  
  const bowlers: Bowler[] = []; // populate dynamically or preset.
  // For simplicity, we can default populate last 5 players as bowlers
  const bowlerNames = playerNames.length > 0 
    ? playerNames.slice(-5) 
    : ['Bowler 1', 'Bowler 2', 'Bowler 3', 'Bowler 4', 'Bowler 5'];
  
  bowlerNames.forEach(name => {
    bowlers.push({ name, balls: 0, runs: 0, wickets: 0, maidens: 0, currentOverRuns: 0 });
  });

  return {
    battingTeam,
    bowlingTeam,
    runs: 0,
    wickets: 0,
    balls: 0,
    extras: { wide: 0, noBall: 0, bye: 0, legBye: 0 },
    batsmen,
    bowlers,
    fallOfWickets: [],
    currentBatsman1Index: 0, // Striker
    currentBatsman2Index: 1, // Non-striker
    facingBatsmanIndex: 0,
    currentBowlerIndex: 0, // default first bowler
    oversHistory: [],
    ballByBallLog: [],
    isCompleted: false
  };
};

export const initialMatchState = (team1: string, team2: string, maxOvers: number): MatchState => {
  const t1Players = SIM_TEAMS[team1] || [];
  const t2Players = SIM_TEAMS[team2] || [];
  
  return {
    team1,
    team2,
    maxOvers,
    currentInningsIndex: 0,
    innings: [getInitialInnings(team1, team2, t1Players), null],
    isCompleted: false
  };
};

// Formats balls count to "Overs.Balls" string
export const formatOvers = (balls: number): string => {
  const overs = Math.floor(balls / 6);
  const rem = balls % 6;
  return `${overs}.${rem}`;
};

// Generate simulated delivery outcome based on simple weights
export const generateSimulatedOutcome = (batsman: Player, bowler: Bowler): DeliveryOutcome => {
  const rand = Math.random();
  
  // Wicket: ~4.5% chance
  if (rand < 0.045) {
    const wktTypeRand = Math.random();
    let wicketType: DeliveryOutcome['wicketType'] = 'caught';
    if (wktTypeRand < 0.2) wicketType = 'bowled';
    else if (wktTypeRand < 0.35) wicketType = 'lbw';
    else if (wktTypeRand < 0.45) wicketType = 'stumped';
    else if (wktTypeRand < 0.5) wicketType = 'runout';
    
    return {
      runs: 0,
      type: 'normal',
      wicket: true,
      wicketType
    };
  }
  
  // Extras (wide/no-ball): ~6% chance
  if (rand < 0.105) {
    const isWide = Math.random() > 0.3;
    return {
      runs: 0,
      type: isWide ? 'wide' : 'noball',
      wicket: false
    };
  }

  // Normal runs: remaining ~89%
  // Weights: Dot (35%), 1 run (35%), 2 runs (8%), 3 runs (1%), 4 runs (12%), 6 runs (9%)
  const runRand = Math.random();
  if (runRand < 0.35) {
    return { runs: 0, type: 'normal', wicket: false };
  } else if (runRand < 0.70) {
    return { runs: 1, type: 'normal', wicket: false };
  } else if (runRand < 0.78) {
    return { runs: 2, type: 'normal', wicket: false };
  } else if (runRand < 0.79) {
    return { runs: 3, type: 'normal', wicket: false };
  } else if (runRand < 0.91) {
    return { runs: 4, type: 'normal', wicket: false };
  } else {
    return { runs: 6, type: 'normal', wicket: false };
  }
};

// Generates cricket commentary based on outcome
export const generateCommentary = (
  batsmanName: string, 
  bowlerName: string, 
  outcome: DeliveryOutcome
): string => {
  const { runs, type, wicket, wicketType } = outcome;
  
  if (wicket) {
    switch (wicketType) {
      case 'bowled':
        return `OUT! Clean bowled! ${bowlerName} breaks the stumps. ${batsmanName} has to walk back!`;
      case 'lbw':
        return `OUT! Loud appeal for LBW and the umpire raises the finger! ${batsmanName} is trapped in front by ${bowlerName}.`;
      case 'stumped':
        return `OUT! Sharp work behind the stumps! ${batsmanName} steps down the track, misses, and the keeper whips the bails off.`;
      case 'runout':
        return `OUT! Disaster in the middle! Great throw by the fielder and ${batsmanName} is run out by a mile!`;
      case 'caught':
      default:
        const catches = ['in the deep', 'at slip', 'by the keeper', 'at mid-off', 'at cover'];
        const pos = catches[Math.floor(Math.random() * catches.length)];
        return `OUT! Caught ${pos}! ${batsmanName} tries to loft it but finds the fielder. ${bowlerName} gets the wicket.`;
    }
  }

  if (type === 'wide') {
    return `Wide ball! ${bowlerName} sprays this one well outside off/down leg. Umpire signals wide.`;
  }
  if (type === 'noball') {
    return `No ball! ${bowlerName} oversteps the line. Free hit coming up next!`;
  }

  // Normal runs
  switch (runs) {
    case 0:
      const dots = [
        `Defended solidly back to the bowler.`,
        `Beaten! Beautiful delivery past the outside edge.`,
        `Tucked away to the fielder at short mid-wicket. No run.`,
        `Left alone by the batsman. Easy collect for the keeper.`
      ];
      return dots[Math.floor(Math.random() * dots.length)];
    case 1:
      return `Driven gently into the gap for a single. Good rotation of strike.`;
    case 2:
      return `Played away into the deep cover pocket. Excellent running between the wickets for two.`;
    case 3:
      return `Superb shot, stopped just inside the boundary ropes. They run hard and complete three runs!`;
    case 4:
      const fours = [
        `FOUR! Shot! Cut away behind point, flashes past the fielder to the boundary!`,
        `FOUR! Shot of the day! A gorgeous straight drive right back past the bowler.`,
        `FOUR! Cracking shot through covers! No chance for the outfielders.`
      ];
      return fours[Math.floor(Math.random() * fours.length)];
    case 6:
      const sixes = [
        `SIX! Massive! Lofted clean over the long-on boundary for a huge hit!`,
        `SIX! Out of the ground! Swept away over backward square leg, that is high and handsome!`,
        `SIX! Virat Kohli-esque launch over extra cover! Incredible timing.`
      ];
      return sixes[Math.floor(Math.random() * sixes.length)];
    default:
      return `Scored ${runs} runs.`;
  }
};

// Process a ball outcome and return the updated innings state
export const processDelivery = (
  innings: Innings, 
  outcome: DeliveryOutcome, 
  maxOvers: number,
  target?: number
): Innings => {
  const newInnings = { ...innings };
  const { runs, type, wicket, wicketType, batsmanOutIndex } = outcome;
  
  const striker = newInnings.batsmen[newInnings.facingBatsmanIndex];
  const nonStrikerIndex = newInnings.facingBatsmanIndex === newInnings.currentBatsman1Index
    ? newInnings.currentBatsman2Index
    : newInnings.currentBatsman1Index;
  const nonStriker = newInnings.batsmen[nonStrikerIndex];
  const bowler = newInnings.bowlers[newInnings.currentBowlerIndex];

  let ballValid = true;
  let runAdded = 0;
  let wideAdded = 0;
  let noBallAdded = 0;
  let byeAdded = 0;
  let legByeAdded = 0;
  let batsmanRuns = 0;
  let bowlerRunsConceded = 0;
  let outcomeText = '';

  // Calculate scores based on type
  if (type === 'wide') {
    ballValid = false;
    wideAdded = 1 + runs; // usually wide is 1 run, but can have runs scored on it (byes/runs)
    runAdded = wideAdded;
    bowlerRunsConceded = wideAdded;
    outcomeText = `Wd${runs > 0 ? `+${runs}` : ''}`;
  } else if (type === 'noball') {
    ballValid = false;
    noBallAdded = 1;
    batsmanRuns = runs; // runs off the bat
    runAdded = 1 + runs;
    bowlerRunsConceded = 1 + runs;
    outcomeText = `Nb${runs > 0 ? `+${runs}` : ''}`;
  } else if (type === 'bye') {
    byeAdded = runs;
    runAdded = runs;
    outcomeText = `${runs}B`;
  } else if (type === 'legbye') {
    legByeAdded = runs;
    runAdded = runs;
    outcomeText = `${runs}Lb`;
  } else {
    // Normal delivery
    batsmanRuns = runs;
    runAdded = runs;
    bowlerRunsConceded = runs;
    if (wicket) {
      outcomeText = 'W';
    } else {
      outcomeText = runs.toString();
    }
  }

  // Update Innings Totals
  newInnings.runs += runAdded;
  newInnings.extras.wide += wideAdded;
  newInnings.extras.noBall += noBallAdded;
  newInnings.extras.bye += byeAdded;
  newInnings.extras.legBye += legByeAdded;

  if (ballValid) {
    newInnings.balls += 1;
    bowler.balls += 1;
    striker.balls += 1;
  }

  // Update Batsman
  if (type !== 'wide' && type !== 'bye' && type !== 'legbye') {
    striker.runs += batsmanRuns;
    if (batsmanRuns === 4) striker.fours += 1;
    if (batsmanRuns === 6) striker.sixes += 1;
  }

  // Update Bowler
  bowler.runs += bowlerRunsConceded;
  bowler.currentOverRuns += bowlerRunsConceded;

  // Handle Wicket
  if (wicket) {
    newInnings.wickets += 1;
    if (wicketType !== 'runout') {
      bowler.wickets += 1;
    }
    
    // Determine which batsman got out
    let outIndex = newInnings.facingBatsmanIndex;
    if (wicketType === 'runout' && batsmanOutIndex !== undefined) {
      outIndex = batsmanOutIndex;
    }
    
    newInnings.batsmen[outIndex].out = true;
    newInnings.batsmen[outIndex].howOut = wicketType === 'runout' 
      ? `Run Out` 
      : wicketType === 'caught'
      ? `c & b ${bowler.name}`
      : wicketType === 'lbw'
      ? `lbw b ${bowler.name}`
      : wicketType === 'stumped'
      ? `stumped b ${bowler.name}`
      : `b ${bowler.name}`;

    // Record Fall of Wicket
    newInnings.fallOfWickets.push({
      wickets: newInnings.wickets,
      runs: newInnings.runs,
      over: formatOvers(newInnings.balls),
      batsman: newInnings.batsmen[outIndex].name
    });

    // Bring in new batsman if available
    const totalBatsmen = newInnings.batsmen.length;
    const nextBatsmanIndex = Math.max(newInnings.currentBatsman1Index, newInnings.currentBatsman2Index) + 1;
    
    if (nextBatsmanIndex < totalBatsmen) {
      if (outIndex === newInnings.currentBatsman1Index) {
        newInnings.currentBatsman1Index = nextBatsmanIndex;
        if (newInnings.facingBatsmanIndex === outIndex) {
          newInnings.facingBatsmanIndex = nextBatsmanIndex;
        }
      } else {
        newInnings.currentBatsman2Index = nextBatsmanIndex;
        if (newInnings.facingBatsmanIndex === outIndex) {
          newInnings.facingBatsmanIndex = nextBatsmanIndex;
        }
      }
    } else {
      // All out!
      newInnings.isCompleted = true;
    }
  }

  // Add ball history
  newInnings.oversHistory.push(outcomeText);

  // Generate Commentary
  const commText = generateCommentary(striker.name, bowler.name, outcome);
  newInnings.ballByBallLog.unshift({
    over: formatOvers(newInnings.balls),
    bowler: bowler.name,
    batsman: striker.name,
    outcomeText,
    commentary: commText,
    runs: runAdded,
    isWicket: wicket
  });

  // Check Target Chased (2nd Innings)
  if (target !== undefined && newInnings.runs >= target) {
    newInnings.isCompleted = true;
  }

  // Check Overs limit
  if (newInnings.balls >= maxOvers * 6) {
    newInnings.isCompleted = true;
  }

  // Check if Innings Completed (Stop here and don't do strike rotation if over/innings finished)
  if (newInnings.isCompleted) {
    return newInnings;
  }

  // Strike Rotation on odd runs (only for batsman runs or runs off bye/legbye/wide)
  const runsThatRotate = (type === 'wide' || type === 'noball') ? runs : runAdded;
  if (runsThatRotate % 2 !== 0) {
    newInnings.facingBatsmanIndex = nonStrikerIndex;
  }

  // End of Over
  if (ballValid && newInnings.balls % 6 === 0) {
    // Check if bowler bowled maiden (only if 6 balls in the over and 0 runs conceded)
    if (bowler.currentOverRuns === 0) {
      bowler.maidens += 1;
    }
    bowler.currentOverRuns = 0; // reset for next over

    // Clear overs history
    newInnings.oversHistory = [];

    // Strike rotates at the end of the over
    newInnings.facingBatsmanIndex = newInnings.facingBatsmanIndex === newInnings.currentBatsman1Index
      ? newInnings.currentBatsman2Index
      : newInnings.currentBatsman1Index;

    // Change bowler dynamically
    if (newInnings.balls < maxOvers * 6) {
      const numBowlers = newInnings.bowlers.length;
      if (numBowlers > 1) {
        newInnings.currentBowlerIndex = (newInnings.currentBowlerIndex + 1) % numBowlers;
      }
    }
  }

  return newInnings;
};

// Records a custom/interactive delivery outcome to the match
export const recordInteractiveDelivery = (state: MatchState, outcome: DeliveryOutcome): MatchState => {
  const newState = { ...state };
  const activeIndex = newState.currentInningsIndex;
  let innings = newState.innings[activeIndex];
  if (!innings) return state;

  const target = activeIndex === 1 && newState.innings[0]
    ? newState.innings[0].runs + 1
    : undefined;

  innings = processDelivery(innings, outcome, newState.maxOvers, target);
  newState.innings[activeIndex] = innings;

  // Check if innings ended
  if (innings.isCompleted) {
    if (activeIndex === 0) {
      // Transition to 2nd innings
      newState.currentInningsIndex = 1;
      const battingTeam = newState.team2;
      const bowlingTeam = newState.team1;
      const t2Players = SIM_TEAMS[battingTeam] || [];
      newState.innings[1] = getInitialInnings(battingTeam, bowlingTeam, t2Players);
    } else {
      // Game Over! Determine winner
      newState.isCompleted = true;
      const inn1 = newState.innings[0]!;
      const inn2 = newState.innings[1]!;
      
      if (inn2.runs > inn1.runs) {
        newState.winner = inn2.battingTeam;
        const wicketsLeft = 10 - inn2.wickets;
        newState.resultMessage = `${inn2.battingTeam} won by ${wicketsLeft} wickets!`;
      } else if (inn1.runs > inn2.runs) {
        newState.winner = inn1.battingTeam;
        const margin = inn1.runs - inn2.runs;
        newState.resultMessage = `${inn1.battingTeam} won by ${margin} runs!`;
      } else {
        newState.winner = 'Tie';
        newState.resultMessage = `Match Tied! Both teams scored ${inn1.runs} runs.`;
      }
    }
  }

  return newState;
};
