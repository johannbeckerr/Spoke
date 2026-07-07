package com.spoke.controller;

import com.spoke.model.User;
import com.spoke.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

// Simple MVP authentication:
// - register: store the user with a BCrypt-hashed password
// - login: compare the given password against the stored hash
// There are no tokens or sessions — the frontend just remembers the
// returned user object. Good enough for an MVP, not for production.
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    // Turns a password into a one-way hash, and can check a password
    // against a hash. We never store or return the plain password.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // POST /api/users/register with body { "name": "Ana", "email": "ana@mail.com", "password": "secret" }
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public User register(@RequestBody RegisterRequest request) {
        if (isBlank(request.name) || isBlank(request.email) || isBlank(request.password)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name, email and password are required");
        }

        String email = request.email.trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already registered");
        }

        String hashedPassword = passwordEncoder.encode(request.password);
        return userRepository.save(new User(request.name.trim(), email, hashedPassword));
    }

    // POST /api/users/login with body { "email": "ana@mail.com", "password": "secret" }
    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        if (isBlank(request.email) || isBlank(request.password)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        // Same error for "unknown email" and "wrong password", so an
        // attacker can't probe which emails have accounts.
        User user = userRepository.findByEmailIgnoreCase(request.email.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong email or password"));

        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong email or password");
        }
        return user;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    // Tiny classes describing the JSON request bodies.
    // Jackson (Spring's JSON library) fills the public fields automatically.
    public static class RegisterRequest {
        public String name;
        public String email;
        public String password;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }
}
