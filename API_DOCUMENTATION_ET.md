# Notion Clone API Dokumentatsioon

See dokument pakub põhjalikku dokumentatsiooni Notion Clone API kohta, mis on Node.js, Express ja MariaDB abil loodud
RESTful API ülesannete ja kasutajate haldamiseks.

## Baas URL

Kõik lõpp-punktid on relatiivsed baas URL-i suhtes: `http://localhost:5001`

## Autentimine

Enamik lõpp-punkte nõuavad JWT tokeni abil autentimist. Autentimiseks lisage token Authorization päisesse:

```
Authorization: Bearer SINU_JWT_TOKEN
```

JWT tokeni saab `/sessions` lõpp-punkti kaudu sisse logides. Token kehtib 7 päeva.

## Veakäsitlus

API kasutab päringute õnnestumise või ebaõnnestumise näitamiseks standardseid HTTP olekukoode. Vea korral sisaldab
vastuse keha teavet selle kohta, mis läks valesti.

Veavastuse näide:

```json
{
  "code": 400,
  "error": "Bad Request",
  "message": "Kehtetud sisendandmed"
}
```

## Lõpp-punktid

### Autentimine

#### Sisselogimine

```
POST /sessions
```

Autendib kasutaja ja tagastab JWT tokeni.

**Päringu keha:**

```json
{
  "username": "email@domain.com",
  "password": "minuparool"
}
```

**Vastused:**

- `200 OK`: Edukas sisselogimine
  ```json
  {
    "token": "jwt.token.näidis"
  }
  ```
- `401 Unauthorized`: Kehtetud kredentsiaalid

#### Väljalogimine

```
DELETE /sessions
```

Logib praeguse kasutaja välja. Pange tähele, et JWT tokenid on olekuta, seega see lõpp-punkt lihtsalt tagastab eduka
vastuse. Klient peaks tokeni kõrvale heitma.

**Autentimine vajalik**: Jah

**Vastused:**

- `204 No Content`: Väljalogimine õnnestus
- `401 Unauthorized`: Autentimine on vajalik
- `500 Internal Server Error`: Serveri viga

### Kasutajad

#### Kasutaja loomine

```
POST /users
```

Registreerib uue kasutajakonto.

**Päringu keha:**

```json
{
  "username": "email@domain.com",
  "password": "minuparool"
}
```

**Vastused:**

- `201 Created`: Kasutaja on edukalt loodud
  ```json
  {
    "id": 1,
    "username": "email@domain.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
  ```
- `400 Bad Request`: Kehtetud sisendandmed
- `409 Conflict`: Kasutajanimi on juba olemas

#### Kõigi kasutajate loetlemine

```
GET /users
```

Saab kõigi kasutajate nimekirja.

**Autentimine vajalik**: Jah

**Vastused:**

- `200 OK`: Kasutajate nimekiri
  ```json
  [
    {
      "id": 1,
      "username": "email@domain.com",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z"
    },
    {
      "id": 2,
      "username": "teine@domain.com",
      "createdAt": "2023-01-02T12:00:00Z",
      "updatedAt": "2023-01-02T12:00:00Z"
    }
  ]
  ```
- `401 Unauthorized`: Autentimine on vajalik

#### Kasutaja hankimine ID järgi

```
GET /users/{userId}
```

Saab üksikasjalikku teavet konkreetse kasutaja kohta.

**Parameetrid:**

- `userId` (tee, nõutav): Kasutaja ID

**Autentimine vajalik**: Jah

**Vastused:**

- `200 OK`: Kasutaja andmed
  ```json
  {
    "id": 1,
    "username": "email@domain.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
  ```
- `401 Unauthorized`: Autentimine on vajalik
- `404 Not Found`: Kasutajat ei leitud

#### Kasutaja uuendamine

```
PATCH /users/{userId}
```

Uuendab kasutaja teavet (praegu ainult parooli).

**Parameetrid:**

- `userId` (tee, nõutav): Kasutaja ID

**Päringu keha:**

```json
{
  "password": "uustugevparool"
}
```

**Autentimine vajalik**: Jah

**Vastused:**

- `200 OK`: Kasutaja on edukalt uuendatud
  ```json
  {
    "id": 1,
    "username": "email@domain.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T13:00:00Z"
  }
  ```
- `400 Bad Request`: Kehtetud sisendandmed
- `401 Unauthorized`: Autentimine on vajalik
- `404 Not Found`: Kasutajat ei leitud

#### Kasutaja kustutamine

```
DELETE /users/{userId}
```

Kustutab kasutajakonto ja kõik seotud ülesanded.

**Parameetrid:**

- `userId` (tee, nõutav): Kasutaja ID

**Autentimine vajalik**: Jah

**Vastused:**

- `200 OK`: Kasutaja on edukalt kustutatud
  ```json
  {
    "message": "Kasutaja edukalt kustutatud"
  }
  ```
- `401 Unauthorized`: Autentimine on vajalik
- `403 Forbidden`: Luba on keelatud
- `404 Not Found`: Kasutajat ei leitud
- `500 Internal Server Error`: Serveri viga

