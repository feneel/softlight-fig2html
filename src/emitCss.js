export function emitCSS(frameSize, frameStyle= {}){

    const lines= []
    const w = num(frameSize.width)
    const h = num(frameSize.height)

    //generic preview
    lines.push(`html body{margin:0; height:100%}`)
    lines.push(`body{min-height:100vh; background:#f6f7f9;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing:grayscale; text-rendering:optimizeLegibility}`)

    lines.push(`.frame-viewport{min-height:100vh;display:grid;place-content:center}`)

    //frame root by Figma
    const rootStyles= [

        "position:relative",
        `width:${fmt(w)}px`,
        `height:${fmt(h)}px`,
        `background:${frameStyle.bg || transparent}`
    ]


    if(frameStyle.radius){
        rootStyles.push(`border-radius:${frameStyle.radius}`)

    }
    if (frameStyle.clip){
        rootStyles.push("overflow:hidden")
    }
    lines.push(`.frame-root{${rootStyles.join(";")}}`)


    return lines.join("\n")

}

//helpers

//num
function num(x){
    return typeof x === "number" ? x: parseFloat(x || 0)
}

//fmt
function fmt(n){
    return Number.isInteger(n) ? String(n) : Number.isFinite(n) ? n.toFixed(2): "0"
}
