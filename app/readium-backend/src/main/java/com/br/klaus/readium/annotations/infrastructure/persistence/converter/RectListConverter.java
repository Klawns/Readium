package com.br.klaus.readium.annotations.infrastructure.persistence.converter;

import com.br.klaus.readium.annotations.domain.model.Rect;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Converter
public class RectListConverter implements AttributeConverter<List<Rect>, String> {

    @Override
    public String convertToDatabaseColumn(List<Rect> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "";
        }
        return attribute.stream()
                .map(r -> r.x() + "," + r.y() + "," + r.width() + "," + r.height())
                .collect(Collectors.joining(";"));
    }

    @Override
    public List<Rect> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return Collections.emptyList();
        }

        List<Rect> list = new ArrayList<>();
        String[] rects = dbData.split(";");

        for (String rectStr : rects) {
            try {
                String[] parts = rectStr.split(",");
                if (parts.length == 4) {
                    double x = Double.parseDouble(parts[0]);
                    double y = Double.parseDouble(parts[1]);
                    double width = Double.parseDouble(parts[2]);
                    double height = Double.parseDouble(parts[3]);
                    list.add(new Rect(x, y, width, height));
                }
            } catch (NumberFormatException ignored) {
                // Ignore malformed rectangles.
            }
        }
        return list;
    }
}
