package com.spoke.controller;

import com.spoke.model.Ride;
import com.spoke.model.User;
import com.spoke.repository.RideRepository;
import com.spoke.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    public RideController(RideRepository rideRepository, UserRepository userRepository) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
    }

    // GET /api/rides — the feed, soonest ride first
    @GetMapping
    public List<Ride> getAllRides() {
        return rideRepository.findAllByOrderByDateTimeAsc();
    }

    // POST /api/rides — create a ride. The creator joins automatically.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ride createRide(@RequestBody CreateRideRequest request) {
        User creator = findUser(request.creatorId);

        Ride ride = new Ride();
        ride.setStartPoint(request.startPoint);
        ride.setDestination(request.destination);
        // The frontend sends "2026-07-10T18:30" (from <input type="datetime-local">),
        // which LocalDateTime parses directly.
        ride.setDateTime(LocalDateTime.parse(request.dateTime));
        ride.setRideType(request.rideType);
        ride.setPace(request.pace);
        ride.setOrigin_lat(request.origin_lat);
        ride.setOrigin_lon(request.origin_lon);
        ride.setDestination_lat(request.destination_lat);
        ride.setDestination_lon(request.destination_lon);
        ride.setCreator(creator);
        ride.getParticipants().add(creator);

        return rideRepository.save(ride);
    }

    // POST /api/rides/5/join/2 — user 2 joins ride 5
    @PostMapping("/{rideId}/join/{userId}")
    public Ride joinRide(@PathVariable Long rideId, @PathVariable Long userId) {
        Ride ride = findRide(rideId);
        User user = findUser(userId);

        // participants is a Set, so joining twice has no effect
        ride.getParticipants().add(user);
        return rideRepository.save(ride);
    }

    // POST /api/rides/5/leave/2 — user 2 leaves ride 5
    @PostMapping("/{rideId}/leave/{userId}")
    public Ride leaveRide(@PathVariable Long rideId, @PathVariable Long userId) {
        Ride ride = findRide(rideId);
        User user = findUser(userId);

        ride.getParticipants().remove(user);
        return rideRepository.save(ride);
    }

    // DELETE /api/rides/5?userId=2 — remove a ride, allowed only for its creator.
    // (Without real sessions the backend trusts the userId the frontend sends.
    // Fine for this MVP; token-based auth would derive the user server-side.)
    @DeleteMapping("/{rideId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRide(@PathVariable Long rideId, @RequestParam Long userId) {
        Ride ride = findRide(rideId);

        if (ride.getCreator() == null || !ride.getCreator().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator can delete this ride");
        }

        // Deleting the ride also removes its ride_participants rows,
        // because the Ride entity owns that join table.
        rideRepository.delete(ride);
    }

    // --- small helpers that turn "not found" into a proper 404 response ---

    private Ride findRide(Long id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride not found: " + id));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
    }

    // JSON body for creating a ride
    public static class CreateRideRequest {
        public String startPoint;
        public String destination;
        public String dateTime;
        public String rideType;
        public String pace;
        public Long creatorId;
        // Optional — present only when the location was picked from the autocomplete
        public Double origin_lat;
        public Double origin_lon;
        public Double destination_lat;
        public Double destination_lon;
    }
}
