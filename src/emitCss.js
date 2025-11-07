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



    for (const p of placed) {
      const styles = [];
      styles.push("position:absolute");
      styles.push(`left:${fmt(p.left)}px`);
      styles.push(`top:${fmt(p.top)}px`);
      styles.push(`width:${fmt(p.width)}px`);
      styles.push(`height:${fmt(p.height)}px`);
      styles.push(`z-index:${p.z}`);
      if (p.opacity != null && p.opacity < 1)
        styles.push(`opacity:${p.opacity}`);

      let transformParts = [];
      if (p.centerX) {
        styles.push(`left:50%`);
        transformParts.push(`translateX(-50%)`);
      } else {
        styles.push(`left:${fmt(p.left)}px`);
      }
      if (p.centerY) {
        styles.push(`top:50%`);
        transformParts.push(`translateY(-50%)`);
      } else {
        styles.push(`top:${fmt(p.top)}px`);
      }

      // size & stacking
      styles.push(`width:${fmt(p.width)}px`);
      styles.push(`height:${fmt(p.height)}px`);
      styles.push(`z-index:${p.z}`);

      // existing opacity etc...
      if (p.opacity != null && p.opacity < 1)
        styles.push(`opacity:${p.opacity}`);

      // if we collected any center transforms, emit them
      if (transformParts.length)
        styles.push(`transform:${transformParts.join(" ")}`);
    
    
      if (p.type === "TEXT") {
        styles.push("display:inline-block");
        styles.push(
          `font-family:"Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
        );
        if (p.fontFamily)
          styles.push(
            `font-family:"${p.fontFamily}", "Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
          );
        if (p.fontSize) styles.push(`font-size:${fmt(p.fontSize)}px`);
        if (p.lineHeight) styles.push(`line-height:${fmt(p.lineHeight)}px`);
        if (p.letterSpacing != null)
          styles.push(`letter-spacing:${fmt(p.letterSpacing)}px`);
        if (p.fontWeight) styles.push(`font-weight:${p.fontWeight}`);
        if (p.color) styles.push(`color:${p.color}`);
        if (p.textAlignHorizontal)
          styles.push(`text-align:${p.textAlignHorizontal.toLowerCase()}`);
        if (p.textCase) styles.push(`text-transform:${p.textCase}`);
        if (p.textDecoration)
          styles.push(`text-decoration:${p.textDecoration}`);

        // inside the TEXT branch where you set styles:
        if (p.textAlignHorizontal) {
          styles.push(`text-align:${p.textAlignHorizontal.toLowerCase()}`);
        } else if (p.centerTextX) {
          // geometry-based fallback: box is centered, so center the text inside it
          styles.push("text-align:center");
        }

        const mode = p.textAutoResize || "NONE";
        if (mode === "WIDTH_AND_HEIGHT") {
          styles.push(
            "width:auto",
            "height:auto",
            "white-space:pre",
            "word-break:normal",
            "overflow:visible"
          );
        } else if (mode === "HEIGHT") {
          styles.push(
            `width:${fmt(p.width)}px`,
            "height:auto",
            "white-space:pre-wrap",
            "word-break:normal",
            "overflow:hidden"
          );
        } else {
          styles.push(
            `width:${fmt(p.width)}px`,
            `height:${fmt(p.height)}px`,
            "white-space:pre-wrap",
            "word-break:normal",
            "overflow:hidden"
          );
        }
      } else {
        // Non-TEXT layers
        if (p.background) {
          if (p.background.startsWith("linear-gradient("))
            styles.push(`background-image:${p.background}`);
          else styles.push(`background:${p.background}`);
        }
        if (p.borderRadius) styles.push(`border-radius:${p.borderRadius}`);
        if (p.boxShadow) styles.push(`box-shadow:${p.boxShadow}`);
        if (p.hasBackgroundBlur && p.blurRadius > 0) {
          styles.push(`backdrop-filter:blur(${fmt(p.blurRadius)}px)`);
          styles.push(`-webkit-backdrop-filter:blur(${fmt(p.blurRadius)}px)`);
        }
      }
    
    
    }


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
