package org.bbyriny.backend.dto;

import jakarta.validation.constraints.NotNull;

public record KillDragonRequest(
        @NotNull(message = "dragonId обязателен") Long dragonId,
        @NotNull(message = "killerId обязателен") Long killerId
) {}
