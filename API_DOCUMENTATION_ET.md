# Notion Clone API dokumentatsioon

See dokument pakub põhjalikku dokumentatsiooni Notion Clone API kohta, mis on Node.js ja Express'iga loodud RESTful API ülesannete ja kasutajate haldamiseks.

## Baas URL

Kõik lõpp-punktid on suhtelised baas URL-i suhtes: `/`

## Autentimine

Enamik lõpp-punkte nõuavad autentimist JWT tokeni abil. Autentimiseks lisage token Authorization päisesse:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

JWT tokeni saate sisselogimisel läbi `/sessions` lõpp-punkti.

## Veakäsitlus

API kasutab standardseid HTTP olekukoode, et näidata päringute õnnestumist või ebaõnnestumist. Vea korral sisaldab vastuse keha üksikasju selle kohta, mis läks valesti.

Veavastuse näide:

```json
{
  "code": 400,
  "error": "Bad Request",
  "message": "Invalid input data"
}
```

## Lõpp-punktid

### Autentimine

#### Sisselogimine

```
POST /sessions
```

Kasutaja autentimine ja JWT tokeni saamine.

**Päringu keha:**

```json
{
  "username": "email@domain.com",
  "password": "mypassword"
}
```

**Vastused:**

- `200 OK`: Edukas sisselogimine
  ```json
  {
    "token": "jwt.token.example"
  }
  ```
- `401 Unauthorized`: Vigased sisselogimisandmed

#### Väljalogimine

```
DELETE /sessions
```

Kustutab praeguse kasutaja sessiooni.

**Autentimine nõutud**: Jah

**Vastused:**

- `204 No Content`: Sessioon edukalt kustutatud
- `401 Unauthorized`: Autentimine nõutud
- `500 Internal Server Error`: Serveri viga

### Kasutajad

#### Kasutaja loomine

```
POST /users
```

Uue kasutajakonto registreerimine.

**Päringu keha:**

```json
{
  "username": "email@domain.com",
  "password": "mypassword"
}
```

**Vastused:**

- `201 Created`: Kasutaja edukalt loodud
  ```json
  {
    "id": 1,
    "username": "email@domain.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
  ```
- `400 Bad Request`: Vigased sisendandmed
- `409 Conflict`: Kasutajanimi on juba olemas

#### Kõigi kasutajate loetelu

```
GET /users
```

Kõigi kasutajate loetelu hankimine.

**Autentimine nõutud**: Jah

**Vastused:**

