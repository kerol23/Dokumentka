package cz.dokumentka.controller;

import cz.dokumentka.dto.LoginRequest;
import cz.dokumentka.dto.RegisterRequest;
import cz.dokumentka.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Požadavek na registraci uživatele: {}", request.getUsername());

        String token = authService.register(request);

        return ResponseEntity.ok(token);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequest request) {
        log.info("Požadavek na přihlášení: {}", request.getUsernameOrEmail());

        String token = authService.login(request);

        return ResponseEntity.ok(token);
    }
}