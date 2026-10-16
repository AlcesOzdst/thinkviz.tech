# Minimax & Alpha-Beta Pruning Lecture Notes
Instructor: Prof. Sarah Jenkins
Unit: Adversarial Search and Game Playing in AI

## 1. Minimax Value Function
In a two-player, zero-sum, perfect-information game:
- MAX aims to maximize utility V(s)
- MIN aims to minimize utility V(s)

$$\text{Minimax}(s) = \begin{cases}
\text{Utility}(s) & \text{if Terminal}(s) \\
\max_{a \in \text{Actions}(s)} \text{Minimax}(\text{Result}(s, a)) & \text{if Player}(s) = \text{MAX} \\
\min_{a \in \text{Actions}(s)} \text{Minimax}(\text{Result}(s, a)) & \text{if Player}(s) = \text{MIN}
\end{cases}$$

## 2. Alpha-Beta Pruning Invariants
Alpha ($\alpha$): The best (highest) value that MAX can guarantee along the path to the current state.
Beta ($\beta$): The best (lowest) value that MIN can guarantee along the path to the current state.

Pruning condition:
When evaluating children of node $n$, if $\alpha \ge \beta$, the remaining branches can be pruned because the opponent will never allow this state to be reached.

### Time Complexity Optimization:
- Standard Minimax: $O(b^m)$
- Alpha-Beta (with optimal move ordering): $O(b^{m/2})$
This effectively doubles the search horizon depth attainable within the same time limit.
