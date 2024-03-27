package main

import (
	"fmt"
	"main/leaderboard"
	"net/http"
	"os"
)



const PORT string = "8080"

func main() {
	
	// leaderboard.AddPlayer(&PlayersProfiles, leaderboard.Player{Name: "Player" + string(len(PlayersProfiles) + '0'), HS: leaderboard.Score{Score: 65,Coins: 10, Time: 150, MaxCombo: 5}})
	// leaderboard.JsonRegisterPlayerProfiles(PlayersProfiles)

	//playerleaderboard.OpenPlayersProfiles()

	dir, _ := os.Getwd()
	// fmt.Println("Open on", port)
	fs := http.FileServer(http.Dir(dir)) // setup the directory of files
	http.Handle("/", fs)
	http.HandleFunc("/register/records/", leaderboard.HandleNewScore)
	fmt.Println("Server running on: http://localhost:" + PORT)

	http.ListenAndServe(":"+PORT, nil)
}
