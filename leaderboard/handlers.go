package leaderboard

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func HandleNewScore(w http.ResponseWriter, r *http.Request) {
	var PlayersProfiles []Player = OpenPlayersProfiles()
	var data Player
	// fmt.Println("test")
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	AddPlayer(&PlayersProfiles, data)

	JsonRegisterPlayerProfiles(PlayersProfiles)
}
