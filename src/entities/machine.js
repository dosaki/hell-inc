class Machine {
    constructor(n, cost, needsDemon, miseryPerTick, requiredLevel, colour, type, width, depth, height, id) {
        this.id = id || null;
        this.n = n;
        this.c = cost;
        this.nd = needsDemon;
        this.do = null;
        this._mt = miseryPerTick;
        this.rl = requiredLevel;
        this.t = type;
        this.w = width || 0;
        this.d = depth || 0;
        this.h = height || 0;
        this.co = colour;
        this.s = null; // soul
    }

    /**
     * Update Souls
     * @returns 
     */
    ups () {
        if((!this.nd || this.do) && this._mt && this.s) {
            return this.s.su((!this.nd || this.do) ? this._mt * (this.do ? this.do.mb : 1) : 0);
        }
        return null;
    }

    clone(id) {
        return new Machine(this.n, this.c, this.nd, this._mt, this.rl, this.co, this.t, this.w, this.d, this.h, id);
    }
}
export default Machine;