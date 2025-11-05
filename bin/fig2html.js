#!/usr/bin/env node
import { getFile, findFrame } from "../src/figma.js"

const [, , fileKey, frameId]= process.argv

if(!fileKey){
    console.error("Error")
    process.exit(1)
}


if(!process.env.FIGMA_TOKEN){
 console.error("Missign Figma token!!")   
 process.exit(1)
}

try{

    const doc = await getFile(fileKey, process.env.FIGMA_TOKEN)

    const frame= findFrame(doc, frameId)

    const bb = frame.absoluteBoundingBox;
    console.log(bb)

    if(!bb) 
        {throw new Error("Target frame lacks absoluteBoundingBox")}


        console.log("Figma file fetched!!")
        console.log("Using frame")
        console.log("Size of frame")
        console.log("Emitting html/css")


}

catch(e){

    console.error("Error", e)
    process.exit(1)

    
}