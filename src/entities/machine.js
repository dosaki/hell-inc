class Machine {
    constructor(n, cost, needsDemon, miseryPerTick, requiredLevel, colour, type, width, depth, height, id) {
        this.id = id || null;
        this.n = n;
        this.c = cost;
        this.nd = needsDemon;
        this.do = null; // demon operator
        this._mt = miseryPerTick;
        this.rl = requiredLevel;
        this.t = type;
        this.w = width || 0;
        this.d = depth || 0;
        this.h = height || 0;
        this.co = colour;
        this.s = null; // soul
    }

    // is functional: !this.nd || this.do

    /**
     * Update Souls
     * @returns 
     */
    ups() {
        if ((!this.nd || this.do) && this.s && this.n === "Misery Extractor") {
            const misery = this.s.m;
            this.s.d = true;
            this.s = null;
            return { "extracted": misery };
        }
        if ((!this.nd || this.do) && this._mt && this.s) {
            this.s.su(this._mt * (this.do ? this.do.mb : 1), this.do ? this.do.e : 1);
        }
    }

    clone(id) {
        return new Machine(this.n, this.c, this.nd, this._mt, this.rl, this.co, this.t, this.w, this.d, this.h, id);
    }
}
export default Machine;