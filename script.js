
import { GameObject, Game, checkColl, deleteFromArray, TextObject, Menu, importJson } from "./engine.js"
import { Coin, Enemy, PowerUp, Princess, RedBlock, SurpriseBox, PopText } from "./object.js"
// imports of maps

import * as tm1 from "./src/maps_js/map1.js"
import * as tm2 from "./src/maps_js/map2.js"
import * as tm3 from "./src/maps_js/map3.js"

//#region Itch.io api
//let itchio = window.open("https://itch.io/user/oauth?client_id=7ed90cbbf425fe3b07d6f0d229db9ff4&scope=profile%3Ame&response_type=token&redirect_uri=https%3A%2F%2Frexgame.itch.io%2Fmariojs")
//#endregion
//console.log(itchio)
var lastStoryAppel = -1

// #region options:
var played_as_selected = false;
var story_mode = true;
var sound_bool = true;
var music_bool = false;
// #endregion

var historyScreens = [
    `Once upon a time, there was a brave little knight named Leo, whose mission was to save Princess Elisa, imprisoned in a dark and terrifying dungeon. 
Before he could reach the princess, Leo had to first cross a plain infested with crawling creatures.`,

    `As soon as he set foot on the plain, Leo was attacked by Jameson's snakes, formidable creatures with venomous scales.
With his shining sword, the little knight managed to fend them off and move forward despite the obstacles.
The path was filled with traps and enemies, but Leo never lost hope.`,

    `Upon reaching the beach, Leo had to climb steep mountains and jump from platform to platform to progress.
Jameson's snakes were still present, ready to attack at any moment.
Despite the difficulty of the task, the little knight did not give up and continued to move forward, determined to save Princess Elisa.`,

    `Finally, Leo arrived in front of the dungeon where the princess was being held captive.
Jameson's snakes stood as threatening guards before him, but the little knight did not hesitate for a second.
With courage and determination, he fought his way through the monsters and finally managed to free Princess Elisa.`,

    `Princess Elisa was grateful to her savior, and the brave little knight Leo was proud to have accomplished his mission bravely.
Together, they left the dark dungeon, ready to face new adventures to come.`,

    `Oh no, you forgot the princess !! Come back and save her!`
]

var highscores = []

const start_timer = 400

var coins = 0
var princessGet = false

var timer = start_timer


const maps = [tm1, tm2, tm3] // differentes maps (initiales)


var currentMapValues = {
    walls: [],
    objects: [],
    piques: [],
    loaded: false,

} // Initialisation du tableau de collision et d'objets actuel 

const soundsDict = {
    death: new Audio("src/sounds/cri_wilhelm.wav"),
    fall: new Audio("src/sounds/glisseChef.wav"),
    hit: new Audio("src/sounds/hit.wav"),
    supriseBox: new Audio("src/sounds/supriseBox2.wav"),
    powerUp: new Audio("src/sounds/powerUp.wav"),
    princess: new Audio("src/sounds/princess.wav"),
    hitRedBlock: new Audio("src/sounds/redBlock.wav"),
    coin: new Audio("src/sounds/coin2.wav"),
    ambiance1: new Audio("src/sounds/sampleRogne.mp3")
}

//#region COIN

Coin.prototype.draw = function () { // Coins 
    this.sprite.speed = 0
    this.sprite.image_step = 60
    const adjustedX = this.x - (player.x - game.cameraWidth / 3);
    const adjustedY = this.y;
    this.sprite.draw(adjustedX, adjustedY);
}; // define Coins methods

Coin.prototype.onStep = function () {
    if (this.collideWith(player, this.x, this.y)) {
        if (this.kill == false) {
            //	console.log(soundsDict.coin.played)
            if(sound_bool) {
                if (soundsDict.coin.played) {
                    const coin2 = new Audio("src/sounds/coin2.wav");
                    coin2.play();
                } else {
                    soundsDict.coin.play();
                }
            }


            coins += 1;
            coinCounter.content = "Coins: " + String(coins)
            if (coins == 50) {
                player.lives += 1;
                livesText.content = "Lives: " + player.lives
            }

            //console.log(game.cameraX, this.x - (player.x - game.cameraWidth / 3))
            let popup = new PopText(this.x - (player.x - game.cameraWidth / 3), this.y, "+1")
            game.addObject(popup)
        }
        game.killObject(this)
    }
}
Coin.prototype.onKill = function () {

}
//#endregion

