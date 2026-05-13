# Dokumentka 📄

Backendová aplikace pro správu osobních dokumentů. Umožňuje ukládání, kategorizaci a vyhledávání dokumentů s podporou nahrávání souborů (PDF, fotky).

## Technologie
- Java 17
- Spring Boot 
- Spring Security + JWT
- Spring Data JPA
- MySQL Database
- Lombok
- Swagger / OpenAPI

## Architektura Projektu

```text
src/main/java/cz/dokumentka
├── controller
├── service
├── repository
├── entity
├── dto
├── config
├── exception
```

## Spuštění aplikace

### Požadavky
- Java 17
- Maven

### Kroky
1. Naklonuj repozitář
2. Otevři projekt v IntelliJ IDEA
3. Spusť `DokumentkaApplication.java`
4. Aplikace běží na `http://localhost:8080`

## API Dokumentace
Swagger UI: `http://localhost:8080/swagger-ui/index.html`

## Hlavní endpointy

### Autentizace
| Metoda | URL | Popis |
|--------|-----|-------|
| POST | /api/auth/register | Registrace uživatele |
| POST | /api/auth/login | Přihlášení |

### Dokumenty
| Metoda | URL | Popis |
|--------|-----|-------|
| GET | /api/documents | Seznam dokumentů |
| GET | /api/documents/{id} | Detail dokumentu |
| POST | /api/documents | Vytvoření dokumentu |
| PUT | /api/documents/{id} | Úprava dokumentu |
| DELETE | /api/documents/{id} | Smazání dokumentu |
| GET | /api/documents/search?query= | Vyhledávání |
| GET | /api/documents/paged | Stránkování |
| POST | /api/documents/{id}/upload | Nahrání souboru |
| GET | /api/documents/{id}/download | Stažení souboru |

### Uživatel
| Metoda | URL | Popis |
|--------|-----|-------|
| GET | /api/user/me | Info o uživateli |
| PUT | /api/user/me | Úprava profilu |
| POST | /api/user/upgrade | Upgrade na Premium |
| POST | /api/user/downgrade | Přepnutí na Basic |
| DELETE | /api/user/me | Smazání účtu |

## Bezpečnost
- JWT autentizace
- Role: USER, ADMIN
- Plány: BASIC (max 10 dokumentů), PREMIUM (neomezeno)

## Kategorie dokumentů
- FAKTURY
- PRACE
- POJISTENI
- BANKA
- ZDRAVOTNI
- SKOLA
- OSTATNI

## Databáze

Aplikace používá MySQL databázi.

V application.properties nastav:
- username
- password
- název databáze

Příklad:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/dokumentka
```