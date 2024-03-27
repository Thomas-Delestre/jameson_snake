
class Game {
    constructor(cameraWidth = 720, cameraHeight = 500, fps_target = 60) {
		this.cameraY = 0
		this.cameraX = 0
        this.lastFrameTime = 0
        this.minDeltatime = 1000
        this.targetFPS = fps_target
        this.targetDeltaTime = Math.floor(1000 / this.targetFPS)
        this.window = document.createElement("div")
        this.cameraWidth = cameraWidth
        this.cameraHeight = cameraHeight
        document.body.appendChild(this.window)
        this.window.setAttribute("class", "game_window")
        this.window.style.maxWidth = cameraWidth + "px"
        this.window.style.maxHeight = cameraHeight + "px"
        this.window.style.width = cameraWidth + "px"
        this.window.style.height = cameraHeight + "px"
        this.window.style.position = "absolute";
        this.window.style.overflow = "hidden";
        this.GameObjects = []
		this.menus = []
        this.Rooms =  []
        this.tilemaps = []
		this.objAreInKilling = 0
		this.inputs_buffer = {}
		this.lastFrameTime = 0;
		this.frameCount = 0;
		this.fps = 0;
		this.lastSecond = 0;
		this.lastSecond = 0;
	//	this.object_kill_count = 0
		this.currentMenu = undefined
		this.currentmap = 0
        this.CurrentRoom = 0
		this.framerateBuffer = []
        this.inputs = {};
        this.mouse = {x: 0, y: 0}
        document.addEventListener('keydown', (e) => {
			this.inputs_buffer[e.key] = !this.inputs[e.key];
    		this.inputs[e.key] = true;
        }, false);
        document.addEventListener('keyup', (e) => {
			this.inputs[e.key] = false;
			this.inputs_buffer[e.key] = false;
            
        }, false);
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        })
        document.addEventListener('mouseevent', (e) => {
        })
    }
	checkAllKillsReady() {
		
		for(let i = 0; i < this.GameObjects.length; i ++) {
			if (this.GameObjects[i].kill == true) {
				return false
			}
		}
		return true
	}
	startGameLoop() {
        this.lastFrameTime = 1
        window.requestAnimationFrame((timestamp) => this.gameLoop(timestamp))
    }
    addObject(go, room=undefined) {
        if (room == undefined) {
            
			var id = this.GameObjects.push(go) - 1
            if(this.GameObjects[id].onCreate !== undefined) {
				this.GameObjects[id].onCreate()
			}
			
			if(this.GameObjects[id].sprite.container !== undefined) {
			
				this.window.appendChild(this.GameObjects[id].sprite.container)
			}
        }else{
            var id = this.Rooms[room].gameObjects.push(go) - 1
            this.Rooms[room].gameObjects[id].onCreate()
            this.window.appendChild(this.Rooms[room].gameObjects[id].container)
        }
    }
    nextMap() {
        if(this.currentmap !== undefined) {
			this.window.removeChild(this.tilemaps[this.currentmap].container)
            this.currentmap += 1;
            this.window.appendChild(this.tilemaps[this.currentmap].container)
        }
    }
	
	changeMap(id) {
		if(this.currentmap !== undefined) {
            this.window.removeChild(this.tilemaps[this.currentmap].container)
            this.currentmap = id;
            this.window.appendChild(this.tilemaps[id].container)
        }
	}
	addTileMap(tm, room=undefined){
        if (room == undefined) {
            var id = this.tilemaps.push(tm) - 1
         
            if(id == 0) {
                this.currentmap = 0
                this.window.appendChild(this.tilemaps[id].container)
            }
            
            
        }else{
            var id = this.Rooms[room].gameObjects.push(go) - 1
            this.Rooms[room].gameObjects[id].onCreate()
            this.window.appendChild(this.Rooms[room].gameObjects[id].container)
        }
    }
	addMenu(menu) {
		this.menus.push(menu)
	}
	
	showMenu(menu) {
		//let n = menu.container.cloneNode(true)
		this.currentMenu = document.body.appendChild(menu.container)
		this.pause = menu.pauseRequired
        //if (this.currentMenu == true) {
            this.window.style.opacity = 0.8
        //}
	}
	exitMenu() {
		this.currentMenu.remove()
		this.currentMenu = false
		this.pause = false
        this.window.style.opacity = 1
	}
	gameLoop(timestamp) {
      
        window.requestAnimationFrame((timestamp) => this.gameLoop(timestamp))
        
        let deltaTime = timestamp - this.lastFrameTime;
 
        if (deltaTime < this.targetDeltaTime) {
            // Trop tôt pour la prochaine mise à jour selon le cap des FPS.
			this.buffer_key = this.inputs;
            return;
        }
		
		if (timestamp - this.lastSecond >= 1000) {
        // Mise à jour du FPS (nombre de frames dans la dernière seconde)
        this.fps = this.frameCount;
        // Réinitialisation du compteur de frames
        this.frameCount = 0;
        // Mise à jour du dernier moment où les FPS ont été calculés
        this.lastSecond = timestamp;
		}
		this.frameCount++;
		
	this.menus.forEach((menu) => {
        // Vérifier si la touche a été pressée une seule fois
        if (this.inputs_buffer[menu.key]) {
            if (!this.currentMenu) {
                this.showMenu(menu);
            } else {
                this.currentMenu.escape()
            }
			this.inputs_buffer[menu.key] = false
        }
    });
		 
		
		
		if (!this.pause) {
		
		
		for(let i = 0; i < this.GameObjects.length; i ++) { // running through the list of objects they are not in a specific room
            // Draw

			if (this.GameObjects[i].fitToCameraOptimisation == true) {
				if(this.checkInScreen(this.GameObjects[i])) {
					this.GameObjects[i].draw()
            		// Step Events
            		this.GameObjects[i].onStep()
				}
			}else{
				this.GameObjects[i].draw()
            		// Step Events
            	this.GameObjects[i].onStep()
			}
			
           
        }
        if(this.Rooms.length) { // if the list of room is empty skip the running through of room's objects
            for(let i = 0; i < this.Rooms[this.CurrentRoom].gameObjects; i ++) {
                // Draw Events
                this.Rooms[this.CurrentRoom].gameObjects[i].sprite.draw()
                // Step Events
                this.Rooms[this.CurrentRoom].gameObjects[i].onStep()
                
                if(this.Rooms[this.CurrentRoom].gameObjects[i].kill == true) {
                    this.Rooms[this.CurrentRoom].gameObjects[i].onKill()
                }
            }
        }
		
		}
	for (let i = this.GameObjects.length - 1; i >= 0; i--) {
    	if (this.GameObjects[i].kill == true) {
			this.GameObjects[i].onKill();
			
			if (this.GameObjects[i] instanceof TextObject) {
				//console.log(this.GameObjects[i])
				this.GameObjects[i].container.remove();
			}else{
				this.GameObjects[i].sprite.container.remove();
			}
			
        	
			this.objAreInKilling -= 1
			this.GameObjects[i].kill == false;
        	deleteFromArray(this.GameObjects, i)// Utiliser splice directement pour supprimer l'élément
    	}
}
		
        this.lastFrameTime = timestamp - (deltaTime % this.targetDeltaTime)
        
    }
    keyboardCheck(key) {
        return this.inputs[key]
    }
	killObject(obj) {
		obj.kill = true
		this.objAreInKilling += 1
	}
	checkInScreen(gO) {		


		return (gO.x + gO.sprite.getSize().width * gO.sprite.scale + 10 > this.cameraX && gO.x - gO.sprite.getSize().width / 2 < this.cameraX + this.cameraWidth )
	}
	
}
class Room {
    constructor(id) {
        this.id = id
        this.gameObjects = []
    }
    addObject(go) {
        var id = this.gameObjects.push(go)
        this.gameObjects[id].onCreate()
    }
 }