//#region ENNEMY
Enemy.prototype.draw = function () {
    // Modification du système de rendu, à l'instar du player
    const adjustedX = this.x - (player.x - game.cameraWidth / 3)
    const adjustedY = this.y
    this.sprite.draw(adjustedX, adjustedY);
    this.sprite.container.style.transform = `translate( ${adjustedX}px, ${adjustedY}px ) scale(${this.xspd > 0 ? -1 : 1}, 1)`


} // define enemies methods 
Enemy.prototype.onCreate = function () {
    this.spd = 1
    this.xspd = this.spd;
    this.yspd = 0
    this.sprite.scale = 1
}
Enemy.prototype.onStep = function () {
    //   if(this.checkColl(walls ))
    this.updateCollisions()
    this.yspd += grav
    if (checkColl(this, currentMapValues.walls, this.x + this.xspd, this.y)) {
        this.xspd = this.xspd * -1
    } else {
        this.x += this.xspd
    }
    if (checkColl(this, currentMapValues.walls, this.x, this.y + this.yspd)) {
        this.yspd = 0
    } else {
        this.y += this.yspd
    }

    if (this.collideWith(player, this.x, this.y)) {
        if (player.yspd > 0) {
            if(sound_bool) { soundsDict.hit.play(); }
            player.grounded = true;

            game.killObject(this)
            player.yspd = -1 * (player.yspd - 8);
        } else {

            if(sound_bool) { soundsDict.death.play(); }
            playerKilled()
        }

    }

    if (this.y > maps[game.currentmap].tilemap.json_map.tileheight * maps[game.currentmap].tilemap.map_by_layer[0].length * maps[game.currentmap].tilemap.scale) {
        game.killObject(this)
    }
}

//#endregion

//#region REDBLOCK
RedBlock.prototype.draw = function () {
    // Modification du système de rendu, à l'instar du player
    const adjustedX = this.x - game.cameraX
    const adjustedY = this.y
    this.sprite.draw(adjustedX, adjustedY);

} // define RedBlock Method

RedBlock.prototype.onStep = function () {
    if (this.collideWith(player, this.x, this.y + player.collision.height * player.sprite.scale) && player.yspd < 0) {
        if(sound_bool) { soundsDict.hitRedBlock.play(); }
        if (this.kill == false) {
            player.yspd = 0
            player.xspd = 0
            game.killObject(this)

        }
    }
}
RedBlock.prototype.onKill = function () {
    deleteFromArray(currentMapValues.walls, currentMapValues.walls.indexOf(this))
}
//#endregion

//#region SURPRISEBOX
SurpriseBox.prototype.onCreate = function () {
    this.updateCollisions()
    this.contentCoins = 5
}
SurpriseBox.prototype.draw = function () {

    // Modification du système de rendu, à l'instar du player
    const adjustedX = this.x - game.cameraX
    const adjustedY = this.y
    this.sprite.draw(adjustedX, adjustedY);
} // define Surprisebox methods

SurpriseBox.prototype.onStep = function () {


    if (this.collideWith(player, this.x, this.y + player.collision.height * player.sprite.scale) && player.yspd < 0) {
        if(sound_bool) { soundsDict.supriseBox.play(); }
        if (this.kill == false) {
            player.yspd = 0
            player.xspd = 0
            let popup = new PopText(this.x - (player.x - game.cameraWidth / 3), this.y, `+${this.contentCoins}`)
            coins += this.contentCoins
            if (coins >= 50 && coins && coins - this.contentCoins <= 50) {
                player.lives += 1;
                livesText.content = "Lives: " + player.lives
            }
            coinCounter.content = "Coins: " + coins

            this.contentCoins = 0
            game.addObject(popup)
            player.yspd = 0
            this.sprite.image_step = 62
            this.updateCollisions()

        }
    }
}
//#endregion

//#region POWERUP

PowerUp.prototype.draw = function () {
    if (!player.upgrade) {
        this.sprite.speed = 0
        this.sprite.image_step = 70
        const adjustedX = this.x - (player.x - game.cameraWidth / 3);
        const adjustedY = this.y;
        this.sprite.draw(adjustedX, adjustedY);
    }
}; // define Coins methods

PowerUp.prototype.onStep = function () {
    if (this.collideWith(player, this.x, this.y)) {
        if(sound_bool) { soundsDict.powerUp.play(); }
        player.upgrade = true
        game.killObject(this)
    }
}
//#endregion

