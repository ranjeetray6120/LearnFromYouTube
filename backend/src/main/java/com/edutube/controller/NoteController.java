package com.edutube.controller;

import com.edutube.dto.Dtos;
import com.edutube.entity.Note;
import com.edutube.entity.User;
import com.edutube.repository.NoteRepository;
import com.edutube.repository.UserRepository;
import com.edutube.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    NoteRepository noteRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NoteDto>> getUserNotes() {
        User user = AuthenticatedUser();
        List<Note> notes = noteRepository.findByUserId(user.getId());

        List<NoteDto> dtos = notes.stream().map(n -> {
            NoteDto dto = new NoteDto();
            dto.setId(n.getId());
            dto.setVideoUrl(n.getVideoUrl());
            dto.setSummary(n.getSummary());
            dto.setTopics(n.getTopicsList());
            dto.setNotes(n.getNotes());
            dto.setCreatedAt(n.getCreatedAt().toString());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> saveNote(@RequestBody SaveNoteRequest request) {
        User user = AuthenticatedUser();

        Note note = new Note();
        note.setUserId(user.getId());
        note.setVideoUrl(request.getVideoUrl());
        note.setSummary(request.getSummary());
        note.setTopicsList(request.getTopics());
        note.setNotes(request.getNotes());

        noteRepository.save(note);

        return ResponseEntity.ok("Note saved successfully");
    }

    private User AuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal(); // Assuming standard user
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }

    @lombok.Data
    public static class SaveNoteRequest {
        private String videoUrl;
        private String summary;
        private List<String> topics;
        private String notes;
    }

    @lombok.Data
    public static class NoteDto {
        private Long id;
        private String videoUrl;
        private String summary;
        private List<String> topics;
        private String notes;
        private String createdAt;
    }
}
