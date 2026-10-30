package org.bbyriny.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record DragonRequest(
        @NotBlank(message = "Имя дракона не должно быть пустым")
        @Size(max = 100, message = "Имя дракона не должно быть длиннее 100 символов") String name,
        @NotNull(message = "coordinatesId обязателен") Long coordinatesId,
        @NotNull(message = "caveId обязателен") Long caveId,
        Long killerId,
        @Positive(message = "Возраст должен быть больше 0") Long age,
        @NotNull(message = "Описание не может быть null")
        @Size(max = 255, message = "Описание не должно быть длиннее 255 символов") String description,
        String color,
        String character,
        Long headId
) {}