//#region PRINCESS 

Princess.prototype.draw = function () {
    if (!princessGet) {
        const adjustedX = this.x - (player.x - game.cameraWidth / 3)
        const adjustedY = this.y
        this.sprite.draw(adjustedX, adjustedY);
    }
}
Princess.prototype.onCreate = function () {
    this.y -= 12
    this.sprite.scale = this.sprite.scale / 2
}
Princess.prototype.onStep = function () {
    if (this.collideWith(player, this.x, this.y)) {
        if(sound_bool) { soundsDict.princess.play(); }
        princessGet = true
        quest.content = "YOU SAVED HER NOW GET OUT !!"
        game.killObject(this)
    }
}
//#endregion


// Debut initialisation jeu 
var game = new Game(1200, 480, 60)
game.window.style.backgroundColor = "rgb(80, 136, 240)"

function mapInit(map) {
    for (let i = 0; i < map.objects.length; i++) {
        let id = currentMapValues.objects.push(map.objects[i].clone()) - 1
        currentMapValues.objects[id].gid = map.objects[i].gid
        currentMapValues.objects[id].updateCollisions()
    }

    for (let i = 0; i < map.walls.length; i++) {
        currentMapValues.walls.push(map.walls[i].clone())
    }
    for (let i = 0; i < map.piques.length; i++) {
        currentMapValues.piques.push(map.piques[i].clone())
    }
    for (let i = 0; i < currentMapValues.objects.length; i++) {
        if (map.dictionnaire_obj[currentMapValues.objects[i].gid] === RedBlock || map.dictionnaire_obj[currentMapValues.objects[i].gid] === SurpriseBox) {
            currentMapValues.walls.push(currentMapValues.objects[i])
        }
    }

    if (story_mode == true && lastStoryAppel != game.currentmap) {

        historyMenu.texts[0].textContent = historyScreens[game.currentmap + 1]
        historyMenu.buttons[0].onclick = () => {game.exitMenu()}
        if (game.currentmap == 0) {
            historyMenu.texts[0].textContent = historyScreens[game.currentmap]
            if (historyMenu.texts[0].textContent != historyScreens[1]) {
                historyMenu.buttons[0].onclick = () => {historyMenu.texts[0].textContent = historyScreens[1]; historyMenu.buttons[0].onclick = () => {game.exitMenu()}}
            } 
        }
        
        game.showMenu(historyMenu)
        lastStoryAppel = game.currentmap
    }

}
function mapGotoReseted(id) {
    game.changeMap(id)
    timer = start_timer
    princessGet = false;
    coins = 0
    player.lives = 3
    player.onFlag = false
    player.upgrade = false
    currentMapValues.objects.forEach((obj) => { game.killObject(obj) })
    currentMapValues.objects = []
    currentMapValues.piques = []


    currentMapValues.loaded = false
    player.x = maps[game.currentmap].spawn.x
    player.y = maps[game.currentmap].spawn.y
}
function gameReset() {
    //currentMapValues.walls.forEach((obj) => obj.kill = true )
    timer = start_timer
    princessGet = false
    player.onFlag = false
    game.changeMap(0)
    coins = 0
    player.lives = 3
    player.upgrade = false
    currentMapValues.objects.forEach((obj) => { game.killObject(obj) })
    currentMapValues.objects = []
    currentMapValues.piques = []
    //currentMapValues.walls = []
    historyMenu.buttons[0].onclick = () => { game.exitMenu() }
    currentMapValues.loaded = false
    player.x = maps[game.currentmap].spawn.x
    player.y = maps[game.currentmap].spawn.y
    lastStoryAppel = -1;
  //  if (soundsDict.ambiance1.played) {
    //    soundsDict.ambiance1.stop()
    //}
}

function playerKilled() {

    //currentMapValues.walls.forEach((obj) => obj.kill = true )
    currentMapValues.objects.forEach((obj) => { game.killObject(obj) })
    currentMapValues.objects = []
    //currentMapValues.walls = []
    currentMapValues.piques = []

    currentMapValues.loaded = false
    player.x = maps[game.currentmap].spawn.x
    player.y = maps[game.currentmap].spawn.y
    player.onFlag = false
    if (player.lives > 0) {
        player.lives -= 1;
    } else {
        game.showMenu(loseMenu)
    }
    livesText.content = "lives: " + String(player.lives)


}
// #region MENUS
var mainMenu = new Menu(game.cameraWidth, game.cameraHeight, "Menu", true, 15, undefined)

