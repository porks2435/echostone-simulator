import { AdvancementRate, Awakening, AwakeningLevel, AwakeningLevelRates, AwakeningRates, Difficulty, EchostoneColor, MaxAwakeningLevels } from "../objects";
import { ADVANCEMENT_RATES } from "../data/AdvancementRates";
import { RED_ECHOSTONE_AWAKENINGS } from "../data/awakenings/RedEchostoneAwakenings";
import { BLUE_ECHOSTONE_AWAKENINGS } from "../data/awakenings/BlueEchostoneAwakenings";
import { YELLOW_ECHOSTONE_AWAKENINGS } from "../data/awakenings/YellowEchostoneAwakenings";
import { SILVER_ECHOSTONE_AWAKENINGS } from "../data/awakenings/SilverEchostoneAwakenings";
import { BLACK_ECHOSTONE_AWAKENINGS } from "../data/awakenings/BlackEchostoneAwakenings";
import { AwakeningData } from "../data/awakenings/AwakeningData";
import { AwakeningLevelData } from "../data/awakeningLevels/AwakeningLevelData";
import { AWAKENING_LEVEL_WEIGHTS_20 } from "../data/awakeningLevels/AwakeningLevelWeights20";
import { AWAKENING_LEVEL_WEIGHTS_10 } from "../data/awakeningLevels/AwakeningLevelWeights10";
import { AWAKENING_LEVEL_WEIGHTS_6 } from "../data/awakeningLevels/AwakeningLevelWeights6";
import { AWAKENING_LEVEL_WEIGHTS_5 } from "../data/awakeningLevels/AwakeningLevelWeights5";
import { AWAKENING_LEVEL_WEIGHTS_3 } from "../data/awakeningLevels/AwakeningLevelWeights3";
import { AWAKENING_LEVEL_WEIGHTS_1 } from "../data/awakeningLevels/AwakeningLevelWeights1";

export class MusicBox {
    private advancementRates: AdvancementRate[];
    private awakenings: {
        [key in EchostoneColor]: AwakeningRates
    };
    private awakeningLevels: {
        [key in MaxAwakeningLevels]: AwakeningLevelRates
    };

    constructor(
        difficulty: Difficulty,
    ) {
        this.advancementRates = ADVANCEMENT_RATES
            .map(row => ({ 
                grade: row.grade, 
                rate: row[difficulty], 
                downgrade: row.downgrade,
                minGain: row.minGain,
                maxGain: row.maxGain,
            }));

        this.awakenings = {
            Red: this._parseAwakenings(RED_ECHOSTONE_AWAKENINGS),
            Yellow: this._parseAwakenings(YELLOW_ECHOSTONE_AWAKENINGS),
            Blue: this._parseAwakenings(BLUE_ECHOSTONE_AWAKENINGS),
            Silver: this._parseAwakenings(SILVER_ECHOSTONE_AWAKENINGS),
            Black: this._parseAwakenings(BLACK_ECHOSTONE_AWAKENINGS),
        };

        this.awakeningLevels = {
            "1": this._parseAwakeningLevels(AWAKENING_LEVEL_WEIGHTS_1),
            "3": this._parseAwakeningLevels(AWAKENING_LEVEL_WEIGHTS_3),
            "5": this._parseAwakeningLevels(AWAKENING_LEVEL_WEIGHTS_5),
            "6": this._parseAwakeningLevels(AWAKENING_LEVEL_WEIGHTS_6),
            "10": this._parseAwakeningLevels(AWAKENING_LEVEL_WEIGHTS_10),
            "20": this._parseAwakeningLevels(AWAKENING_LEVEL_WEIGHTS_20),
        }
    }

    getAdvancementRate(grade: number): AdvancementRate | undefined {
        const rate = this.advancementRates.find(rate => rate.grade === grade);

        return rate;
    }

    getAwakenings(color: EchostoneColor): AwakeningRates {
        return this.awakenings[color];
    }

    getAwakeningLevels(maxLevel: MaxAwakeningLevels): AwakeningLevelRates {
        return this.awakeningLevels[maxLevel];
    }

    _parseAwakenings(data: AwakeningData[]): AwakeningRates {
        const cumulativeSum = (sum => (value: number) => sum += value)(0);
        const awakenings: Awakening[] = data.map(awakening => ({
            name: awakening.name,
            level: 1, // arbitrary default value
            maxLevel: awakening.level.toString() as MaxAwakeningLevels,
            weight: awakening.rate,
            cumulativeWeight: cumulativeSum(awakening.rate),
        }));

        return {
            awakenings,
            totalWeight: awakenings.reduce((totalWeight, awakening) => { return totalWeight + awakening.weight}, 0)
        };
    }

    _parseAwakeningLevels(data: AwakeningLevelData[]): AwakeningLevelRates {
        const cumulativeSum = (sum => (value: number) => sum += value)(0);
        const awakeningLevels: AwakeningLevel[] = data.map(awakeningLevel => ({
            level: awakeningLevel.level,
            weight: awakeningLevel.rate,
            cumulativeWeight: cumulativeSum(awakeningLevel.rate),
        }));

        return {
            awakeningLevels,
            totalWeight: awakeningLevels.reduce((totalWeight, awakeningLevel) => { return totalWeight + awakeningLevel.weight}, 0)
        };
    }
}
