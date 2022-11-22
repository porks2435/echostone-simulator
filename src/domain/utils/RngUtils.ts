type WeightedOption = {
    cumulativeWeight: number,
}

export function pickWeightedOption(options: WeightedOption[], totalWeight: number): WeightedOption {
    const rng = Math.random() * totalWeight;

    return options
        .filter(option => option.cumulativeWeight >= rng)
        // find min
        .reduce((prev, current) => (prev.cumulativeWeight < current.cumulativeWeight) ? prev : current);
}