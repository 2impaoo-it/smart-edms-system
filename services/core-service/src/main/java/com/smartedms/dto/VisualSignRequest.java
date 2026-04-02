package com.smartedms.dto;

import lombok.Data;

@Data
public class VisualSignRequest {
    private String signatureBase64;
    private float x;
    private float y;
    private float width;
    private float height;
    private int pageNumber;
}