soundsDict.ambiance1.loop = true;
mainMenu.escape = () => {if(music_bool) {soundsDict.ambiance1.play(true)} ;gameReset(); game.exitMenu()}
mainMenu.addButton("Start", () => { if(music_bool) {soundsDict.ambiance1.play(true)} ;gameReset(); game.exitMenu(); played_as_selected = false})
mainMenu.addButton("Select Level", () => { game.exitMenu(); game.showMenu(selecMenu); })
mainMenu.addButton("Leaderboard", () => {
    leaderBoardMenu.texts.forEach((t) => {
        leaderBoardMenu.container.removeChild(t)
    })
    leaderBoardMenu.texts = []
    //leaderBoardMenu.table.body.removeChild()
    //console.log(highscores)
    importJson("data/playersprofiles.data").then((highscores) => {
        //console.log(highscores);
        leaderBoardMenu.table.body.remove()
        leaderBoardMenu.table.body = document.createElement("tbody")
        highscores.forEach((entry) => {
            let row = document.createElement("tr")
            leaderBoardMenu.table.headers.forEach((h) => {
                let ndata = document.createElement("td")
                switch (h) {

                    case "Name":
                        ndata.textContent = entry[h]
                        break;

                    default:
                        ndata.textContent = entry["HS"][h]
                        break;
                }


                row.appendChild(ndata)
            })
            leaderBoardMenu.table.body.appendChild(row)

        });
        leaderBoardMenu.table.container.appendChild(leaderBoardMenu.table.body)

    }).catch((err) => {
        console.error("Erreur lors du chargement des highscores :", err);
    });


    game.exitMenu();
    game.showMenu(leaderBoardMenu)

})

mainMenu.addButton("Options", () => {game.showMenu(optionsMenu)})

//Menu options
var optionsMenu = new Menu(game.cameraWidth, game.cameraHeight, "Options")
optionsMenu.escape = () => { game.exitMenu(); game.showMenu(mainMenu);}
optionsMenu.addButton(`Story mode: ${story_mode ? "On" : "Off" }`, () => { story_mode = (!story_mode); optionsMenu.buttons[0].textContent = `Story mode: ${story_mode ? "On" : "Off" }`})
optionsMenu.addButton( `Music: ${music_bool ? "On" : "Off" }`, () => { music_bool = (!music_bool); optionsMenu.buttons[1].textContent = `Music: ${music_bool ? "On" : "Off" }`})
optionsMenu.addButton( `Sounds: ${sound_bool ? "On" : "Off" }`, () => { sound_bool = (!sound_bool); optionsMenu.buttons[2].textContent = `Sounds: ${sound_bool ? "On" : "Off" }`})
optionsMenu.addButton("Back to menu", () => { game.exitMenu(); game.showMenu(mainMenu); })

// Menu pause
var pauseMenu = new Menu(game.cameraWidth, game.cameraHeight, "Pause", true, "Escape");
pauseMenu.escape = () => {game.exitMenu()};
pauseMenu.addButton("resume", () => { game.exitMenu() });
pauseMenu.addButton("restart", () => { played_as_selected ? mapGotoReseted(game.currentmap) : gameReset(); game.exitMenu() })
pauseMenu.addButton("back to menu", () => { game.exitMenu(); gameReset(); game.showMenu(mainMenu); })


// Menu selection level

var selecMenu = new Menu(game.cameraWidth, game.cameraHeight, "Select level", true);
selecMenu.escape = () => { game.exitMenu(); game.showMenu(mainMenu);}
selecMenu.addButton("level 1", () => { mapGotoReseted(0); game.exitMenu(); played_as_selected = true})
selecMenu.addButton("level 2", () => { mapGotoReseted(1); game.exitMenu(); played_as_selected = true})
selecMenu.addButton("level 3", () => { mapGotoReseted(2); game.exitMenu(); played_as_selected = true})
selecMenu.addButton("back to menu", () => { game.exitMenu(); game.showMenu(mainMenu); })



