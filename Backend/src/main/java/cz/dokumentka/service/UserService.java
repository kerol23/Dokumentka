package cz.dokumentka.service;

import cz.dokumentka.dto.UpdateProfileRequest;
import cz.dokumentka.entity.User;
import cz.dokumentka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Uživatel nenalezen"));

        // Změna emailu
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Tento email je již používán");
            }
            user.setEmail(request.getEmail());
            log.info("Email updated for user: {}", username);
        }

        // Změna uživatelského jména
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Toto uživatelské jméno je již používáno");
            }
            user.setUsername(request.getUsername());
            log.info("Username updated for user: {}", username);
        }

        // Změna hesla
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null ||
                    !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Současné heslo není správné");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            log.info("Password updated for user: {}", username);
        }

        userRepository.save(user);
    }
}