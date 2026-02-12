# User API Spec

## Register User API

Enpoint : POST /api/users

Request Body : 

```json
{
    "username" : "eling",
    "password" : "rahasia",
    "name" : "Rancang Digital"
}
```

Response Body Success :

```json
{
    "data" : {
        "username" : "eling",
        "name": "Rancang Digital"
    },
}

```

Response Body Error : 
```json
{
    "errors" : "Username already registered"
}
```

## Login User API

Endpoint : POST /api/users/login

Request Body: 

```json
{
    "username": "eling",
    "password" : "rahasia",
}
```

Response Body Success : 

```json
{
    "data" : {
        "token": "unique token"
    }
}
```

Response Body Error :

```json
{
    "errors": "Username or password wrong"
}
```

## Update User API

Endpoint : PATCH /api/users/current

Headers :
- Authorization : token

Request Body : 

```json
{
    "name" : "Rancang Digital Lagi", // optional
    "password" : "new password", // optional
}
```

Response Body Success : 

```json
{
    "data" : {
        "username": "eling",
        "name" : "Rancang Digital Lagi"
    }
}
```

Response Body Error : 

```json
{
    "errors" : "Name length max 100"
}
```

## Get User API

Endpoint : GET /api/users/curent


Headers :
- Authorization : token

Response Body Success: 

```json
{
    "data" : {
        "username": "rahasia",
        "name" : "Rancang Digital"
    }
}
```

Response Body Error: 
 
 ```json
 {
    "errors": "Unauthorization"
 }
 ```


## Logout User API

Endpoint : DELETE /api/users/logout

Headers :
- Authorization : token

Response Body Success: 

```json
{
    "data" : "Ok"
}
```

Response Body Error : 

```json
{
    "errors": "Unauthorized"
}
```