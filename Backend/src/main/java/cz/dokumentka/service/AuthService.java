package cz.dokumentka.service;

import cz.dokumentka.config.JwtUtil;
import cz.dokumentka.dto.LoginRequest;
import cz.dokumentka.dto.RegisterRequest;
import cz.dokumentka.entity.User;
import cz.dokumentka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registrace selhala - username již existuje: {}", request.getUsername());
            throw new RuntimeException("Uživatel s tímto jménem již existuje");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registrace selhala - email již existuje: {}", request.getEmail());
            throw new RuntimeException("Uživatel s tímto emailem již existuje");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);

        userRepository.save(user);
        log.info("Nový uživatel zaregistrován: {}", request.getUsername());

        return jwtUtil.generateToken(user.getUsername(), user.getRole().name());
    }

    public String login(LoginRequest request) {
        // Zkusíme najít uživatele podle username nebo emailu
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .orElseGet(() -> userRepository.findByEmail(request.getUsernameOrEmail())
                        .orElseThrow(() -> {
                            log.warn("Přihlášení selhalo - uživatel nenalezen: {}", request.getUsernameOrEmail());
                            return new RuntimeException("Nesprávné uživatelské jméno nebo heslo");
                        }));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Přihlášení selhalo - špatné heslo pro uživatele: {}", request.getUsernameOrEmail());
            throw new RuntimeException("Nesprávné uživatelské jméno nebo heslo");
        }

        log.info("Uživatel přihlášen: {}", user.getUsername());
        return jwtUtil.generateToken(user.getUsername(), user.getRole().name());
    }
}