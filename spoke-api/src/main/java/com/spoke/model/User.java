package com.spoke.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// A cyclist. The email is the login identity; the name is what other
// riders see. The table is called "users" because "user" is a reserved
// word in PostgreSQL.
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // BCrypt hash of the password — never the plain text.
    // @JsonIgnore makes sure it is never sent to the browser either.
    // Null for accounts created through Google sign-in: those users have
    // no password here, and can only log in through Google.
    @JsonIgnore
    @Column
    private String password;

    // URL of the rider's Google profile photo, taken from the verified
    // Google token. Null for password accounts (and for Google accounts
    // without a photo) — the frontend shows an initial-letter avatar then.
    @Column
    private String pictureUrl;

    // Optional profile extras, filled in by the rider on the Profile
    // screen and shown in the mini-profile other riders can open.
    @Column
    private String ridingStyle; // free text, e.g. "Social & Coffee"

    // The rider's bike photo, stored as the data-URL string the phone
    // uploads (the app downscales it client-side to keep it small).
    // @JsonIgnore keeps the big base64 blob out of every JSON response —
    // a photo inside each ride's participant list would balloon the feed.
    // The frontend loads it through GET /users/{id}/bike-photo instead,
    // and hasBikePhoto (below) tells it whether that is worth doing.
    @JsonIgnore
    @Column(length = 500000)
    private String bikePhoto;

    // Serialized as "hasBikePhoto": the lightweight stand-in for the blob
    public boolean isHasBikePhoto() {
        return bikePhoto != null;
    }

    // JPA needs an empty constructor to build objects from database rows
    public User() {
    }

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }

    public String getRidingStyle() {
        return ridingStyle;
    }

    public void setRidingStyle(String ridingStyle) {
        this.ridingStyle = ridingStyle;
    }

    public String getBikePhoto() {
        return bikePhoto;
    }

    public void setBikePhoto(String bikePhoto) {
        this.bikePhoto = bikePhoto;
    }
}
