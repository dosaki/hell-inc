class Machine {
    constructor(name, cost, needsDemon, miseryPerTick, requiredLevel, colour, type, width, depth, height, id) {
        this.id = id || null;
        this.name = name;
        this.cost = cost;
        this.needsDemon = needsDemon;
        this.demonOperator = null;
        this._miseryPerTick = miseryPerTick;
        this.requiredLevel = requiredLevel;
        this.type = type;
        this.width = width || 0;
        this.depth = depth || 0;
        this.height = height || 0;
        this.colour = colour;
        this.soul = null;
    }

    updateSouls () {
        if(this._miseryPerTick && this.soul) {
            return this.soul.suffer(this.miseryPerTick);
        }
        return null;
    }

    get isFunctional() {
        return !this.needsDemon || this.demonOperator;
    }

    get miseryPerTick() {
        return this.isFunctional ? this._miseryPerTick * (this.demonOperator ? this.demonOperator.miseryExtractionBonus : 1) : 0;
    }

    clone(id) {
        return new Machine(this.name, this.cost, this.needsDemon, this.miseryPerTick, this.requiredLevel, this.colour, this.type, this.width, this.depth, this.height, id);
    }
}
export default Machine;