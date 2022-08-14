export const coordInRectangle = (coord, rect) => {
    return rect.x <= coord.x && coord.x <= rect.x + rect.width && rect.y <= coord.y && coord.y <= rect.y + rect.height;
};

export const circle = (ctx, x, y, radius, colour, type) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if(colour){
        ctx[`${type}Style`] = colour;
    }
    ctx[type]();
};

export const halfCircle = (ctx, x, y, radius, colour, type, rotation) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, rotation*Math.PI/2, rotation*3*Math.PI/2);
    if(colour){
        ctx[`${type}Style`] = colour;
    }
    ctx[type]();
};