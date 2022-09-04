export const wrap = (ctx, string, maxWidth) => {
    const stringWidth = ctx.measureText(string).width;
    if (stringWidth <= maxWidth) {
        return [string];
    }
    const lines = [];
    let currentLine = [];
    let unsolved = string.split(" ");
    while (unsolved.length > 0) {
        if (ctx.measureText([...currentLine, unsolved[0]].join(" ")).width > maxWidth) {
            lines.push(currentLine.join(" "));
            currentLine = [];
        }
        currentLine.push(unsolved[0]);
        unsolved = unsolved.slice(1);
    }
    if (currentLine.length > 0) {
        lines.push(currentLine.join(" "));
    }
    return lines;
};