class GameObject {
    constructor(name = "") {
		this.fitToCameraOptimisation = false
		this.x = 0
		this.y = 0
		this.sprite = new Sprite(name)
       this.collision = new CollideBox(0, 0, 0, 0)
       this.sprite.image.onload = () => {
        this.sprite.loaded = true;
        this.updateCollisions()        
    }
    this.kill = false
    }
	
	clone() {
		let clone = new GameObject(this.name)
		clone.fitToCameraOptimisation = this.fitToCameraOptimisation
		clone.x = this.x
		clone.y = this.y
		clone.collision = this.collision.clone()
		clone.draw = this.draw
		clone.onStep = this.onStep
		clone.onCreate = this.onCreate
		clone.updateCollisions = this.updateCollisions
		clone.onKill = this.onKill
		clone.sprite = this.sprite.clone()
		
		return clone 
	}
	
    draw() {
        
        this.sprite.draw(this.x, this.y)
    }
    onStep() {
    }
    onCreate() {
    }
    onKill() {
    }
	updateCollisions() {
		if (this.collision.fit_to_sprite){
            this.collision.x = 0
            this.collision.y = 0
            this.collision.width = this.sprite.getSize().width
            this.collision.height = this.sprite.getSize().height
        }
	}
	
    collideWith(box,x,y) {
            if (box instanceof GameObject) {
                                
                return (
                    (x + this.collision.x * this.sprite.scale  < box.x + (box.collision.x + box.collision.width) * box.sprite.scale) &&
                    (x + (this.collision.x  + this.collision.width) * this.sprite.scale > box.x + box.collision.x * box.sprite.scale) &&
                    (y + this.collision.y * this.sprite.scale  < box.y + (box.collision.y + box.collision.height) * box.sprite.scale) &&
                    (y + (this.collision.y + this.collision.height) * this.sprite.scale > box.y + box.collision.y * box.sprite.scale)
                )
            }
            
            return (
                    (x + (this.collision.x - (this.collision.width / 2)) * this.sprite.scale  < box.x + box.width) &&
                    (x + (this.collision.x  + this.collision.width) * this.sprite.scale > box.x) &&
                    (y + this.collision.y * this.sprite.scale  < box.y + box.height) &&
                    (y + (this.collision.y + this.collision.height) * this.sprite.scale > box.y)
            )
    }
   // addSprite(sprite) {
    //}
}
class Sprite {
    constructor(name, z) {
      //  this.parent = parent
        this.scale = 1
        this.row = 1
        this.col = 1
        this.speed = 0
        this.x = 0
        this.y = 0
        this.container = document.createElement("div")
        this.container.setAttribute("class", "game_object")
        this.container.style.position = 'absolute';
        this.container.style.imageRendering = "pixelated"
        this.container.setAttribute("id", name)
        this.image = new Image()
        this.container.style.backgroundImage = "" + this.image + ""
        this.loaded = false
    //    this.image.onload = () => {
      //      this.loaded = true;
        
        //}
        this.image_step = 0
        this.delay = 0
        this.z = z
    }
	