// Menu gameover
var loseMenu = new Menu(game.cameraWidth, game.cameraHeight, "GameOver", true);
loseMenu.escape = () => { gameReset(); game.exitMenu(); game.showMenu(mainMenu); }
loseMenu.addButton("retry", () => { played_as_selected ? mapGotoReseted(game.currentmap) : gameReset(); game.exitMenu() })
loseMenu.addButton("back to menu", () => { gameReset(); game.exitMenu(); game.showMenu(mainMenu); })



// Menu WIN 
var wonMenu = new Menu(game.cameraWidth, game.cameraHeight, "You Win", true);
wonMenu.escape = () => { gameReset(); game.exitMenu(); game.showMenu(mainMenu); }

wonMenu.addText(coins)
wonMenu.addText(timer)

wonMenu.addButton("save", () => {
    game.exitMenu(); game.showMenu(saveScoreMenu);
})

wonMenu.addButton("retry", () => { gameReset(); game.exitMenu() })
wonMenu.addButton("back to menu", () => { gameReset(); game.exitMenu(); game.showMenu(mainMenu); })

// Menu SaveScore 
var saveScoreMenu = new Menu(game.cameraWidth, game.cameraHeight, "What is your name:")

saveScoreMenu.input_name = document.createElement("input")
saveScoreMenu.input_name.type = "text"
saveScoreMenu.input_name.placeholder = "Your name"
saveScoreMenu.container.appendChild(saveScoreMenu.input_name)

saveScoreMenu.addButton("submit score", () => {
    //console.log(parseInt(timer))
    fetch('http://localhost:8080/register/records/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Name: saveScoreMenu.input_name.value,
            HS: {
                Score: parseInt(Math.round(coins * 10 + timer * 2) + (player.lives * 200)),
                Coins: coins,
                Timer: parseInt(start_timer - timer),
                MaxCombo: 0
            }
        }),
    })

    gameReset(); game.exitMenu(); game.showMenu(mainMenu)

})
saveScoreMenu.escape = () => {gameReset(); game.exitMenu(); game.showMenu(mainMenu)}

// Menu histoire
var historyMenu = new Menu(game.cameraWidth, game.cameraHeight, "History")
historyMenu.escape = () => { game.exitMenu() }
historyMenu.container.className = "historyMenu"
historyMenu.addText("")
historyMenu.addButton("Next", () => { game.exitMenu() })


// Menu LeaderBoard
var leaderBoardMenu = new Menu(game.cameraWidth, game.cameraHeight, "Leaderboard")
leaderBoardMenu.table = {
    container: document.createElement("table"),
    head: document.createElement("thead"),
    body: document.createElement("tbody"),
    "headerRow": document.createElement("tr"),
    "headers": ["Name", "Score", "Timer"]
};
leaderBoardMenu.table.headers.forEach(headerText => {
    let th = document.createElement("th");
    th.textContent = headerText;
    leaderBoardMenu.table.headerRow.appendChild(th);
});
leaderBoardMenu.table.container.className = "leaderboardTable"
leaderBoardMenu.table.head.appendChild(leaderBoardMenu.table.headerRow);
leaderBoardMenu.table.container.appendChild(leaderBoardMenu.table.head);
leaderBoardMenu.container.appendChild(leaderBoardMenu.table.container)

leaderBoardMenu.title_obj.remove()                               //// Enleve le TITRE !!!!! 

leaderBoardMenu.addButton("back to menu", () => { game.exitMenu(); game.showMenu(mainMenu); })
leaderBoardMenu.escape = () => { game.exitMenu(); game.showMenu(mainMenu); }

//#endregion


//#region HUD
// Nombre de vie --------------------------
var livesText = new TextObject()
livesText.z = 6
livesText.container.style.color = "white"
livesText.x = game.cameraWidth / 2


// FPS ------------------------------------
var fps = new TextObject("fps: " + String(game.fps)) // Creation d'un nouveau objet texte qui servira à afficher le texte

fps.z = 6
fps.container.style.color = "white"

// TIMER
var timerText = new TextObject("")
timerText.container.style.color = "white"
timerText.x = game.cameraWidth - 200
timerText.z = 6

// COIN VAR -------------------------------
var coins = 0
var coinCounter = new TextObject("Coins: " + String(coins)) // Creation d'un nouveau objet texte qui servira à afficher le texte
coinCounter.x = game.cameraWidth / 6
coinCounter.z = 6
coinCounter.container.style.color = "white"

