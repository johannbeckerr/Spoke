package com.spoke.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.spoke.model.User;
import com.spoke.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;
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

    // GET /api/users/{id} — the frontend calls this when it starts, to check
    // that a login remembered in the browser still points at a real account.
    // The dev database lives in memory and is empty after every restart, so
    // remembered users can go stale; a 404 tells the frontend to log out.
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    // PUT /api/users/{id} with body { "ridingStyle", "bikePhoto" }.
    // ridingStyle: blank clears it. bikePhoto: a downscaled image data URL
    // from the phone's picker; omitted or null means "keep the current one".
    // There are no sessions in this MVP, so the server trusts the id the
    // client sends — the same posture as the rest of the API.
    @PutMapping("/{id}")
    public User updateProfile(@PathVariable Long id, @RequestBody ProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRidingStyle(blankToNull(request.ridingStyle));

        if (request.bikePhoto != null) {
            // Must be a real image data URL — the bike-photo endpoint below
            // decodes this format and nothing else.
            if (!request.bikePhoto.startsWith("data:image/")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The bike photo must be an image");
            }
            // The app downscales before uploading, so this only triggers when
            // someone bypasses the app; it also protects the column size.
            if (request.bikePhoto.length() > 500_000) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "That photo is too large");
            }
            user.setBikePhoto(request.bikePhoto);
        }
        return userRepository.save(user);
    }

    // GET /api/users/{id}/bike-photo — the raw image bytes. The photo is
    // deliberately absent from all JSON (see User.bikePhoto); an <img> tag
    // pointed here loads it on demand, only when a profile is opened.
    @GetMapping("/{id}/bike-photo")
    public ResponseEntity<byte[]> bikePhoto(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String data = user.getBikePhoto();
        if (data == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This rider has no bike photo");
        }

        // Stored as "data:image/jpeg;base64,<bytes>" — split it back apart
        String mime = data.substring("data:".length(), data.indexOf(';'));
        byte[] bytes = Base64.getDecoder().decode(data.substring(data.indexOf(',') + 1));
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(mime)).body(bytes);
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
        String picture = (String) payload.get("picture"); // may be null

        // Log the rider in, or create the account on first sign-in.
        // Google accounts are stored without a password.
        return userRepository.findByEmailIgnoreCase(email)
                .map(existing -> {
                    // Keep the stored photo in step with Google. This also
                    // backfills accounts created before photos were stored.
                    if (picture != null && !picture.equals(existing.getPictureUrl())) {
                        existing.setPictureUrl(picture);
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    User created = new User(displayName, email, null);
                    created.setPictureUrl(picture);
                    return userRepository.save(created);
                });
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    // "  " and "" both mean "not set" — store them as null, not as noise
    private String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
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

    public static class ProfileRequest {
        public String ridingStyle;
        public String bikePhoto;
    }
}