	clone() {
		let clone = new Sprite(this.name)
		clone.scale = this.scale 
		clone.row = this.row
		clone.col = this.col
		clone.speed = this.speed
		clone.image_step = this.image_step
		
		clone.x = this.x
		clone.y = this.y 
		clone.container = document.createElement("div")
        clone.container.setAttribute("class", "game_object")
        clone.container.style.position = 'absolute';
        clone.container.style.imageRendering = "pixelated"
       	clone.container.setAttribute("id", this.name)
        clone.image = this.image.cloneNode(true)
		

     //   clone.container.style.backgroundImage = "" + clone.image + ""
        clone.loaded = false
       // clone.image.onload =
	
        //    clone.loaded = true;
  //           console.log("image loaded")
        //}
     
        clone.delay = 0
  
		clone.z = this.z
		return clone
	}
	
    draw(x, y) { // to be executed in the gamedraw loop, (with a constant tickrate)
        let delay_target = Math.floor(60 / this.speed)
	//	console.log(this.image_step, this.speed)
        let size = this.getSize()
        // console.log(this.y, this.x)
        this.container.style.transform = `translate( ${x}px, ${y}px )`;
       //  this.container.style.left = this.x + "px"
       //  this.container.style.top = this.y + "px"
        this.container.style.zIndex = this.z
        let w_scaled = this.image.width * this.scale
        let h_scaled = this.image.height * this.scale
        size.width = size.width * this.scale
        size.height = size.height * this.scale
        this.container.style.backgroundSize = w_scaled + "px " + h_scaled +"px"
        this.container.style.width = size.width + "px"
        this.container.style.height = size.height +"px"
        this.container.style.backgroundImage = `url(${this.image.src})`;
        this.container.style.backgroundPosition = "-" + String(this.image_step % this.col * size.width) + 'px ' + "-" +String(Math.floor(this.image_step / this.col) * size.height) + 'px';
        this.delay += 1
        if (delay_target == this.delay) {
            this.delay = 0
            this.image_step = (this.image_step + 1) % (this.col * this.row)
        //    console.log(this.container.style.backgroundPosition)
        }
    }
    setAnimation(col = 1, row = 1, speed = 0) {
        this.col = col;
        this.row = row;
        this.speed = speed;
    }
    setImage(path) {
        this.loaded = false
        this.image.src = path
    }
    getSize() {
       return {width: this.image.width / this.col, height: this.image.height / this.row}
    }
}
class CollideBox {
    constructor(x=0, y=0, w=0, h=0, fts=true) {
        this.x = x
        this.y = y
        this.width = w
        this.height = h
        this.fit_to_sprite = fts
    }
	clone() {
		let clone = new CollideBox(this.x, this.y, this.width, this.height, this.fit_to_sprite)
		return clone
	}
}
class TileMap {
    constructor(map, z = 0, scale = 1){
        this.scale = scale;
        this.json_map = map
        this.onMapLoad = () => {}
        this.map_by_layer = [[[]]]
        this.map_loaded = false
       // this.src = src
        //this.col = col
        //this.row = row
        this.images_loaded = 0
        this.images = []
      //  console.log(map, "test")
        for(let i = 0; i < this.json_map.tilesets.length; i ++) {
            // console.log(i)
            var temp_img = {img: new Image(), min: this.json_map.tilesets[i].firstgid, max: -1}
            // console.log(temp_img)
            if(i > 0) {
                this.images[i - 1].max = temp_img.min - 1;
            }
            
            temp_img.img.src = this.json_map.tilesets[i].img_url
            // console.log(this.json_map.tilesets[i].img_url)
            // console.log(temp_img)
            temp_img.img.onload = () => {
                // console.log(this.images_loaded)
                this.images_loaded += 1;
                // console.log(this.images_loaded, this.json_map.tilesets.length)
                if (this.images_loaded == this.json_map.tilesets.length) {
                    this.updateMap()
                }
             //   console.log(this.images_loaded)
            }
            // console.log(temp_img)
            this.images.push(temp_img)
        }
        this.container = document.createElement("div")
        //this.container.id = name
        
        this.container.style.position = "absolute";
        this.container.style.zIndex = z
       
        this.divmap = []
    }
 
