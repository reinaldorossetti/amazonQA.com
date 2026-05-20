package com.tester.api.model.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public record ProductResponse(
    int id,
    String name,
    Double price,
    String description,
    String category,
    String image,
    String manufacturer,
    String line,
    String model,
    Double shippingCost) {}
