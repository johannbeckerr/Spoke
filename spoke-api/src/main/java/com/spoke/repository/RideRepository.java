package com.spoke.repository;

import com.spoke.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {

    // "Order by date, soonest first" — derived from the method name
    List<Ride> findAllByOrderByDateTimeAsc();
}
