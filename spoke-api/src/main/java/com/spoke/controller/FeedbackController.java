package com.spoke.controller;

import com.spoke.model.Feedback;
import com.spoke.model.User;
import com.spoke.repository.UserRepository;
import com.spoke.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserRepository userRepository;

    public FeedbackController(FeedbackService feedbackService, UserRepository userRepository) {
        this.feedbackService = feedbackService;
        this.userRepository = userRepository;
    }

    // POST /api/feedback with body { "userId": 1, "message": "..." }
    //
    // NOTE ON SECURITY: this MVP has no Spring Security filter chain, so
    // SecurityContextHolder is always empty and cannot be used to authenticate.
    // We follow the same pattern as the rest of the app: the client sends the
    // userId, and we treat an unknown/missing user as unauthenticated -> 401.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Feedback submit(@RequestBody FeedbackRequest request) {
        if (request.userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to send feedback");
        }

        User user = userRepository.findById(request.userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to send feedback"));

        if (request.message == null || request.message.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Feedback message cannot be empty");
        }

        return feedbackService.submit(user, request.message.trim());
    }

    // JSON body for submitting feedback
    public static class FeedbackRequest {
        public Long userId;
        public String message;
    }
}
