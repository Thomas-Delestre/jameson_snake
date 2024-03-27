package leaderboard

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

func OpenPlayersProfiles() []Player {
	// Emplacement du fichier JSON contenant les profils des joueurs.
	const filename = "data/playersprofiles.data"

	// Ouvrir le fichier.
	file, err := os.Open(filename)
	if err != nil {
		return nil
	}
	defer file.Close()

	// Lire le contenu du fichier.
	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		return nil
	}

	// Décoder le contenu JSON dans une slice de Player.
	var players []Player
	if err := json.Unmarshal(bytes, &players); err != nil {
		return nil
	}
	// fmt.Println(players, bytes)

	return players
}

func JsonRegisterPlayerProfiles(playersProfiles []Player) {
	var file_content []byte
	file_content, _ = json.Marshal(playersProfiles)
	writeFile("data/playersprofiles.data", string(file_content))
	// fmt.Println(string(file_content))
}

func writeFile(filename string, content string) error {
	// Ouvrir le fichier en mode écriture. Si le fichier n'existe pas, créez-le.
	// Le fichier est ouvert avec les droits en écriture seulement pour l'utilisateur.
	file, err := os.OpenFile(filename, os.O_WRONLY|os.O_CREATE, 0o600)
	if err != nil {
		return fmt.Errorf("erreur à l'ouverture du fichier: %v", err)
	}
	defer file.Close() // S'assurer que le fichier sera fermé à la fin.

	// Écrire le contenu dans le fichier.
	_, err = file.WriteString(content)
	if err != nil {
		return fmt.Errorf("erreur lors de l'écriture dans le fichier: %v", err)
	}

	return nil // Aucune erreur, retourner nil.
}

func AddPlayer(tab *[]Player, p Player) {
	var (
		temp_tab []Player
		inserted bool
	)

	for _, k := range *tab {
		if k.HS.Score < p.HS.Score && !inserted {
			temp_tab = append(temp_tab, p)
			inserted = true

		}
		if len(temp_tab) < 7 {
			temp_tab = append(temp_tab, k)
		}

	}

	if len(temp_tab) < 7 {
		if !inserted {
			temp_tab = append(temp_tab, p)
		}
	}
	*tab = temp_tab
}
