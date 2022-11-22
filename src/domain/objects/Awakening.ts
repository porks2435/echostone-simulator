export type MaxAwakeningLevels = "20" | "10" | "6" | "5" | "3" | "1";

export interface Awakening {
    name: string;
    level: number;
    weight: number;
    maxLevel: MaxAwakeningLevels;
    cumulativeWeight: number;
};

export interface AwakeningRates {
    awakenings: Awakening[];
    totalWeight: number;
}

export interface AwakeningLevel {
    level: number;
    weight: number;
    cumulativeWeight: number;
}

export interface AwakeningLevelRates {
    awakeningLevels: AwakeningLevel[];
    totalWeight: number;
}
