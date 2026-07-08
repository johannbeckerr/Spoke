package com.spoke.service;

import com.spoke.model.Feedback;
import com.spoke.model.User;
import com.spoke.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

// Persists feedback. Stamps createdAt and the initial status so the
// controller stays thin and only deals with the HTTP layer.
@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public Feedback submit(User user, String message) {
        Feedback feedback = new Feedback(user, message, LocalDateTime.now(), "NEW");
        return feedbackRepository.save(feedback);
    }
}
