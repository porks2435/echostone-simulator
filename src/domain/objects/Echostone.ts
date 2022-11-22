import { EchostoneColor } from "./EchostoneColor";
import { Awakening, AwakeningLevel } from "./Awakening";
import { MusicBox } from "./MusicBox";
import { pickWeightedOption } from "../utils/RngUtils";

export class Echostone {
    public static MAX_LEVEL = 30;
    constructor(
        public grade: number,
        public stat: number,
        public color: EchostoneColor,
        public previousGrade?: Echostone,
        public awakening?: Awakening,
    ) {}

    getTotalStats(): number {
        return this.stat + (this.previousGrade ? this.previousGrade.getTotalStats() : 0);
    }

    advance(musicbox: MusicBox, boost: number = 0): Echostone {
        if (this.grade === Echostone.MAX_LEVEL) {
            return this;
        }

        const rate = musicbox.getAdvancementRate(this.grade);

        if (!!rate && this._canAdvance(rate.rate + boost)) {
            return this._advance(rate.minGain, rate.maxGain);
        }

        if (rate && rate.downgrade) {
            return this._downgrade();
        }

        return this;
    }

    awaken(musicbox: MusicBox): Echostone {
        const awakeningRates = musicbox.getAwakenings(this.color);
        const awakening = pickWeightedOption(awakeningRates.awakenings, awakeningRates.totalWeight) as Awakening;
        
        const awakeningLevelRates = musicbox.getAwakeningLevels(awakening.maxLevel);
        const { level } = pickWeightedOption(awakeningLevelRates.awakeningLevels, awakeningLevelRates.totalWeight) as AwakeningLevel;

        return new Echostone(this.grade, this.stat, this.color, this.previousGrade, {
            ...awakening,
            level
        });
    }

    private _canAdvance(successRate: number): boolean {
        const rng = Math.random() * 100;

        return rng < successRate;
    }

    private _downgrade() {
        const previousEcho = this.previousGrade || this;

        previousEcho.awakening = this.awakening;
        return previousEcho;
    }

    private _advance(minGain: number, maxGain: number): Echostone {
        const nextStat = Math.floor(Math.random() * (maxGain - minGain + 1) + minGain);
        return new Echostone(this.grade + 1, nextStat, this.color, this, this.awakening);
    }
};
