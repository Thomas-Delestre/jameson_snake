import { GameObject, TextObject } from "./engine.js"

// Ici on defini la logique des objets du jeu
class Coin extends GameObject {
    constructor() {
        super()
		this.fitToCameraOptimisation = true
		this.sprite.image.onload = () => {
        this.sprite.loaded = true;

        this.updateCollisions()  
		}
        this.sprite.setImage("./src/tilesets/overWorld.png")
        this.sprite.setAnimation(9, 10, 0)
        this.sprite.image_step = 60
        this.sprite.z = 5	
    }
}

class Enemy extends GameObject {
    constructor() {
        super()
		this.fitToCameraOptimisation = true

        this.sprite.setImage("./src/sprites/enemy/sheet_snake_walk.png")
        this.sprite.setAnimation(7, 1, 8)
        this.sprite.z = 5;
    }
}

class RedBlock extends GameObject {
    constructor() {
        super()
		this.fitToCameraOptimisation = true
		this.sprite.image.onload = () => {
        this.sprite.loaded = true;
        this.updateCollisions()  
		}
        this.sprite.setImage("./src/tilesets/overWorld.png")
        this.sprite.setAnimation(9, 10, 0)
        this.sprite.image_step = 37
        this.sprite.z = 5
    }
}

class SurpriseBox extends GameObject {
    constructor() {
        super()
		this.fitToCameraOptimisation = true
		this.sprite.image.onload = () => {
        this.sprite.loaded = true;
        this.updateCollisions()  
		}
        this.sprite.setImage("./src/tilesets/overWorld.png")
        this.sprite.setAnimation(9, 10, 0)
        this.sprite.image_step = 13
        this.sprite.z = 5
    }
}

class PowerUp extends GameObject {
    constructor() {
        super()
		this.fitToCameraOptimisation = true
		this.sprite.image.onload = () => {
        this.sprite.loaded = true;
        this.updateCollisions()  
		}
        this.sprite.setImage("./src/tilesets/overWorld.png")
        this.sprite.setAnimation(9, 10, 0)
        this.sprite.image_step = 70
        this.sprite.z = 5	
    }
}

class Princess extends GameObject {
    constructor() {
        super()
		this.fitToCameraOptimisation = true
        this.sprite.setImage("./src/sprites/princess/princess.png")
        this.sprite.setAnimation(4, 1, 3)
        this.sprite.image_step = 70
        this.sprite.z = 5
    }
}

class PopText extends TextObject {
    constructor(x, y, content, distance_up = 50, speed = 2, color="white") {
        super(content)
		this.fitToCameraOptimisation = false
        this.x = x;
		this.y = y;
		this.z = 6
		this.start_y = y;
		this.distance_up = distance_up;
		this.speed = speed;
		this.container.style.color = color
    }
	
	onStep() {
		if(this.start_y - this.distance_up < this.y) {
			this.y -= this.speed;
		}else{
			this.kill = true	;
		}
	}
	
} 

export {Coin, Enemy, RedBlock, SurpriseBox, PowerUp, Princess, PopText}