// QUEST TEXT -----------------------------
var quest = new TextObject("YOU MUST SAVE THE PRINCESS !!") // Creation d'un nouveau objet texte qui servira à afficher le texte
quest.x = game.cameraWidth / 4
quest.z = 6
quest.container.style.color = "white"

//#endregion

//#region PLAYER
var player = new GameObject("test")
player.sprite.setImage("./src/sprites/player/sheet_hero_idle.png") // Set the source of the sprite(you have to set the path of your image)
player.sprite.setAnimation(8, 1, 4) // Set  An animation with 8 columns, 1 rows on the speed of 2 frames per seconds (this line is useless if you have set the image on a gif)

// setting de la boxe de collision

player.collision.fit_to_sprite = false
player.collision.x = 18
player.collision.y = 50
player.collision.width = 16
player.collision.height = 14

// fin de setting de la boxe de collision

// Define the initials property of our player
player.lives = 3;
player.onFlag = false;
player.jump = 11;
player.upgrade = false;
player.doubleJumped = false
player.sprite.z = 10;
player.sprite.scale = 1.5;
player.yspd = 0
player.xspd = 0
player.grounded = false
player.spdmax = 8
player.accel = 3
player.decel = 2
player.sprite.x = game.cameraWidth / 3


// fin de initials property of our player

var inputs_buffer = {}
const grav = 0.8


player.draw = function () {

    if (maps[game.currentmap] !== undefined) {

        if (maps[game.currentmap].loaded == true && currentMapValues.loaded == false) {

            currentMapValues.walls = []
            mapInit(maps[game.currentmap])
            currentMapValues.objects.forEach((obj, id) => {

                //obj.currentObjectsMapId = id
                game.addObject(obj)
            })

            currentMapValues.loaded = true
        }
    }
    game.cameraX = this.x - game.cameraWidth / 3
    this.sprite.draw(- game.cameraX, this.y)
    this.sprite.container.style.transform = `translate( ${game.cameraWidth / 3}px, ${this.y}px ) scale(${this.xspd < 0 ? -1 : 1}, 1)`
    maps[game.currentmap].tilemap.container.style.transform = `translate( ${Math.round(-1 * (game.cameraX))}px, 0px ) `


} // Define the way the player be draw on screen


