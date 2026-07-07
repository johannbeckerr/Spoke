package com.spoke.repository;

import com.spoke.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Spring Data JPA writes the implementation for us: save(), findAll(),
// findById(), delete()... We only declare the extra query we need, and
// Spring derives the SQL from the method name.
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);
}
