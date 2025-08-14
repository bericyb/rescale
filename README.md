# Rescale Take Home Assignment

## Performance Considerations
While writing this code, the primary focus on performance was surrounding the handling of large datasets in the frontend specifically.

### Frontend
The frontend was built using Next.js and React. The main performance considerations were around the rendering of large datasets. To handle this, I implemented virtualized scrolling and react-query/tan-query to optimize data fetching and caching. The virtualized scrolling allows us to only render the items that are currently visible in the viewport, which significantly reduces the number of DOM nodes and improves performance when dealing with large lists. Additionally, react-query/tan-query provides caching and background fetching with mutations support which allows us to optimisitically update the UI without having to refetch the entire dataset.

### Backend
The only real backend optimization was the use of was the connection pooling in the database settings. If I was focusing more on the backend, I would have dived deeper into the sql queries that the ORM generates and tried to optimize them further. Since djangorestframework offered cursor pagination, I opted to use that for the virtualized scrolling on the frontend with the sacrifice that we would not be able to do any filtering and sorting easily. If I had more time, I would have implemented a separate endpoint that provided optimized queries for filtering and sorting.

## AI Usage
For this project, I used OpenCode an opensource project similar to ClaudeCode with Claude Sonnet 4 but with LSP support.
I only used it after familiarizing myself with django and setting up the dependencies that I wanted. Along the way, if there were small stylistic changes or errors I would fix them myself.
Here are the sessions for implementing the different parts of the project: 
(Implmenting cursor pagination using django-rest-framework)[https://opencode.ai/s/yQmaISIu]
(Implementing the frontend CRUD operation UIs for jobs)[https://opencode.ai/s/RUZXe8N5]