player.onStep = function () {
    livesText.content = "lives: " + String(player.lives)
    fps.content = "fps: " + String(game.fps)
    timer -= 1 / game.targetFPS
    timerText.content = "timer: " + String(Math.floor(timer))

    let controls = {
        up: (game.keyboardCheck(" ") || game.keyboardCheck("ArrowUp") || game.keyboardCheck("z") || game.keyboardCheck("Z")),
        left: game.keyboardCheck("ArrowLeft") || game.keyboardCheck("q") || game.keyboardCheck("Q"),
        right: game.keyboardCheck("ArrowRight") || game.keyboardCheck("d") || game.keyboardCheck("D"),
        pauseMenu: game.keyboardCheck("Escape")
    }

    if (this.xspd != 0) {
        if (Math.sign(this.xspd) != Math.sign(this.xspd - Math.sign(this.xspd) * this.decel)) {
            this.xspd = 0
        } else {
            this.xspd -= Math.sign(this.xspd) * this.decel
        }
    }

    if ((!this.onFlag) && checkColl(this, maps[game.currentmap].flag, this.x, this.y)) {
        var successLevelSound = new Audio("./src/sounds/success.wav");
        if(sound_bool) { successLevelSound.play(); }
        this.onFlag = true
    }
    if (this.onFlag && !this.grounded) {
        this.yspd = 1
    }
    if (this.onFlag && this.grounded) {
        this.xspd = 1
    }
    if (this.onFlag && this.grounded && checkColl(this, maps[game.currentmap].doorCastle, this.x, this.y)) {
        this.xspd = 0
        //console.log(princessGet, game.currentmap)

        if (game.currentmap == (maps.length - 1)) {
            if (princessGet) {
                wonMenu.texts[0].textContent = "coins: " + coins
                wonMenu.texts[1].textContent = "timer: " + Math.round(start_timer - timer)
                if (story_mode == true) {
                    historyMenu.texts[0].textContent = historyScreens[game.currentmap + 2]
                    historyMenu.buttons[0].onclick = () => { game.exitMenu(); game.showMenu(wonMenu); gameReset(); }
                    game.showMenu(historyMenu)
                } else {
                    
                    game.showMenu(wonMenu)
                }
            } else {
                if(sound_bool) { soundsDict.fall.play(); }
                playerKilled()
                if (story_mode == true) {
                    historyMenu.texts[0].textContent = historyScreens[game.currentmap + 3]
                    historyMenu.buttons[0].onclick = () => { game.exitMenu(); }
                }
                game.showMenu(historyMenu)
            }
        } else {
            currentMapValues.objects.forEach((obj) => { game.killObject(obj) })
            currentMapValues.objects = []
            game.nextMap()

            //currentMapValues.walls = []
            currentMapValues.loaded = false
            player.x = maps[game.currentmap].spawn.x
            player.y = maps[game.currentmap].spawn.y
            player.onFlag = false

            this.x = maps[game.currentmap].spawn.x
            this.y = maps[game.currentmap].spawn.y
            this.onFlag = false

        }




    }

    if (checkColl(this, currentMapValues.piques, this.x, this.y)) {
        if(sound_bool) { soundsDict.death.play(); }
        playerKilled()
    }

    if (!this.onFlag) {
        if (controls.up && inputs_buffer.up != true && (this.grounded == true || (this.doubleJumped == false && this.upgrade == true))) {
            this.yspd = -(this.jump * this.sprite.scale)
            if (this.grounded == false) {
                this.doubleJumped = true
            }
            var jumpSound = new Audio("./src/sounds/jump.wav");
            if(sound_bool) { jumpSound.play(); }
            this.grounded = false
        }



        if (controls.left) {
            if (Math.abs(this.xspd) - this.spdmax < 0) {
                this.xspd -= this.accel
            }
        }

        if (controls.right) {
            if (Math.abs(this.xspd) - this.spdmax < 0) {
                this.xspd += this.accel
            }
        }
    }

    this.yspd += grav
    // this.x += this.xspd
    if (this.yspd != 0) {

        if (!checkColl(this, currentMapValues.walls, this.x, this.y + this.yspd)) {
            this.y += this.yspd
        } else {
            while (!checkColl(this, currentMapValues.walls, this.x, this.y + Math.sign(this.yspd))) {
                this.y += Math.sign(this.yspd)
            }
            if (this.yspd > 0) {
                this.grounded = true
                this.doubleJumped = false
            }
            this.yspd = 0

        }
    }
    if (this.xspd != 0) {
        if (!checkColl(this, currentMapValues.walls, this.x + this.xspd, this.y)) {
            this.x += this.xspd
        } else {
            while (!checkColl(this, currentMapValues.walls, this.x + Math.sign(this.xspd), this.y)) {
                this.x += Math.sign(this.xspd)

            }
        }

        this.sprite.setImage("./src/sprites/player/sheet_hero_walk.png") // Set the source of the sprite(you have to set the path of your image)
        this.sprite.setAnimation(3, 1, 4) // Set  An animation with 8 columns, 1 rows on the speed of 2 frames per seconds (this line is useless if you have set the image on a gif)
    } else {
        this.sprite.setImage("./src/sprites/player/sheet_hero_idle.png") // Set the source of the sprite(you have to set the path of your image)
        this.sprite.setAnimation(8, 1, 4) // Set  An animation with 8 columns, 1 rows on the speed of 2 frames per seconds (this line is useless if you have set the image on a gif)
    }
    if (this.y > maps[game.currentmap].tilemap.json_map.tileheight * maps[game.currentmap].tilemap.map_by_layer[0].length * maps[game.currentmap].tilemap.scale) {
        if(sound_bool) { soundsDict.fall.play(); }
        playerKilled()
    }

    inputs_buffer = controls

} // Define the routine of the player at all frame

player.onCreate = function () {
    this.x = maps[game.currentmap].spawn.x
    this.y = maps[game.currentmap].spawn.y



} // Define the actions to be call at the creation of the player
//

//#region AJOUT DES ASSETS AU JEU
maps.forEach((map) => {
    game.addTileMap(map.tilemap)
})

game.addObject(player)

game.addMenu(saveScoreMenu)
game.addMenu(pauseMenu)
game.addMenu(mainMenu)
game.addMenu(selecMenu)

game.startGameLoop()

game.showMenu(mainMenu)

game.addObject(coinCounter)
game.addObject(fps)
game.addObject(quest)
game.addObject(timerText)
game.addObject(livesText)
//#endregion
