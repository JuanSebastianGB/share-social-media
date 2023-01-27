## Share Social Media fullstack application

![enter image description here](https://github.com/JuanSebastianGB/infinite-scroll-v2/blob/main/Sin%20t%C3%ADtulo.png?raw=true)

> Share social media is a javascript fullstack application that implements a Social Media Website, consisting of a complete Login/Registration system, User Profile system, of the owners and the other users , and Post system Managment System including Comments.

![enter image description here](https://github.com/JuanSebastianGB/infinite-scroll-v2/blob/main/structure.png?raw=true)

### Features ☆*: .｡. o(≧▽≦)o .｡.:*☆

- ✅ Post Home page
- ✅ Profile page
- ✅ Create and list Posts
- ✅ Infinite scroll
- ✅ Add Friend
- ✅ Like Posts
- ✅ Comment posts.

### Installation in development mode

**backend**

    $ cd / server
    $ pnpm start

**frontend**

    $ cd / client
    $ pnpm dev

### Required environment variables

**backend**

    PORT=<port were server is gonna work>
    DB_URI=<mongodb+srv>
    PUBLIC_URL= : ex. http:localhost:5000
    JWT_SECRET=<random tring to token generation>
    DEFAULT_IMAGE_ID=<a default mongo storage id must be provided>

**frontend**

    VITE_APP_BASE_URL=<URL : ex. http:localhost:5000>
    VITE_APP_DEFAULT_IMAGE_ID=<a default mongo storage id must be provided>

## Structure

**backend** 🕶️

> MVC pattern

- controllers
- models
- routes
- services
- storage
- validators
- utilities
- middleweares
- database

**frontend**

> Clean Architecture 🗒️

- models
- components
- pages
- hooks
- services
- utilities
- styled-components
- redux
- interceptors
- adapters
- constants

## Future Improvements 🕚

- Improve the user interface to make it as friendly as possible.
- Implement registration using google or facebook.
- Implement bookmarks or favorites of posts or specific content.
- Implement features where notifications to the user are contemplated, configuration options, editing and customization of the profile.
- Implement websockets for chat section.
- Implement SWR (stale while revalidate) to always have the most up-to-date information.

## Authors

Sebastian Gonzalez | [GitHub](https://github.com/JuanSebastianGB)
