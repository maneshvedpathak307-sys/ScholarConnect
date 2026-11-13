package com.scholarship.portal.controller;

import com.scholarship.portal.dto.NotificationResponse;
import com.scholarship.portal.entity.Notification;
import com.scholarship.portal.entity.User;
import com.scholarship.portal.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repo;

    @GetMapping
    public List<NotificationResponse> mine(
            @AuthenticationPrincipal User user) {

        return repo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PutMapping("/{id}/read")
    public NotificationResponse read(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        Notification n = repo.findById(id)
                .filter(x -> x.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification not found"
                ));

        n.setRead(true);

        return toResponse(repo.save(n));
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}