### Ülesanded

#### Kõigi ülesannete loetlemine

```
GET /tasks
```

Saab kõigi ülesannete nimekirja koos lehekülje, sorteerimise ja filtreerimise võimalustega.

**Parameetrid:**

- `page` (päring, valikuline): Lehekülje number leheküljenduse jaoks (algab 1-st, vaikimisi: 1)
- `limit` (päring, valikuline): Üksuste arv lehekülje kohta (vaikimisi: 10)
- `sort` (päring, valikuline): Sorteerimisvärv ja suund (nt title:asc, createdAt:desc)
- `status` (päring, valikuline): Filtreeri ülesanded oleku järgi (pending, in_progress, completed)

**Autentimine vajalik**: Jah

**Vastused:**

- `200 OK`: Ülesannete nimekiri
  ```json
  {
    "page": 1,
    "limit": 10,
    "total": 25,
    "tasks": [
      {
        "id": 1,
        "title": "Ülesande pealkiri",
        "description": "Ülesande kirjeldus",
        "status": "pending",
        "user_id": 1,
        "createdAt": "2023-01-01T12:00:00Z",
        "updatedAt": "2023-01-01T12:00:00Z"
      },
      {
        "id": 2,
        "title": "Teine ülesanne",
        "description": null,
        "status": "in_progress",
        "user_id": 1,
        "createdAt": "2023-01-02T12:00:00Z",
        "updatedAt": "2023-01-02T12:00:00Z"
      }
    ]
  }
  ```
- `400 Bad Request`: Kehtetud päringu parameetrid
- `401 Unauthorized`: Autentimine on vajalik
- `500 Internal Server Error`: Serveri viga sõnumiga "Ülesannete hankimine ebaõnnestus"

#### Ülesande loomine

```
POST /tasks
```

Loob uue ülesande.

**Päringu keha:**

```json
{
  "title": "Uue ülesande pealkiri",
  "description": "Üksikasjalik ülesande kirjeldus",
  "status": "pending"
}
```

**Autentimine vajalik**: Jah

**Vastused:**

- `201 Created`: Ülesanne on edukalt loodud
  ```json
  {
    "success": true,
    "message": "Ülesanne edukalt loodud",
    "taskId": 3,
    "title": "Uue ülesande pealkiri",
    "description": "Üksikasjalik ülesande kirjeldus",
    "status": "pending"
  }
  ```
- `400 Bad Request`: Kehtetud sisendandmed
- `401 Unauthorized`: Autentimine on vajalik
- `500 Internal Server Error`: Serveri viga

#### Ülesande uuendamine

```
PATCH /tasks/{taskId}
```

Uuendab olemasoleva ülesande välju.

**Parameetrid:**

- `taskId` (tee, nõutav): Muudetava ülesande ID

**Päringu keha:**

```json
{
  "title": "Uuendatud ülesande pealkiri",
  "description": "Uuendatud ülesande kirjeldus",
  "status": "in_progress"
}
```

**Autentimine vajalik**: Jah

**Vastused:**

- `200 OK`: Ülesanne on edukalt uuendatud
  ```json
  {
    "id": 3,
    "title": "Uuendatud ülesande pealkiri",
    "description": "Uuendatud ülesande kirjeldus",
    "status": "in_progress",
    "user_id": 1,
    "createdAt": "2023-01-03T12:00:00Z",
    "updatedAt": "2023-01-03T13:00:00Z"
  }
  ```
- `400 Bad Request`: Kehtetud sisendandmed
- `401 Unauthorized`: Autentimine on vajalik
- `403 Forbidden`: Luba on keelatud
- `404 Not Found`: Ülesannet ei leitud
- `500 Internal Server Error`: Serveri viga

#### Ülesande kustutamine

```
DELETE /tasks/{taskId}
```

Kustutab konkreetse ülesande ID järgi.

**Parameetrid:**

- `taskId` (tee, nõutav): Kustutatava ülesande ID

**Autentimine vajalik**: Jah

**Vastused:**

- `200 OK`: Ülesanne on edukalt kustutatud
  ```json
  {
    "message": "Ülesanne edukalt kustutatud"
  }
  ```
- `401 Unauthorized`: Autentimine on vajalik
- `403 Forbidden`: Luba on keelatud
- `404 Not Found`: Ülesannet ei leitud
- `500 Internal Server Error`: Serveri viga

## Andmemudelid

### Kasutaja

```json
{
  "id": 1,
  "username": "email@domain.com",
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:00:00Z"
}
```

### Ülesanne

```json
{
  "id": 1,
  "title": "Ülesande pealkiri",
  "description": "Ülesande kirjeldus",
  "status": "pending",
  "user_id": 1,
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:00:00Z"
}
```

### Ülesande olek

Ülesannetel võib olla üks järgmistest olekutest:

- `pending`: Ülesanne ootab alustamist
- `in_progress`: Ülesannet tehakse praegu
- `completed`: Ülesanne on lõpetatud