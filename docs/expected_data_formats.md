# Expected Data Formats

## Class Diagram
```
[
    {
        "id": "List",
        "parentIds": ["Object", "Collection"],
        "functions": [...],
        "contributors":[...]
    },
    {
        "id": "Object",
        "parentIds": [],
        "functions": [...],
        "contributors":[...]
    },
    {
        "id": "Collection",
        "parentIds": ["Object"],
        "functions": [...],
        "contributors":[...]
    },
    {
        "id": "ArrayList",
        "parentIds": ["List", "Object", "Collection"],
        "functions": [...],
        "contributors":[...]
    },
    {
        "id": "LinkedList",
        "parentIds": ["List", "Collection", "Object"],
        "functions": [...],
        "contributors":[...]
    },
    {
        "id": "Map",
        "parentIds": ["Object"],
        "functions": [...],
        "contributors":[...]
    },
    {
        "id": "AbstractMap",
        "parentIds": ["Map"],
        "functions": [...],
        "contributors":[...]
    },
    {
        "id": "HashMap",
        "parentIds": ["AbstractMap"],
        "functions": [...],
        "contributors":[...]
    }
]
```

## User Dictionary
```
{
    "users_location": {
        "username_here": {
            "username": "username_here,
            "name": "Name Here"
            "avatar_url": "http://somethinghere.com",
            "location": {
                "name": "San Francisco",
                "lat": 37.773972,
                "lng": 122.431297
            }
            ... # list all possible information
        },
        "another_username_here": {
            "username": "username_here,
            "name": "Name Here"
            "avatar_url": "http://somethinghere.com",
            "location": {
                "name": "Vancouver, BC",
                "lat": 49.246292,
                "lng": 123.116226
            }
            ... # list all possible information
        }
    },
    "users_no_location": {
        "username_here": {
            "username": "username_here,
            "name": "Name Here"
            "avatar_url": "http://somethinghere.com",
            "location": null
            ... # list all possible information
        }
    }
}
```