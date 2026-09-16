# Simulink System Simulation

The Simulink model strictly simulates the operational screening workflow and isolates it from actual model inference execution to allow for high-throughput operational testing and analysis.

## Simulation Components
- **Arrival Process**: Controlled by `numberOfPatients` and `interArrivalTime`.
- **Network Delay**: Simulated constant processing delay `networkDelay`.
- **Queues**: Patient Queue and Doctor Queue track pending cases and respect maximum capacities.
- **Resources**: AI Resource and Doctor Resource pull from their respective queues. Processing rates are governed by `aiServiceTime` and `doctorServiceTime`.
- **Capacity**: The `aiCapacity` and `doctorCapacity` parameters allow processing multiple patients simultaneously.
- **Routing**: Abstraction blocks deterministically assign States (-1, 0, 1, 2) to patients using hashing of their Patient ID, ensuring routing logic can be validated without fabricating real medical data.
- **Throughput & Bottlenecks**: By altering resource configurations in `simulationConfig.m`, you can artificially create and measure system bottlenecks.

## Testing & Fallback Abstraction
The AI blocks (`simulinkAIEngine.m`, `simulinkReferableDecision.m`, `simulinkConfidenceCheck.m`) are explicitly labeled as abstract operational simulations. They use deterministic pseudo-random rules based on Patient IDs to explore all branches of the Decision Router (Non-Referable, Referable, Recapture). No synthetic values are ever presented as if they originated from the actual DR model weights.
