package com.edutube.controller;

import com.edutube.dto.Dtos;
import com.edutube.service.PdfService;
import com.edutube.service.PptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private PdfService pdfService;

    @Autowired
    private PptService pptService;

    @PostMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestBody Dtos.ExportRequest request) {
        byte[] pdfBytes = pdfService.generatePdf(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=notes.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping("/ppt")
    public ResponseEntity<byte[]> exportPpt(@RequestBody Dtos.ExportRequest request) {
        byte[] pptBytes = pptService.generatePpt(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=presentation.pptx")
                .contentType(MediaType
                        .parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation"))
                .body(pptBytes);
    }
}
