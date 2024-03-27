package leaderboard

type Score struct {
	Score    int
	Coins    int
	Timer    int
	MaxCombo int
}

type Player struct {
	Name string
	HS   Score
}

func (p *Player) addEntry(NewScore Score) {
	if NewScore.Score > p.HS.Score {
		p.HS = NewScore
	}
}
