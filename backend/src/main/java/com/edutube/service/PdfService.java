package com.edutube.service;

import com.edutube.dto.Dtos;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfService {

    public byte[] generatePdf(Dtos.ExportRequest request) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("EduTube Study Notes", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Summary
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            document.add(new Paragraph("Summary", sectionFont));
            document.add(new Paragraph(request.getSummary()));
            document.add(Chunk.NEWLINE);

            // Topics
            document.add(new Paragraph("Key Topics", sectionFont));
            List<String> topics = request.getTopics();
            com.lowagie.text.List list = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
            if (topics != null) {
                for (String topic : topics) {
                    list.add(new ListItem(topic));
                }
            }
            document.add(list);
            document.add(Chunk.NEWLINE);

            // Notes
            // Notes
            document.add(new Paragraph("Detailed Notes", sectionFont));

            Object notesObj = request.getNotes();
            if (notesObj instanceof java.util.Map) {
                java.util.Map<?, ?> notesMap = (java.util.Map<?, ?>) notesObj;
                for (java.util.Map.Entry<?, ?> entry : notesMap.entrySet()) {
                    // Section Header
                    Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
                    Paragraph subHeader = new Paragraph(entry.getKey().toString(), subHeaderFont);
                    subHeader.setSpacingBefore(10);
                    subHeader.setSpacingAfter(5);
                    document.add(subHeader);

                    // Content
                    Object value = entry.getValue();
                    if (value instanceof java.util.List) {
                        com.lowagie.text.List noteList = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
                        for (Object item : (java.util.List<?>) value) {
                            noteList.add(new ListItem(item.toString()));
                        }
                        document.add(noteList);
                    } else {
                        document.add(new Paragraph(value.toString()));
                    }
                }
            } else if (notesObj instanceof String) {
                document.add(new Paragraph((String) notesObj));
            } else {
                document.add(new Paragraph(notesObj != null ? notesObj.toString() : ""));
            }

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error creating PDF", e);
        }

        return out.toByteArray();
    }
}
