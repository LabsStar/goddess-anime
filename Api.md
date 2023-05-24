
## API Reference

#### Get user

```http
  GET /api/users/${user_id}/${field}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `user_id` | `string` | **Required**. Discord User Id |
| `field` | `string` |  The key you want to get (avatar, banner, etc) |

#### Get cards

```http
  GET /api/cards/${card_id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` |  Id of card to fetch |

#### Get guilds

```http
  GET /api/guilds/${guild_id}/${field}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` |  Id of guild to fetch |
| `field`      | `string` |  The key you want to get (banner, icon, etc) |

#### Get news

```http
  GET /api/news/${news_id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `news_id`      | `string` |  Id of news to fetch |


#### Get badges

```http
  GET /api/badges/${badge_id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `badge_id`      | `string` |  Id of badge to fetch |

#### Apply Settings

```http
  POST /api/settings
```


#### Open Source Data

```http
  GET /api/open-source
```

#### Process Info

```http
  GET /api/process/${type}/${subtype}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `type`      | `string` |  Type of field to fetch |
| `subtype`      | `string` |  Subtype of field to fetch |