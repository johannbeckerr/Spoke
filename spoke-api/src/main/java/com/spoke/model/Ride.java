package com.spoke.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

// A ride event. It has one creator and many participants (and a user can
// participate in many rides — hence the Many-to-Many join table).
@Entity
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String startPoint;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    // Kept as plain strings for simplicity; the frontend dropdowns
    // constrain the values (Road/MTB/Gravel/City, Beginner/Intermediate/Advanced)
    @Column(nullable = false)
    private String rideType;

    @Column(nullable = false)
    private String pace;

    // Coordinates of the start and end points, captured from the location
    // autocomplete. Nullable — older rides and hand-typed locations have none.
    private Double origin_lat;
    private Double origin_lon;
    private Double destination_lat;
    private Double destination_lon;

    // The user who created the ride
    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    // Everyone who joined. This creates the "ride_participants" join table
    // with two columns: ride_id and user_id.
    @ManyToMany
    @JoinTable(
            name = "ride_participants",
            joinColumns = @JoinColumn(name = "ride_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> participants = new LinkedHashSet<>();

    public Ride() {
    }

    // --- getters and setters ---

    public Long getId() {
        return id;
    }

    public String getStartPoint() {
        return startPoint;
    }

    public void setStartPoint(String startPoint) {
        this.startPoint = startPoint;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getRideType() {
        return rideType;
    }

    public void setRideType(String rideType) {
        this.rideType = rideType;
    }

    public String getPace() {
        return pace;
    }

    public void setPace(String pace) {
        this.pace = pace;
    }

    public Double getOrigin_lat() {
        return origin_lat;
    }

    public void setOrigin_lat(Double origin_lat) {
        this.origin_lat = origin_lat;
    }

    public Double getOrigin_lon() {
        return origin_lon;
    }

    public void setOrigin_lon(Double origin_lon) {
        this.origin_lon = origin_lon;
    }

    public Double getDestination_lat() {
        return destination_lat;
    }

    public void setDestination_lat(Double destination_lat) {
        this.destination_lat = destination_lat;
    }

    public Double getDestination_lon() {
        return destination_lon;
    }

    public void setDestination_lon(Double destination_lon) {
        this.destination_lon = destination_lon;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public Set<User> getParticipants() {
        return participants;
    }
}
