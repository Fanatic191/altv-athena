export const PlantControllerConfig = {
    collection: 'plants', // Collection name in the database.
    showTextLabels: true, // Show text labels above plants.
    debug: true, // Debug mode (Useful to research if something is broken).
    playerNotifications: true, // Show player notifications.
    fertilizerPercentage: 0.25, // 25% faster growth.
    waterTreshold: 20, // Stop growing if water is 20% or below.
    waterLossPerSecond: 0.075, // 0.075 water loss per second.
    rangeBetweenPots: 3, // Range between pots.
    maxPlants: 10, // Max plants per Server. number | null
    maxPlantsPerPlayer: null, // Max plants per player. number | null
};
