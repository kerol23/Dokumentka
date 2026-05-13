package cz.dokumentka.controller;

import cz.dokumentka.config.JwtUtil;
import cz.dokumentka.dto.UpdateProfileRequest;
import cz.dokumentka.entity.User;
import cz.dokumentka.repository.UserRepository;
import cz.dokumentka.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import cz.dokumentka.repository.DocumentRepository;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final DocumentRepository documentRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Uživatel nenalezen"));

        return ResponseEntity.ok(new UserInfoResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getPlan().name()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        userService.updateProfile(username, request);

        // Najdi uživatele pod novým username pokud se změnilo
        String newUsername = (request.getUsername() != null && !request.getUsername().isBlank())
                ? request.getUsername()
                : username;

        User user = userRepository.findByUsername(newUsername)
                .orElseThrow(() -> new RuntimeException("Uživatel nenalezen"));

        // Vrať nový token
        String newToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        log.info("Profil upraven: {}", newUsername);
        return ResponseEntity.ok(newToken);
    }

    @PostMapping("/upgrade")
    public ResponseEntity<?> upgradeToPremium() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Uživatel nenalezen"));

        if (user.getPlan() == User.Plan.PREMIUM) {
            return ResponseEntity.badRequest().body("Již máte Premium plán!");
        }

        user.setPlan(User.Plan.PREMIUM);
        userRepository.save(user);
        log.info("User {} upgraded to Premium", username);
        return ResponseEntity.ok("Gratulujeme! Váš účet byl upgradován na Premium plán.");
    }

    @PostMapping("/downgrade")
    public ResponseEntity<?> downgradeToBasic() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Uživatel nenalezen"));

        if (user.getPlan() == User.Plan.BASIC) {
            return ResponseEntity.badRequest().body("Již máte Basic plán!");
        }

        user.setPlan(User.Plan.BASIC);
        userRepository.save(user);
        log.info("User {} downgraded to Basic", username);
        return ResponseEntity.ok("Účet byl přepnut na Basic plán.");
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(@RequestBody DeleteAccountRequest request) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Uživatel nenalezen"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Nesprávné heslo");
        }

        // Smaž nejdřív všechny dokumenty uživatele
        documentRepository.deleteAll(documentRepository.findByOwner(user));

        userRepository.delete(user);
        log.info("Účet smazán: {}", username);
        return ResponseEntity.ok("Účet byl úspěšně smazán");
    }

    record DeleteAccountRequest(String currentPassword) {}

    record UserInfoResponse(String username, String email, String role, String plan) {}
}