package com.spoke.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.spoke.model.User;
import com.spoke.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

// Simple MVP authentication:
// - register: store the user with a BCrypt-hashed password
// - login: compare the given password against the stored hash
// - google: verify the JWT Google handed to the browser, then find-or-create
// There are no tokens or sessions — the frontend just remembers the
// returned user object. Good enough for an MVP, not for production.
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    // Turns a password into a one-way hash, and can check a password
    // against a hash. We never store or return the plain password.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Checks that a Google JWT really was signed by Google, and really was
    // issued for our app. Fetches and caches Google's public keys itself.
    private final GoogleIdTokenVerifier googleVerifier;

    public UserController(UserRepository userRepository,
                          @Value("${google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.googleVerifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
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

        // A Google account has no stored hash; matches() returns false for it,
        // so those users simply cannot log in through this form.
        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong email or password");
        }
        return user;
    }

    // POST /api/users/google with body { "credential": "<the JWT from the Google button>" }
    @PostMapping("/google")
    public User googleLogin(@RequestBody GoogleRequest request) {
        if (isBlank(request.credential)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google credential is required");
        }

        GoogleIdToken token;
        try {
            // Checks Google's signature, that the token was issued for our
            // client ID, and that it has not expired. Returns null if not.
            // Never trust the JWT's contents without this step: anyone can
            // write a token claiming any email, only Google can sign one.
            token = googleVerifier.verify(request.credential);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Could not verify the token with Google");
        }
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
        }

        GoogleIdToken.Payload payload = token.getPayload();
        // We match accounts by email below, so the address has to be one
        // Google actually vouches for — otherwise someone could sign up at
        // Google with another rider's address and take over their account.
        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your Google email address is not verified");
        }

        String email = payload.getEmail().trim().toLowerCase();
        String name = (String) payload.get("name");
        String displayName = isBlank(name) ? email : name; // Google does not always send a name

        // Log the rider in, or create the account on first sign-in.
        // Google accounts are stored without a password.
        return userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> userRepository.save(new User(displayName, email, null)));
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

    public static class GoogleRequest {
        public String credential;
    }
}
