package com.edutube.service;

import com.edutube.dto.Dtos;
import org.apache.poi.xslf.usermodel.*;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class PptService {

    public byte[] generatePpt(Dtos.ExportRequest request) {
        XMLSlideShow ppt = new XMLSlideShow();

        try {
            // Define Styles
            Color primaryColor = new Color(110, 231, 183); // #6ee7b7
            Color backgroundColor = new Color(20, 20, 30); // Dark Background
            Color textColor = Color.WHITE;

            // 1. Summary Slide (Now the First Slide)
            XSLFSlideMaster defaultMaster = ppt.getSlideMasters().get(0);
            XSLFSlideLayout contentLayout = defaultMaster.getLayout(SlideLayout.TITLE_AND_CONTENT);
            XSLFSlide summarySlide = ppt.createSlide(contentLayout);
            fillBackground(summarySlide, backgroundColor);

            styleTitle(summarySlide, "Summary", primaryColor);
            styleBody(summarySlide, request.getSummary(), textColor);

            // Image removed as per user request

            // 3. Topics Slide
            XSLFSlide topicSlide = ppt.createSlide(contentLayout);
            fillBackground(topicSlide, backgroundColor);
            styleTitle(topicSlide, "Key Topics", primaryColor);

            XSLFTextShape topicBody = topicSlide.getPlaceholder(1);
            topicBody.clearText();
            if (request.getTopics() != null) {
                for (String topic : request.getTopics()) {
                    XSLFTextParagraph p = topicBody.addNewTextParagraph();
                    p.setBullet(true);
                    p.setBulletFontColor(primaryColor);
                    XSLFTextRun r = p.addNewTextRun();
                    r.setText(topic);
                    r.setFontColor(textColor);
                    r.setFontSize(20.0);
                }
            }

            // 4. Notes Slides (Iterative)
            Object notesObj = request.getNotes();
            if (notesObj instanceof java.util.Map) {
                java.util.Map<?, ?> notesMap = (java.util.Map<?, ?>) notesObj;
                for (java.util.Map.Entry<?, ?> entry : notesMap.entrySet()) {
                    // Create a new slide for each section
                    XSLFSlide sectionSlide = ppt.createSlide(contentLayout);
                    fillBackground(sectionSlide, backgroundColor);

                    styleTitle(sectionSlide, entry.getKey().toString(), primaryColor);

                    XSLFTextShape sectionBody = sectionSlide.getPlaceholder(1);
                    sectionBody.clearText();

                    Object value = entry.getValue();
                    if (value instanceof java.util.List) {
                        for (Object item : (java.util.List<?>) value) {
                            XSLFTextParagraph p = sectionBody.addNewTextParagraph();
                            p.setBullet(true);
                            p.setBulletFontColor(primaryColor);
                            XSLFTextRun r = p.addNewTextRun();
                            r.setText(item.toString());
                            r.setFontColor(textColor);
                            r.setFontSize(18.0);
                        }
                    } else {
                        XSLFTextParagraph p = sectionBody.addNewTextParagraph();
                        XSLFTextRun r = p.addNewTextRun();
                        r.setText(value.toString());
                        r.setFontColor(textColor);
                    }
                }
            } else {
                XSLFSlide notesSlide = ppt.createSlide(contentLayout);
                fillBackground(notesSlide, backgroundColor);
                styleTitle(notesSlide, "Detailed Notes", primaryColor);
                styleBody(notesSlide, notesObj.toString(), textColor);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ppt.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Error creating PPT", e);
        }
    }

    private void fillBackground(XSLFSlide slide, Color color) {
        // Simple solid fill
        // POI background manipulation can be tricky, using a rectangle shape as
        // background
        // Or setting the slide background if supported easily.
        // For simplicity/robustness in standard POI:
        // Creating a full-size rectangle at Z-index 0
        // But placeholders are usually on top.
        // Let's try setting default master background if possible, or just skip for now
        // to avoid complexity bugs
        // Actually, XSLFBackground is available
        XSLFBackground bg = slide.getBackground();
        bg.setFillColor(color);
    }

    private void styleTitle(XSLFSlide slide, String text, Color color) {
        XSLFTextShape title = slide.getPlaceholder(0);
        title.setText(text);

        // Style the text run
        XSLFTextParagraph p = title.getTextParagraphs().get(0);
        XSLFTextRun r = p.getTextRuns().get(0);
        r.setFontColor(color);
        r.setBold(true);
    }

    private void styleBody(XSLFSlide slide, String text, Color color) {
        XSLFTextShape body = slide.getPlaceholder(1);
        body.clearText();
        XSLFTextParagraph p = body.addNewTextParagraph();
        XSLFTextRun r = p.addNewTextRun();
        r.setText(text);
        r.setFontColor(color);
        r.setFontSize(18.0);
    }
}