    updateMap() {
        // console.log(1, "update")
        // console.log(this.json_map)
        var map_by_layer = importMapFromJson(this.json_map)
        for(let i = 0; i < this.divmap.length; i ++) {
            this.container.removeChild(this.divmap[i])
        }
        this.container.style.imageRendering = "pixelated"
       // console.log(this.map[0].length)
        this.divmap = []
        
        for(let m = 0; m < map_by_layer.length; m ++) {
        
            this.addLayer(map_by_layer[m])
        }
        this.map_by_layer = map_by_layer
        this.map_loaded = true
        this.onMapLoad()
    }
    addLayer(tm) {
        // console.log(tm, "map")
        var tilesize = {width: this.json_map.tilewidth * this.scale, height: this.json_map.tileheight * this.scale}
        // console.log(tilesize)
      //  console.log(json_map)
        for(let i = 0; i < tm.length; i ++) {
            // console.log(i)
            for(let j = 0; j < tm[0].length; j++){
             //   console.log(this.map)
                if(tm[i][j] != 0) {
                    // console.log(j)
                    let temp = document.createElement("div")
                    temp.style.position = "absolute";
                    //    console.log(String(j * (this.img.width / this.col)))
                    temp.style.left = String(j * tilesize.width)+ "px"
                    temp.style.top = String(i * tilesize.height) + "px"
                 //   console.log(`url(${this.img.src})`)   
                    var tile_value = tm[i][j] 
                    
                    
                    let ts = this.images[0]
                    for(let id_ts = 0; tile_value > ts.max && ts.max != -1; id_ts ++){
                        ts = this.images[id_ts]
                        // console.log(this.json_map.tilesets[id_ts])
                    }
                    // console.log(ts)
                    // console.log(tilesize.width)
                    let row = (ts.img.height / this.json_map.tileheight)
                    let col = (ts.img.width / this.json_map.tilewidth )
                    
                    // console.log(
                        // col, row, tm[i][j], (tm[i][j] - ts.min) / row, tm[i][j] + 1 - ts.min, ts.min, Math.ceil((tm[i][j]  + 1) - ts.min)
                    // )
                    
                    temp.style.backgroundImage = `url(${ts.img.src})`;
                    temp.style.backgroundSize = ts.img.width * this.scale + "px " + ts.img.height * this.scale +"px"
                    if  (tile_value == 93) {
                        // console.log((tm[i][j] - ts.min) / row, "row perfect", ts.min, row, tm[i][j], col )
                    } 
                    let backgroundPosX = "-" + String(((tm[i][j] - ts.min) % col) * tilesize.width) + 'px '
                    let backgroundPosY = "-" + String(Math.floor((tm[i][j] - ts.min) / col) * tilesize.height) + 'px';
                    // console.log(tm[i][j], ts.min, this.col, this.row)
                    // console.log(((tm[i][j] - ts.min) % this.col) * tilesize.width, (Math.floor((tm[i][j] - ts.min) / this.row) * tilesize.height))
                    //console.log("map x:", (this.map[i][j] % this.col), "map y:",Math.floor(this.map[i][j] / this.row ), this.map[i][j])
    
                    temp.style.backgroundPosition = backgroundPosX + backgroundPosY;
                    temp.style.width = String(tilesize.width) +"px"
                    temp.style.height = String(tilesize.height) + "px"
                    this.divmap.push(temp)
                    this.container.appendChild(temp)
                }
                
            }
            
        }
        
        this.container.style.width = tm[0].length * this.scale * this.json_map.tilewidth + "px"
        this.container.style.height = tm.length * this.scale * this.json_map.tileheight + "px"
       
    }
}
class TextObject extends GameObject{
    constructor(content = "") {
        super()
        this.content = content
        this.container = document.createElement("p")
        document.body.appendChild(this.container)
    }
    draw() {
        this.container.textContent = this.content
        this.container.style.transform = `translate( ${this.x}px, ${this.y}px )`;
        this.container.style.zIndex = this.z
        this.container.style.position = "absolute"
       // this.container.style.fontFamily = 
    }
}
// class TileSet {
//     constructor(name) {
//     }
// }
//debut menu
class Menu {
	constructor(w, h, title, pause_require = true, key = undefined, z = 15) {
		this.pauseRequired = pause_require
		this.key = key
		this.z = z
		this.w = w
		this.h = h;
		this.title_obj = document.createElement("h1")
		this.title_obj.textContent = title
		this.title_obj.style.opacity = 1;
		this.title_obj.style.opacity = z + 1;
		this.container = document.createElement("div")
		this.container.className = "menu";
		this.container.style.zIndex = z
		this.container.appendChild(this.title_obj)
		this.buttons = []
        this.texts = []
	}
	
