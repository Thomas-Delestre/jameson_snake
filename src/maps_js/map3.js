import {TileMap, importMAPJsonFromFile, CollideBox} from "./../../engine.js"
import {Coin, Enemy, RedBlock, SurpriseBox, PowerUp, Princess} from "./../../object.js"

//const json = require('./map/map1.json'); //(with path)

//var tilemap = new TileMap(map, "src/tilesets/tileset_1.png", "id_map", 0, 8, 8, 2)
var map = await importMAPJsonFromFile("src/map/map_dj_fini.tmj")
//console.log(map, "map script")

var tilemap = new TileMap(map, 2, 2)
tilemap.offsetX = 0
tilemap.offsetY = 0

var loaded = false

const spawn = {x: 100, y: 250}

var walls = []
var objects = []
var flag = []
var piques = []
var doorCastle = []
const divPic = [212, 213, 214, 215, 216, 217, 233, 234, 235, 236, 237, 238]
const divWall = [
    17, 18, 19, 21, 22, 32, 34, 47, 48, 49, 77, 78, 79, 92, 94, 107, 108, 109, 137, 138, 139, 146, 152, 153, 154, 161, 189, 191, 
    307, 271, 272, 273, 274, 275, 276, 278, 279, 287, 288, 310, 314, 316]
const divFlag = [297, 306, 351]
const divDoorCastle = 322
const dictionnaire_obj = {
    331: Coin,
    308: RedBlock,
    284: SurpriseBox,
    315: Enemy,
    341: PowerUp,
    342: Princess
}

let tile_streak = { start: undefined, end: undefined }
tilemap.onMapLoad = () => {
    tilemap.map_by_layer.forEach(element => {
        element.forEach((row, ind_y) => {

            row.forEach((gid, ind_x) => {
                let isWall = false
                let isFlag = false
                let isDoorCastle = false
                for (let i = 0; i < divWall.length; i++) {
                    if (divWall[i] == gid) {
                        isWall = true
                        break;
                    }
                }
                for (let i = 0; i < divFlag.length; i++) {
                    if (divFlag[i] == gid) {
                        flag.push(new CollideBox(
                            ind_x * tilemap.json_map.tilewidth * tilemap.scale,
                            ind_y * tilemap.json_map.tileheight * tilemap.scale,
                            tilemap.json_map.tilewidth * tilemap.scale,
                            tilemap.json_map.tileheight * tilemap.scale
                        ))
                        break;
                    }
                }
                for (let i = 0; i < divPic.length; i++) {
                    if (divPic[i] == gid) {
                        piques.push(new CollideBox(
                            ind_x * tilemap.json_map.tilewidth * tilemap.scale,
                            ind_y * tilemap.json_map.tileheight * tilemap.scale,
                            tilemap.json_map.tilewidth * tilemap.scale,
                            tilemap.json_map.tileheight * tilemap.scale
                        ))
                        break;
                    }
                }
                if (divDoorCastle == gid) {
                    doorCastle.push(new CollideBox(
                        ind_x * tilemap.json_map.tilewidth * tilemap.scale,
                        ind_y * tilemap.json_map.tileheight * tilemap.scale,
                        tilemap.json_map.tilewidth * tilemap.scale,
                        tilemap.json_map.tileheight * tilemap.scale
                    ))
                }

                if (isWall && tile_streak.start === undefined) {
                    tile_streak.start = ind_x
                }

                if ((!isWall && !(tile_streak.start === undefined)) || (!(tile_streak.start === undefined) && ind_x === row.length - 1)) {
                    tile_streak.end = ind_x - 1

                    walls.push(new CollideBox(
                        tile_streak.start * tilemap.json_map.tilewidth * tilemap.scale,
                        ind_y * tilemap.json_map.tileheight * tilemap.scale,
                        (tile_streak.end - tile_streak.start) * tilemap.json_map.tilewidth * tilemap.scale,
                        tilemap.json_map.tileheight * tilemap.scale
                    ))

                    tile_streak = { start: undefined, end: undefined }
                }
            })


        })
    });
    // console.log(walls)

    let layers_objects_to_create = tilemap.json_map.layers.filter((lay) => lay.type == "objectgroup")
    // console.log(layers_objects_to_create)
    layers_objects_to_create.forEach((layer) => {
        layer.objects.forEach((obj) => {
            if (!(dictionnaire_obj[obj.gid] === undefined)) {
                let temp_obj = new dictionnaire_obj[obj.gid]
                temp_obj.x = (obj.x) * tilemap.scale;
                temp_obj.y = (obj.y - 1 * tilemap.json_map.tileheight) * tilemap.scale;
                temp_obj.sprite.scale = tilemap.scale
				temp_obj.gid = obj.gid
                objects.push(temp_obj)
            }
        })
    })

    
    loaded = true 
}
export {walls, objects, flag, piques, doorCastle, tilemap, spawn, loaded, dictionnaire_obj}