- `200 OK`: Kasutajate loetelu
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
      "username": "another@domain.com",
      "createdAt": "2023-01-02T12:00:00Z",
      "updatedAt": "2023-01-02T12:00:00Z"
    }
  ]
  ```
- `401 Unauthorized`: Autentimine nõutud

#### Kasutaja hankimine ID järgi

```
GET /users/{userId}
```

Konkreetse kasutaja üksikasjaliku teabe hankimine.

**Parameetrid:**

- `userId` (tee, nõutud): Kasutaja ID

**Autentimine nõutud**: Jah

**Vastused:**

- `200 OK`: Kasutaja üksikasjad
  ```json
  {
    "id": 1,
    "username": "email@domain.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
  ```
- `401 Unauthorized`: Autentimine nõutud
- `404 Not Found`: Kasutajat ei leitud

#### Kasutaja uuendamine

```
PATCH /users/{userId}
```

Kasutaja teabe uuendamine (praegu ainult parool).

**Parameetrid:**

- `userId` (tee, nõutud): Kasutaja ID

**Päringu keha:**

```json
{
  "password": "newstrongpassword"
}
```

**Autentimine nõutud**: Jah

**Vastused:**

- `200 OK`: Kasutaja edukalt uuendatud
  ```json
  {
    "id": 1,
    "username": "email@domain.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T13:00:00Z"
  }
  ```
- `400 Bad Request`: Vigased sisendandmed
- `401 Unauthorized`: Autentimine nõutud
- `404 Not Found`: Kasutajat ei leitud

#### Kasutaja kustutamine

```
DELETE /users/{userId}
```

Kasutajakonto ja kõigi seotud ülesannete kustutamine.

**Parameetrid:**

- `userId` (tee, nõutud): Kasutaja ID

**Autentimine nõutud**: Jah

**Vastused:**

- `204 No Content`: Kasutaja edukalt kustutatud
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
- `401 Unauthorized`: Autentimine nõutud
- `403 Forbidden`: Luba puudub
- `404 Not Found`: Kasutajat ei leitud
- `500 Internal Server Error`: Serveri viga

### Ülesanded

#### Kõigi ülesannete loetelu

```
GET /tasks
```

Kõigi ülesannete loetelu hankimine koos leheküljestamise, sorteerimise ja filtreerimise võimalustega.

**Parameetrid:**

- `page` (päring, valikuline): Lehekülje number leheküljestamiseks (algab 1-st, vaikimisi: 1)
- `limit` (päring, valikuline): Elementide arv leheküljel (vaikimisi: 10)
- `sort` (päring, valikuline): Sorteerimisväli ja suund (nt title:asc, createdAt:desc)
- `status` (päring, valikuline): Ülesannete filtreerimine oleku järgi (pending, in_progress, completed)

**Autentimine nõutud**: Jah

**Vastused:**

- `200 OK`: Ülesannete loetelu
  ```json
  {
    "page": 1,
    "limit": 10,
    "total": 25,
    "tasks": [
      {
        "id": 1,
        "title": "Task title",
        "description": "Task description",
        "status": "pending",
        "user_id": 1,
        "createdAt": "2023-01-01T12:00:00Z",
        "updatedAt": "2023-01-01T12:00:00Z"
      },
      {
        "id": 2,
        "title": "Another task",
        "description": null,
        "status": "in_progress",
        "user_id": 1,
        "createdAt": "2023-01-02T12:00:00Z",
        "updatedAt": "2023-01-02T12:00:00Z"
      }
    ]
  }
  ```
- `400 Bad Request`: Vigased päringparameetrid
- `401 Unauthorized`: Autentimine nõutud
- `500 Internal Server Error`: Serveri viga

#### Ülesande loomine

```
POST /tasks
```

Uue ülesande loomine.

**Päringu keha:**

```json
{
  "title": "New task title",
  "description": "Detailed task description",
  "status": "pending"
}
```

**Autentimine nõutud**: Jah

**Vastused:**

- `201 Created`: Ülesanne edukalt loodud
  ```json
  {
    "id": 3,
    "title": "New task title",
    "description": "Detailed task description",
    "status": "pending",
    "user_id": 1,
    "createdAt": "2023-01-03T12:00:00Z",
    "updatedAt": "2023-01-03T12:00:00Z"
  }
  ```
- `400 Bad Request`: Vigased sisendandmed
- `401 Unauthorized`: Autentimine nõutud
- `500 Internal Server Error`: Serveri viga

#### Ülesande uuendamine

```
PATCH /tasks/{taskId}
```

Olemasoleva ülesande väljade uuendamine.

**Parameetrid:**

- `taskId` (tee, nõutud): Muudetava ülesande ID

**Päringu keha:**

```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "status": "in_progress"
}
```

**Autentimine nõutud**: Jah

**Vastused:**

- `200 OK`: Ülesanne edukalt uuendatud
  ```json
  {
    "id": 3,
    "title": "Updated task title",
    "description": "Updated task description",
    "status": "in_progress",
    "user_id": 1,
    "createdAt": "2023-01-03T12:00:00Z",
    "updatedAt": "2023-01-03T13:00:00Z"
  }
  ```
- `400 Bad Request`: Vigased sisendandmed
- `401 Unauthorized`: Autentimine nõutud
- `403 Forbidden`: Luba puudub
- `404 Not Found`: Ülesannet ei leitud
- `500 Internal Server Error`: Serveri viga

#### Ülesande kustutamine

```
DELETE /tasks/{taskId}
```

Konkreetse ülesande kustutamine ID järgi.

**Parameetrid:**

- `taskId` (tee, nõutud): Kustutatava ülesande ID

**Autentimine nõutud**: Jah

**Vastused:**

- `204 No Content`: Ülesanne edukalt kustutatud
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```
- `401 Unauthorized`: Autentimine nõutud
- `403 Forbidden`: Luba puudub
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
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "user_id": 1,
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:00:00Z"
}
```

### Ülesande olek

Ülesannetel võib olla üks järgmistest olekutest:

- `pending`: Ülesanne ootab alustamist
- `in_progress`: Ülesannet täidetakse praegu
- `completed`: Ülesanne on lõpetatud