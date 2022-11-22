import { EchostoneColor } from "./EchostoneColor";
import { Awakening, AwakeningLevel } from "./Awakening";
import { MusicBox } from "./MusicBox";
import { pickWeightedOption, randomNumberInRange } from "../utils/RngUtils";

export class Echostone {
    public static MAX_GRADE = 30;
    public static MIN_SUPPLEMENT_GRADE = 8;
    public static MAX_SUPPLEMENT_GRADE = 24;

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
        if (this.grade === Echostone.MAX_GRADE) {
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

    applySupplement(musicbox: MusicBox): Echostone {
        if (this.grade >= Echostone.MIN_SUPPLEMENT_GRADE && this.grade <= Echostone.MAX_SUPPLEMENT_GRADE) {
            const rate = musicbox.getAdvancementRate(this.grade - 1);
            const minGain = !!rate ? rate.minGain : 0;
            const maxGain = !!rate ? rate.maxGain : 0;
            const newStat = randomNumberInRange(minGain, maxGain);

            return new Echostone(this.grade, newStat, this.color, this.previousGrade, this.awakening);
        }

        return this;
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
        const nextStat = randomNumberInRange(minGain, maxGain);
        return new Echostone(this.grade + 1, nextStat, this.color, this, this.awakening);
    }
};