	addButton(title, funct) {
		let b_id = this.buttons.push(document.createElement("button"));
		//console.log(b_id)
		//console.log(this.buttons[b_id - 1])
		
		this.buttons[b_id - 1].textContent = title;
		//this.buttons[b_id - 1].style.alignSelf = "center";
		//this.buttons[b_id - 1].style.position = "relative"
		//this.buttons[b_id - 1].style.left	= String(this.w / 4) + "px";
	    //this.buttons[b_id - 1].style.top = String(this.h / this.buttons.length / 2 * b_id) +"px"  
		//this.buttons[b_id - 1].style.textAlign = "center"
		//this.buttons[b_id - 1].style. = "center";
		this.buttons[b_id - 1].onclick = funct;
		this.buttons[b_id - 1].style.zIndex = this.z + 1
		this.container.appendChild(this.buttons[b_id - 1])
		//this.container.appendChild(document.createElement("br"))
		//this.container.appendChild(document.createElement("br"))
		
	}
    
    addText(content) {
        let t_id = this.texts.push(document.createElement("p"))
        this.texts[t_id - 1].style.zIndex = this.z + 1
        this.texts[t_id - 1].textContent = content
        this.container.appendChild(this.texts[t_id - 1])
    }
	
}
//endregion
async function importJson(path) {
    return fetch(path)
    .then(response => {
      // Vérifiez si la requête a réussi
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parse la réponse en JSON
    })
    .then(data => {
      //console.log(data);
      return data // Ici, vous avez accès à vos données JSON
      // Faites quelque chose avec vos données JSON
    })
    .catch(error => {
        //console.log(path)
      console.error('There has been a problem with your fetch operation:', error);
    });
}
async function importMAPJsonFromFile(path) {
    var json = await importJson(path)
    // console.log(json)
    for(let i = 0; i < json.tilesets.length; i ++) {
       // console.log(resolveUrl(path, json.tilesets[i].source))
      
        
        json.tilesets[i].tsj = await importJson(resolveUrl(path, json.tilesets[i].source))
        //console.log(json)
        //console.log(resolveUrl(path, resolveUrl(json.tilesets[i].source, json.tilesets[i].tsj.image)))
        json.tilesets[i].img_url = resolveUrl(path, resolveUrl(json.tilesets[i].source, json.tilesets[i].tsj.image))
        
    }
    // console.log(json, "map")
    return json
}
function importMapFromJson(json) {
        
        let map_arr = json.layers.filter((layer) => {return layer.type=="tilelayer"});
        
        // console.log(map_arr);
        let map_splited = []
        for(let i = 0; i < map_arr.length; i ++) {
            let current_layer = []
            for(let j = 0; j < map_arr[i].height; j ++) {
                // console.log("row: ", j)
                let current_row = []
                for(let l = 0; l < map_arr[i].width; l ++) {
                    //console.log("col :", )
                    // console.log()
                    current_row.push(map_arr[i].data[j * map_arr[i].width + l])
                    // //(j * map_arr[i].width + l, map_arr[i].data[j * map_arr[i].width + l])
                }
                current_layer.push(current_row)
            }
            map_splited.push(current_layer)
            
        }
        
        return map_splited;
    
}
function resolveUrl(base, relative) {
    var stack = base.split("/"),
        parts = relative.split("/");
    stack.pop(); // Enlever le fichier courant (ou vide) de l'URL de base pour obtenir le dossier
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] == ".")
            continue; // Ignorer le segment actuel
        if (parts[i] == "..")
            stack.pop(); // Remonter d'un niveau dans l'arborescence
        else
            stack.push(parts[i]); // Ajouter le segment au chemin final
    }
    return stack.join("/");
}
function deleteFromArray(array, id) {
    if(id >= 0 && id < array.length) {
        array.splice(id, 1);
    }
}
function checkColl(obj, to_check, x, y) {
    for(let i = 0; i < to_check.length; i ++) {
        if (obj.collideWith(to_check[i], x, y)) {
            return true
        }
    }
    return false 
}
export {Game, GameObject, CollideBox, Sprite, TileMap,checkColl , importJson, importMAPJsonFromFile, deleteFromArray, TextObject, Menu}